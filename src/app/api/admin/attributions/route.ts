import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 1. Récupérer les étudiants et les encadreurs disponibles
export async function GET() {
  try {
    // Récupérer les étudiants et les infos de leur projet actuel s'il existe
    const etudiantsData = await query(
      `SELECT u.id AS etudiant_id, u.nom, u.prenom, u.email,
              p.id AS projet_id, p.titre, p.encadreur_id
       FROM utilisateurs u
       LEFT JOIN projets_memoire p ON u.id = p.etudiant_id
       WHERE u.role = 'etudiant'
       ORDER BY u.nom ASC;`
    );

    // Récupérer la liste de tous les encadreurs (en excluant les étudiants et les admins)
const encadreursData = await query(
  `SELECT id, nom, prenom FROM utilisateurs 
   WHERE role NOT IN ('etudiant', 'admin') 
   ORDER BY nom ASC;`
);

    return NextResponse.json({
      etudiants: etudiantsData.rows,
      encadreurs: encadreursData.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Attribuer ou modifier un encadreur pour un étudiant
export async function POST(request: Request) {
  try {
    const { etudiantId, encadreurId, projetId } = await request.json();

    if (!etudiantId || !encadreurId) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    if (projetId) {
      // Si le projet existe déjà, on met simplement à jour l'encadreur
      await query(
        `UPDATE projets_memoire SET encadreur_id = $1, derniere_mise_a_jour = NOW() WHERE id = $2;`,
        [encadreurId, projetId]
      );
    } else {
      // Si aucun projet n'existe encore pour l'étudiant, on lui initialise un projet avec l'encadreur lié
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