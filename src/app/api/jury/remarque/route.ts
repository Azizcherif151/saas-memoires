import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    // On autorise les rôles 'jury' ou 'encadrant' selon ta configuration
    if (payload.role !== 'jury' && payload.role !== 'encadrant') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    const { projetId, remarque } = await request.json();

    if (!projetId || remarque === undefined) {
      return NextResponse.json({ error: 'Données incomplètes.' }, { status: 400 });
    }

    // Mise à jour de la remarque et passage du statut à 'rejete' ou maintien en l'état
    // pour que l'étudiant sache qu'il doit corriger
    await query(
      `UPDATE projets_memoire 
       SET remarque_encadreur = $1, statut = $2 
       WHERE id = $3;`,
      [remarque, 'rejete', projetId]
    );

    return NextResponse.json({ message: 'Remarques transmises avec succès !' }, { status: 200 });

  } catch (error) {
    console.error('Erreur remarque:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}