// src/app/api/memoires/[id]/versions/route.ts
 
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
    // Vérifier que l'utilisateur a accès au mémoire
    const proprietaireResult = await query(
      `SELECT etudiant_id FROM projets_memoire WHERE id = $1;`,
      [memoireId]
    );
 
    if (proprietaireResult.rows.length === 0) {
      return NextResponse.json({ error: 'Mémoire non trouvé' }, { status: 404 });
    }
 
    if (auth.role === 'etudiant' && proprietaireResult.rows[0].etudiant_id !== auth.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
 
    // Récupérer toutes les versions
    const versionsResult = await query(
      `SELECT id, version, contenu, derniere_modification, page_settings
       FROM memoires_contenu
       WHERE projet_memoire_id = $1
       ORDER BY version DESC;`,
      [memoireId]
    );
 
    const versions = versionsResult.rows.map((row) => ({
      id: row.id,
      version: row.version,
      content: row.contenu,
      createdAt: row.derniere_modification,
      pageSettings: row.page_settings ? JSON.parse(row.page_settings) : null,
    }));
 
    return NextResponse.json({ versions }, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/memoires/[id]/versions:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}