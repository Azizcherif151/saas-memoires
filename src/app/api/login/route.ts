import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose'; // 1. On importe l'outil de signature de jose

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, motDePasse } = body;

    if (!email || !motDePasse) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs.' },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur
    const result = await query(
      `SELECT * FROM utilisateurs WHERE email = $1;`,
      [email]
    );

    const utilisateur = result.rows[0];

    // Vérification utilisateur et mot de passe
    if (!utilisateur) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_hash);

    if (!motDePasseValide) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
    }

    // 2. Préparation du secret JWT
    const secretText = process.env.JWT_SECRET;
    if (!secretText) {
      throw new Error('La variable JWT_SECRET n’est pas configurée.');
    }
    const secret = new TextEncoder().encode(secretText);

    // 3. Création du Token JWT contenant les infos essentielles de l'utilisateur
    const token = await new SignJWT({
      id: utilisateur.id,
      prenom: utilisateur.prenom,
      nom: utilisateur.nom,
      email: utilisateur.email,
      role: utilisateur.role,
      etablissementId: utilisateur.etablissement_id
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h') // Le token expirera après 2 heures d'inactivité
      .sign(secret);

    // 4. Configuration de la réponse avec les données utilisateur
    const reponse = NextResponse.json({
      message: 'Connexion réussie !',
      utilisateur: {
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role
      }
    }, { status: 200 });

    // 5. Injection du JWT dans un cookie sécurisé (HttpOnly empêche le vol par script JS)
    reponse.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2, // 2 heures en secondes
      path: '/',
    });

    return reponse;

  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    return NextResponse.json(
      { error: 'Une erreur interne est survenue.' },
      { status: 500 }
    );
  }
}