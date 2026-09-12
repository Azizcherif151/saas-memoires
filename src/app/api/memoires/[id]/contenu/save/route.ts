// src/app/api/memoires/[id]/contenu/save/route.ts
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

  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.id as string, role: payload.role as string };
  } catch (err) {
    return null;
  }
}

// GET: Récupérer le contenu du mémoire
// GET
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getEtudiantInfoFromToken(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: memoireId } = await params;

    // Vérifier que l'étudiant est propriétaire du mémoire
    const proprietaireResult = await query(
      `SELECT etudiant_id FROM projets_memoire WHERE id = $1;`,
      [memoireId]
    );

    if (proprietaireResult.rows.length === 0) {
      return NextResponse.json({ error: 'Mémoire non trouvé' }, { status: 404 });
    }

    // Si c'est un étudiant, vérifier qu'il en est le propriétaire
    if (auth.role === 'etudiant' && proprietaireResult.rows[0].etudiant_id !== auth.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer le contenu le plus récent
    const contenuResult = await query(
      `SELECT id, contenu, version, derniere_modification
       FROM memoires_contenu
       WHERE projet_memoire_id = $1
       ORDER BY version DESC
       LIMIT 1;`,
      [memoireId]
    );

    const contenu = contenuResult.rows[0] || { id: null, contenu: '', version: 0, derniere_modification: null };

    return NextResponse.json(contenu, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/memoires/[id]/contenu/save:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

// POST
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getEtudiantInfoFromToken(request);
    if (!auth || auth.role !== 'etudiant') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: memoireId } = await params;
    const { contenu, pageSettings } = await request.json();

    if (contenu === undefined || contenu === null) {
      return NextResponse.json({ error: 'Le contenu est obligatoire' }, { status: 400 });
    }

    // Vérifier que l'étudiant est propriétaire du mémoire
    const proprietaireResult = await query(
      `SELECT etudiant_id FROM projets_memoire WHERE id = $1;`,
      [memoireId]
    );

    if (proprietaireResult.rows.length === 0) {
      return NextResponse.json({ error: 'Mémoire non trouvé' }, { status: 404 });
    }

    if (proprietaireResult.rows[0].etudiant_id !== auth.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer la version actuelle
    const versionResult = await query(
      `SELECT MAX(version) as max_version FROM memoires_contenu WHERE projet_memoire_id = $1;`,
      [memoireId]
    );

    const newVersion = (versionResult.rows[0]?.max_version || 0) + 1;

    // Insérer le nouveau contenu
    const saveResult = await query(
      `INSERT INTO memoires_contenu (projet_memoire_id, contenu, page_settings, version, derniere_modification)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, version, derniere_modification;`,
      [
        memoireId, 
        contenu, 
        JSON.stringify(pageSettings || {}),  // ← Stocker en JSON
        newVersion
      ]
    );
    // Mettre à jour la date de dernière modification du projet
    await query(
      `UPDATE projets_memoire SET derniere_mise_a_jour = NOW() WHERE id = $1;`,
      [memoireId]
    );

    return NextResponse.json({
      message: 'Mémoire sauvegardé avec succès',
      id: saveResult.rows[0].id,
      version: saveResult.rows[0].version,
      derniere_modification: saveResult.rows[0].derniere_modification
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur POST /api/memoires/[id]/contenu/save:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}