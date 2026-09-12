import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose'; 

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

    // Préparation du secret JWT
    const secretText = process.env.JWT_SECRET;
    if (!secretText) {
      throw new Error('La variable JWT_SECRET n’est pas configurée.');
    }
    const secret = new TextEncoder().encode(secretText);

    // Création du Token JWT contenant les infos essentielles de l'utilisateur
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
      .setExpirationTime('2h') 
      .sign(secret);

    // Détermination de l'URL de redirection selon le rôle
    let redirectTo = '/dashboard'; // Admin d'école par défaut
    
    if (utilisateur.role === 'superadmin') {
      redirectTo = '/superadmin/dashboard'; // Redirection pour le Super Admin global
    } else if (utilisateur.role === 'etudiant') {
      redirectTo = '/etudiant';
    } else if (utilisateur.role === 'jury') {
      redirectTo = '/jury';
    } else if (utilisateur.role === 'encadreur') {
      redirectTo = '/encadreur';
    }

    // Configuration de la réponse avec la route de redirection incluse
    const reponse = NextResponse.json({
      message: 'Connexion réussie !',
      redirectTo, // Le front-end utilisera cette variable pour rediriger l'utilisateur
      utilisateur: {
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role
      }
    }, { status: 200 });

    // Injection du JWT dans un cookie sécurisé
    reponse.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2, 
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