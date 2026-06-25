import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { promises as fs } from 'fs';
import path from 'path';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

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

    const etudiantId = payload.id;

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

    // Nom unique : memoire_ID-ETUDIANT.pdf
    const nomFichier = `memoire_${etudiantId}.pdf`;
    const destinationPath = path.join(process.cwd(), 'public', 'uploads', nomFichier);

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
  [urlLivrableLocal, etudiantId] // <-- Mets ici ta variable qui stocke la chaîne de caractères de l'URL
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