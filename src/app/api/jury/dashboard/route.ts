import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: Request) {
  try {
    // 1. Récupération du token depuis les cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      ?.split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Décodage du token
    const { payload } = await jwtVerify(token, SECRET);
    const juryId = payload.id;
    const role = payload.role;

    // Ajusté au cas où ton rôle en BDD est 'enseignant' ou 'jury'
    if (role !== 'jury' && role !== 'enseignant') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // 3. REQUÊTE 1 (Inchangée) : Récupération des soutenances liées à ce jury via la table pivot
    const soutenances = await query(
      `SELECT 
        s.id AS soutenance_id,
        s.date_debut AS date_soutenance,
        sa.nom AS salle,
        pm.id AS projet_id,            
        pm.titre AS theme_memoire,
        pm.url_livrable,              
        u.nom AS etudiant_nom,
        u.prenom AS etudiant_prenom
       FROM soutenances s
       JOIN membres_jury_soutenance mjs ON s.id = mjs.soutenance_id
       JOIN projets_memoire pm ON s.projet_id = pm.id
       JOIN utilisateurs u ON pm.etudiant_id = u.id
       LEFT JOIN salles sa ON s.salle_id = sa.id
       WHERE mjs.jury_id = $1
       ORDER BY s.date_debut ASC;`,
      [juryId]
    );

    // 4. REQUÊTE 2 (Ajoutée) : Récupération de TOUS les projets dont il est l'encadrant principal
    // Utilise exactement les mêmes structures de tables (projets_memoire, utilisateurs)
    const projetsAttribues = await query(
      `SELECT 
        pm.id, 
        pm.titre, 
        pm.description, 
        pm.statut, 
        pm.remarque_encadreur, 
        pm.url_livrable, 
        pm.derniere_mise_a_jour,
        u.nom AS etudiant_nom, 
        u.prenom AS etudiant_prenom
       FROM projets_memoire pm
       JOIN utilisateurs u ON pm.etudiant_id = u.id
       WHERE pm.encadreur_id = $1
       ORDER BY COALESCE(pm.derniere_mise_a_jour, NOW()) DESC;`,
      [juryId]
    );

    // 5. Retour de l'ensemble des données attendues par le nouveau Frontend
    return NextResponse.json({
      jury: { nom: payload.nom, prenom: payload.prenom },
      soutenances: soutenances.rows,
      projetsAttribues: projetsAttribues.rows
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur API Jury:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}