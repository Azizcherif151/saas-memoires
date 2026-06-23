import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, motDePasse } = body;

    // 1. Validation de base
    if (!email || !motDePasse) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs.' },
        { status: 400 }
      );
    }

    // 2. Recherche de l'utilisateur en base de données
    const result = await query(
      `SELECT * FROM utilisateurs WHERE email = $1;`,
      [email]
    );

    const utilisateur = result.rows[0];

    // 3. Si l'utilisateur n'existe pas
    if (!utilisateur) {
      return NextResponse.json(
        { error: 'Identifiants incorrects.' }, // Message générique pour la sécurité
        { status: 401 }
      );
    }

    // 4. Vérification du mot de passe avec bcryptjs
    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_hash);

    if (!motDePasseValide) {
      return NextResponse.json(
        { error: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    // 5. Connexion réussie (Pour l'instant, on renvoie juste les infos de l'utilisateur)
    return NextResponse.json({
      message: 'Connexion réussie !',
      utilisateur: {
        id: utilisateur.id,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
        etablissementId: utilisateur.etablissement_id
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    return NextResponse.json(
      { error: 'Une erreur interne est survenue.' },
      { status: 500 }
    );
  }
}