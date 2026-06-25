import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

async function getEtablissementIdFromToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.split('; ').find((row) => row.startsWith('session_token='))?.split('=')[1];
  if (!token) return null;

  const secretText = process.env.JWT_SECRET;
  if (!secretText) throw new Error('JWT_SECRET manquant');
  const secret = new TextEncoder().encode(secretText);

  const { payload } = await jwtVerify(token, secret);
  return payload.etablissementId as string; // UUID stocké dans le token
}

// 1. GET : Récupérer les projets ET la liste des étudiants disponibles
export async function GET(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    // Requête A : Liste des projets de mémoire existants
    const memoiresResult = await query(
      `SELECT pm.id, pm.titre, pm.description, pm.statut, pm.derniere_mise_a_jour,
              u.prenom AS etudiant_prenom, u.nom AS etudiant_nom
       FROM projets_memoire pm
       LEFT JOIN utilisateurs u ON pm.etudiant_id = u.id
       WHERE pm.etablissement_id = $1
       ORDER BY pm.derniere_mise_a_jour DESC;`,
      [etablissementId]
    );

    // Requête B (AJOUTÉE) : Liste des étudiants de cet établissement qui n'ont pas encore de projet
    const etudiantsDisponibles = await query(
      `SELECT id, nom, prenom 
       FROM utilisateurs 
       WHERE role = 'etudiant' 
         AND etablissement_id = $1
         AND id NOT IN (
           SELECT etudiant_id FROM projets_memoire WHERE etudiant_id IS NOT NULL
         )
       ORDER BY nom ASC, prenom ASC;`,
      [etablissementId]
    );

    // On renvoie les deux tableaux au Front-End
    return NextResponse.json({ 
      memoires: memoiresResult.rows,
      etudiants: etudiantsDisponibles.rows 
    });

  } catch (error) {
    console.error('Erreur GET /api/memoires :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

// 2. POST : Enregistrer un projet de mémoire avec le bon ENUM
export async function POST(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { titre, description, etudiantId } = body;

    if (!titre) {
      return NextResponse.json({ error: 'Le titre du mémoire est obligatoire.' }, { status: 400 });
    }

    // Insertion avec le statut valide 'brouillon'
    const result = await query(
      `INSERT INTO projets_memoire (id, etablissement_id, etudiant_id, titre, description, statut)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'brouillon')
       RETURNING *;`,
      [etablissementId, etudiantId || null, titre, description || '']
    );

    return NextResponse.json({
      message: 'Projet de mémoire enregistré avec succès !',
      memoire: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur POST /api/memoires :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}