import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const etudiantId = payload.id; // L'ID de l'étudiant connecté extrait du token

    // Requête pour regrouper la soutenance, la salle, le projet et la liste des jurys
    const result = await query(
      `SELECT 
        s.id AS soutenance_id,
        s.date_debut AS date_soutenance,
        sa.nom AS salle_nom,
        pm.titre AS memoire_titre,
        u_etd.nom AS etudiant_nom,
        u_etd.prenom AS etudiant_prenom,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'nom', u_jury.nom,
              'prenom', u_jury.prenom,
              'role', mjs.poste
            )
          ) FILTER (WHERE u_jury.id IS NOT NULL), '[]'
        ) AS membres_jury
       FROM soutenances s
       JOIN projets_memoire pm ON s.projet_id = pm.id
       JOIN utilisateurs u_etd ON pm.etudiant_id = u_etd.id
       LEFT JOIN salles sa ON s.salle_id = sa.id
       LEFT JOIN membres_jury_soutenance mjs ON s.id = mjs.soutenance_id
       LEFT JOIN utilisateurs u_jury ON mjs.jury_id = u_jury.id
       WHERE u_etd.id = $1
       GROUP BY s.id, sa.nom, pm.titre, u_etd.nom, u_etd.prenom;`,
      [etudiantId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Aucune soutenance planifiée ou publiée pour cet étudiant.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });

  } catch (error) {
    console.error('Erreur API Convocation:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}