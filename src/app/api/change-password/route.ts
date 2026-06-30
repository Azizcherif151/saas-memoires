import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
// Importe bcrypt ou la bibliothèque que tu utilises pour hacher les mots de passe
import bcrypt from 'bcryptjs'; 

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: Request) {
  try {
    // 1. Récupération du token depuis les cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      ?.split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Décodage du token pour récupérer l'ID de l'utilisateur connecté
    const { payload } = await jwtVerify(token, SECRET);
    const utilisateurId = payload.id;

    // 3. Récupération des données du formulaire
    const { ancienMotDePasse, nouveauMotDePasse } = await request.json();

    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
    }

    // 4. Récupérer le mot de passe actuel stocké en BDD
    const resUser = await query(
      `SELECT mot_de_passe FROM utilisateurs WHERE id = $1;`,
      [utilisateurId]
    );

    if (resUser.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const motDePasseHache = resUser.rows[0].mot_de_passe;

    // 5. Vérifier si l'ancien mot de passe est correct
    const correspondance = await bcrypt.compare(ancienMotDePasse, motDePasseHache);
    if (!correspondance) {
      return NextResponse.json({ error: 'L’ancien mot de passe est incorrect' }, { status: 400 });
    }

    // 6. Hacher le nouveau mot de passe
    const nouveauHachage = await bcrypt.hash(nouveauMotDePasse, 10);

    // 7. Mise à jour en Base de Données
    await query(
      `UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2;`,
      [nouveauHachage, utilisateurId]
    );

    return NextResponse.json({ message: 'Mot de passe modifié avec succès !' }, { status: 200 });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}