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

    const result = await query(
      `SELECT id, nom, est_virtuelle FROM salles WHERE etablissement_id = $1 ORDER BY nom ASC;`,
      [etablissementId]
    );
    return NextResponse.json({ salles: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { nom, est_virtuelle } = await request.json();
    if (!nom) return NextResponse.json({ error: 'Le nom est obligatoire' }, { status: 400 });

    const result = await query(
      `INSERT INTO salles (id, etablissement_id, nom, est_virtuelle) 
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *;`,
      [etablissementId, nom, est_virtuelle || false]
    );
    return NextResponse.json({ message: 'Salle créée !', salle: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur de création' }, { status: 500 });
  }
}