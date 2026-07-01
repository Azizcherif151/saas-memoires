import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { promises as fs } from 'fs';
import path from 'path';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Fonction de validation stricte pour rassurer définitivement Snyk
function getSafeUploadPath(baseDir: string, fileName: string): string {
  // 1. On extrait uniquement le nom strict du fichier (exclut tout séparateur de dossier)
  const safeName = path.basename(fileName);
  // 2. On résout le chemin absolu final
  const finalPath = path.resolve(baseDir, safeName);
  
  // 3. Garde de sécurité : interdiction absolue de sortir du dossier de base
  if (!finalPath.startsWith(path.resolve(baseDir))) {
    throw new Error('Path Traversal Detected');
  }
  
  return finalPath;
}

export async function POST(request: Request) {
  try {
    // 1. Authentification
    const token = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== 'etudiant') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // Extraction et assainissement de l'identifiant
    const rawEtudiantId = String(payload.id);
    const safeEtudiantId = rawEtudiantId.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!safeEtudiantId) {
      return NextResponse.json({ error: 'Identifiant étudiant invalide.' }, { status: 400 });
    }

    // 2. Récupération du fichier via FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier n’a été téléversé.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont autorisés.' }, { status: 400 });
    }

    // 3. Sauvegarde physique du fichier sur le serveur
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Construction du nom de fichier
    const nomFichier = `memoire_${safeEtudiantId}.pdf`;
    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
    
    let destinationPath: string;
    try {
      // Appel de la fonction sécurisée fermée au Path Traversal
      destinationPath = getSafeUploadPath(uploadDir, nomFichier);
    } catch (err) {
      return NextResponse.json({ error: 'Chemin de stockage invalide.' }, { status: 400 });
    }

    // Écriture sécurisée (Ligne 48 nettoyée)
    await fs.writeFile(destinationPath, buffer);
    const urlLivrableLocal = `/uploads/${nomFichier}`;

    // 4. Enregistrement du chemin en BDD et passage du statut à 'en_attente_validation'
    const resultat = await query(
      `UPDATE projets_memoire 
       SET url_livrable = $1, 
           statut = 'en_attente_validation', 
           derniere_mise_a_jour = NOW()
       WHERE etudiant_id = $2
       RETURNING id;`,
      [urlLivrableLocal, payload.id]
    );

    if (resultat.rowCount === 0) {
      return NextResponse.json({ error: 'Aucun projet de mémoire trouvé.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Mémoire PDF soumis avec succès !', url: urlLivrableLocal }, { status: 200 });

  } catch (error) {
    console.error('Erreur téléversement PDF étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur lors du stockage.' }, { status: 500 });
  }
}