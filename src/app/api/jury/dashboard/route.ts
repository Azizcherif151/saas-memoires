import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: Request) {
  try {
    // 1. Récupération du token
    const token = request.headers.get('cookie')
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

    if (role !== 'jury') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // 3. Récupération des soutenances liées à ce jury via la table pivot corrigée
    const soutenances = await query(
      `SELECT 
        s.id AS soutenance_id,
        s.date_debut AS date_soutenance,
        sa.nom AS salle,
        pm.titre AS theme_memoire,
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

    return NextResponse.json({
      jury: { nom: payload.nom, prenom: payload.prenom },
      soutenances: soutenances.rows
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur API Jury:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}