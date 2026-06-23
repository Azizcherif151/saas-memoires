import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: Request) {
  try {
    // 1. Récupérer le token depuis les cookies de la requête
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split('; ')
      .find((row) => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Décoder et vérifier le token
    const secretText = process.env.JWT_SECRET;
    if (!secretText) throw new Error('JWT_SECRET manquant');
    const secret = new TextEncoder().encode(secretText);

    const { payload } = await jwtVerify(token, secret);

    // 3. Renvoyer les informations de l'utilisateur connecté
    return NextResponse.json({
      utilisateur: {
        id: payload.id,
        prenom: payload.prenom,
        nom: payload.nom,
        email: payload.email,
        role: payload.role,
        etablissementId: payload.etablissementId,
      },
    });
  } catch (error) {
    console.error('Erreur API /me :', error);
    return NextResponse.json({ error: 'Session invalide ou expirée' }, { status: 401 });
  }
}