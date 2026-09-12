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

 
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const auth = await getEtudiantInfoFromToken(request);
    if (!auth || auth.role !== 'etudiant') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: memoireId, versionId } = await params;
 
    // Vérifier que l'utilisateur est propriétaire
    const proprietaireResult = await query(
      `SELECT etudiant_id FROM projets_memoire WHERE id = $1;`,
      [memoireId]
    );
 
    if (proprietaireResult.rows[0].etudiant_id !== auth.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
 
    // Récupérer la version
    const versionResult = await query(
      `SELECT contenu, page_settings FROM memoires_contenu WHERE id = $1 AND projet_memoire_id = $2;`,
      [versionId, memoireId]
    );
 
    if (versionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Version non trouvée' }, { status: 404 });
    }
 
    const { contenu, page_settings } = versionResult.rows[0];
 
    // Créer une nouvelle version basée sur l'ancienne
    const newVersionResult = await query(
      `SELECT MAX(version) as max_version FROM memoires_contenu WHERE projet_memoire_id = $1;`,
      [memoireId]
    );
 
    const newVersion = (newVersionResult.rows[0]?.max_version || 0) + 1;
 
    await query(
      `INSERT INTO memoires_contenu (projet_memoire_id, contenu, page_settings, version)
       VALUES ($1, $2, $3, $4);`,
      [memoireId, contenu, page_settings, newVersion]
    );
 
    return NextResponse.json(
      {
        message: 'Version restaurée avec succès',
        contenu,
        pageSettings: page_settings ? JSON.parse(page_settings) : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur POST /api/memoires/[id]/versions/[versionId]/restore:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}