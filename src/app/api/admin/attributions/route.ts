import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
// Importez votre système de session ici (ex: next-auth, jose, etc.)

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Récupérer l'ID de l'établissement de l'administrateur connecté depuis la session
    // À remplacer par votre logique dynamique de session
    const etablissementId = 1; 

    if (!etablissementId) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }

    // Filtrer les étudiants par etablissement_id
    const etudiantsData = await query(
      `SELECT u.id AS etudiant_id, u.nom, u.prenom, u.email,
              p.id AS projet_id, p.titre, p.encadreur_id
       FROM utilisateurs u
       LEFT JOIN projets_memoire p ON u.id = p.etudiant_id
       WHERE u.role = 'etudiant' AND u.etablissement_id = $1
       ORDER BY u.nom ASC;`,
      [etablissementId]
    );

    // Filtrer les encadreurs par etablissement_id
    const encadreursData = await query(
      `SELECT id, nom, prenom FROM utilisateurs 
       WHERE role NOT IN ('etudiant', 'admin') AND etablissement_id = $1
       ORDER BY nom ASC;`,
      [etablissementId]
    );

    return NextResponse.json({
      etudiants: etudiantsData.rows,
      encadreurs: encadreursData.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { etudiantId, encadreurId, projetId } = await request.json();

    if (!etudiantId || !encadreurId) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    if (projetId) {
      await query(
        `UPDATE projets_memoire SET encadreur_id = $1, derniere_mise_a_jour = NOW() WHERE id = $2;`,
        [encadreurId, projetId]
      );
    } else {
      await query(
        `INSERT INTO projets_memoire (etudiant_id, encadreur_id, titre, description, statut)
         VALUES ($1, $2, 'Sujet en attente de définition', 'Description à renseigner par l''étudiant.', 'brouillon');`,
        [etudiantId, encadreurId]
      );
    }

    return NextResponse.json({ success: true, message: 'Encadreur attribué avec succès.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}