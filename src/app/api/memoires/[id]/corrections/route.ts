// src/app/api/memoires/[id]/corrections/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

async function getUserInfoFromToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.split('; ').find((row) => row.startsWith('session_token='))?.split('=')[1];
  if (!token) return null;

  const secretText = process.env.JWT_SECRET;
  if (!secretText) throw new Error('JWT_SECRET manquant');
  const secret = new TextEncoder().encode(secretText);

  try {
    const { payload } = await jwtVerify(token, secret);
    return { 
      id: payload.id as string, 
      role: payload.role as string 
    };
  } catch (err) {
    return null;
  }
}

// GET: Récupérer toutes les corrections d'un mémoire
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getUserInfoFromToken(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const memoireId = params.id;

    // Vérifier que le mémoire existe et que l'utilisateur y a accès
    const memoireResult = await query(
      `SELECT pm.id, pm.etudiant_id, pm.encadreur_id 
       FROM projets_memoire pm
       WHERE pm.id = $1;`,
      [memoireId]
    );

    if (memoireResult.rows.length === 0) {
      return NextResponse.json({ error: 'Mémoire non trouvé' }, { status: 404 });
    }

    const memoire = memoireResult.rows[0];

    // Vérifier les droits d'accès
    if (auth.role === 'etudiant' && memoire.etudiant_id !== auth.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    if (auth.role === 'encadreur' && memoire.encadreur_id !== auth.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer le contenu le plus récent du mémoire
    const contenuResult = await query(
      `SELECT id FROM memoires_contenu
       WHERE projet_memoire_id = $1
       ORDER BY version DESC
       LIMIT 1;`,
      [memoireId]
    );

    if (contenuResult.rows.length === 0) {
      return NextResponse.json({ corrections: [] }, { status: 200 });
    }

    const contenuId = contenuResult.rows[0].id;

    // Récupérer les corrections
    const correctionsResult = await query(
      `SELECT 
        mc.id,
        mc.position_debut,
        mc.position_fin,
        mc.texte_selectionne,
        mc.commentaire,
        mc.statut,
        mc.reponse_etudiant,
        mc.created_at,
        mc.updated_at,
        u.prenom AS encadreur_prenom,
        u.nom AS encadreur_nom
       FROM memoires_corrections mc
       JOIN utilisateurs u ON mc.encadreur_id = u.id
       WHERE mc.memoire_contenu_id = $1
       ORDER BY mc.created_at DESC;`,
      [contenuId]
    );

    return NextResponse.json({ corrections: correctionsResult.rows }, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/memoires/[id]/corrections:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

// POST: Ajouter une correction
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getUserInfoFromToken(request);
    if (!auth || auth.role !== 'encadreur') {
      return NextResponse.json({ error: 'Non autorisé - encadreur requis' }, { status: 401 });
    }

    const memoireId = params.id;
    const { 
      positionDebut, 
      positionFin, 
      texteSelectionne, 
      commentaire 
    } = await request.json();

    if (!commentaire) {
      return NextResponse.json({ error: 'Le commentaire est obligatoire' }, { status: 400 });
    }

    // Vérifier que l'encadreur est le responsable du mémoire
    const memoireResult = await query(
      `SELECT encadreur_id FROM projets_memoire WHERE id = $1;`,
      [memoireId]
    );

    if (memoireResult.rows.length === 0) {
      return NextResponse.json({ error: 'Mémoire non trouvé' }, { status: 404 });
    }

    if (memoireResult.rows[0].encadreur_id !== auth.id) {
      return NextResponse.json({ error: 'Vous n\'êtes pas l\'encadreur de ce mémoire' }, { status: 403 });
    }

    // Récupérer le contenu le plus récent
    const contenuResult = await query(
      `SELECT id FROM memoires_contenu
       WHERE projet_memoire_id = $1
       ORDER BY version DESC
       LIMIT 1;`,
      [memoireId]
    );

    if (contenuResult.rows.length === 0) {
      return NextResponse.json({ error: 'Le mémoire n\'a pas encore de contenu' }, { status: 400 });
    }

    const contenuId = contenuResult.rows[0].id;

    // Insérer la correction
    const correctionResult = await query(
      `INSERT INTO memoires_corrections 
       (memoire_contenu_id, encadreur_id, position_debut, position_fin, texte_selectionne, commentaire)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, commentaire, statut, created_at;`,
      [contenuId, auth.id, positionDebut || null, positionFin || null, texteSelectionne || null, commentaire]
    );

    return NextResponse.json({
      message: 'Correction ajoutée avec succès',
      correction: correctionResult.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/memoires/[id]/corrections:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}