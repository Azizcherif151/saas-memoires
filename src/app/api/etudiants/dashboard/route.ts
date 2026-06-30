import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

async function getEtudiantInfoFromToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.split('; ').find((row) => row.startsWith('session_token='))?.split('=')[1];
  if (!token) return null;

  const secretText = process.env.JWT_SECRET;
  if (!secretText) throw new Error('JWT_SECRET manquant');
  const secret = new TextEncoder().encode(secretText);

  const { payload } = await jwtVerify(token, secret);
  // On récupère l'id de l'utilisateur et son rôle
  return { id: payload.id as string, role: payload.role as string };
}

export async function GET(request: Request) {
  try {
    const auth = await getEtudiantInfoFromToken(request);
    if (!auth || auth.role !== 'etudiant') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // 1. Récupérer le projet de mémoire de l'étudiant
    const projetResult = await query(
      `SELECT id, titre, description, statut, remarque_encadreur, derniere_mise_a_jour 
       FROM projets_memoire 
       WHERE etudiant_id = $1 LIMIT 1;`,
      [auth.id]
    );

    const projet = projetResult.rows[0] || null;
    let soutenance = null;

    // 2. Si l'étudiant a un projet, on regarde si une soutenance est planifiée
    if (projet) {
      const soutenanceResult = await query(
        `SELECT s.date_debut, s.date_fin, s.note_finale, s.convocation_envoyee,
                sal.nom AS salle_nom, COALESCE(sal.est_virtuelle, false) AS est_virtuelle
         FROM soutenances s
         LEFT JOIN salles sal ON s.salle_id = sal.id
         WHERE s.projet_id = $1 LIMIT 1;`,
        [projet.id]
      );
      soutenance = soutenanceResult.rows[0] || null;
    }

    // Renvoie un objet propre contenant les deux entités ciblées
    return NextResponse.json({ projet, soutenance }, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/etudiant/dashboard :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}