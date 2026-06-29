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
    if (payload.role !== 'jury') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    const body = await request.json();
    const { soutenanceId, noteEcrit, noteOral } = body; // On ignore 'commentaires' pour l'instant

    if (!soutenanceId || noteEcrit === undefined || noteOral === undefined) {
      return NextResponse.json({ error: 'Données incomplètes.' }, { status: 400 });
    }

    // Calcul de la note globale requise par ta colonne `note_finale`
    const noteFinale = (parseFloat(noteEcrit) + parseFloat(noteOral)) / 2;

    // Mise à jour : Uniquement la colonne 'note_finale'
    await query(
      `UPDATE soutenances 
       SET note_finale = $1
       WHERE id = $2;`,
      [noteFinale, soutenanceId]
    );

    return NextResponse.json({ 
      message: 'Évaluation enregistrée avec succès !', 
      noteFinale 
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de l’évaluation :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}