import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// Fonction pour récupérer l'id de l'établissement depuis le cookie JWT
async function getEtablissementIdFromToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader
    .split('; ')
    .find((row) => row.startsWith('session_token='))
    ?.split('=')[1];

  if (!token) return null;

  const secretText = process.env.JWT_SECRET;
  if (!secretText) throw new Error('JWT_SECRET manquant');
  const secret = new TextEncoder().encode(secretText);

  const { payload } = await jwtVerify(token, secret);
  return payload.etablissementId as number;
}

// 1. GET : Lister les étudiants de l'établissement connecté
export async function GET(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const result = await query(
      `SELECT id, prenom, nom, email, cree_at 
       FROM utilisateurs 
       WHERE etablissement_id = $1 AND role = 'etudiant'
       ORDER BY nom ASC, prenom ASC;`,
      [etablissementId]
    );

    return NextResponse.json({ etudiants: result.rows });
  } catch (error) {
    console.error('Erreur GET /api/etudiants :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

// 2. POST : Ajouter un nouvel étudiant
export async function POST(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { prenom, nom, email, motDePasse } = body;

    if (!prenom || !nom || !email || !motDePasse) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 });
    }

    // Hashage d'un mot de passe par défaut pour l'étudiant
    const sel = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasse, sel);

    // Insertion dans la table utilisateurs avec le rôle 'etudiant'
    const result = await query(
      `INSERT INTO utilisateurs (etablissement_id, email, mot_de_passe_hash, prenom, nom, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, prenom, nom, email, role;`,
      [etablissementId, email, motDePasseHash, prenom, nom, 'etudiant']
    );

    return NextResponse.json({
      message: 'Étudiant ajouté avec succès !',
      etudiant: result.rows[0]
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
    }
    console.error('Erreur POST /api/etudiants :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}