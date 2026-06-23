import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

async function getEtablissementIdFromToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.split('; ').find((row) => row.startsWith('session_token='))?.split('=')[1];
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.etablissementId as string;
}

export async function GET(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    // Exécution des requêtes de comptage en parallèle pour de meilleures performances
    const [etudiantsCount, projetsCount, soutenancesCount, sallesCount] = await Promise.all([
      query(`SELECT COUNT(*) FROM utilisateurs WHERE etablissement_id = $1 AND role = 'etudiant';`, [etablissementId]),
      query(`SELECT COUNT(*) FROM projets_memoire WHERE etablissement_id = $1;`, [etablissementId]),
      query(`SELECT COUNT(*) FROM soutenances WHERE etablissement_id = $1;`, [etablissementId]),
      query(`SELECT COUNT(*) FROM salles WHERE etablissement_id = $1;`, [etablissementId]),
    ]);

    return NextResponse.json({
      stats: {
        etudiants: parseInt(etudiantsCount.rows[0].count, 10),
        projets: parseInt(projetsCount.rows[0].count, 10),
        soutenances: parseInt(soutenancesCount.rows[0].count, 10),
        salles: parseInt(sallesCount.rows[0].count, 10),
      }
    });

  } catch (error) {
    console.error('Erreur GET /api/stats :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}