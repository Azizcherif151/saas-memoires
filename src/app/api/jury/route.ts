import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

async function getEtablissementIdFromToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.split('; ').find((row) => row.startsWith('session_token='))?.split('=')[1];
  if (!token) return null;

  const secretText = process.env.JWT_SECRET;
  if (!secretText) throw new Error('JWT_SECRET manquant');
  const secret = new TextEncoder().encode(secretText);

  const { payload } = await jwtVerify(token, secret);
  return payload.etablissementId as string;
}

// 1. GET : Lister les membres du jury
export async function GET(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const result = await query(
      `SELECT id, prenom, nom, email, cree_at 
       FROM utilisateurs 
       WHERE etablissement_id = $1 AND role = 'jury'
       ORDER BY nom ASC, prenom ASC;`,
      [etablissementId]
    );

    return NextResponse.json({ jury: result.rows });
  } catch (error) {
    console.error('Erreur GET /api/jury :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

// 2. POST : Ajouter un membre du jury
export async function POST(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { prenom, nom, email, motDePasse } = body;

    if (!prenom || !nom || !email || !motDePasse) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 });
    }

    const sel = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasse, sel);

    const result = await query(
      `INSERT INTO utilisateurs (id, etablissement_id, email, mot_de_passe_hash, prenom, nom, role)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'jury')
       RETURNING id, prenom, nom, email, role;`,
      [etablissementId, email, motDePasseHash, prenom, nom]
    );

    return NextResponse.json({
      message: 'Membre du jury ajouté avec succès !',
      membre: result.rows[0]
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
    }
    console.error('Erreur POST /api/jury :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}