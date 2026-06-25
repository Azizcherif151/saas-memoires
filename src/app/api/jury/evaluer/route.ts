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
    const { soutenanceId, noteEcrit, noteOral, commentaires } = body;

    if (!soutenanceId || noteEcrit === undefined || noteOral === undefined) {
      return NextResponse.json({ error: 'Données incomplètes.' }, { status: 400 });
    }

    // Calcul de la note globale (Exemple : Moyenne simple)
    const noteGenerale = (parseFloat(noteEcrit) + parseFloat(noteOral)) / 2;

    // Mise à jour de la soutenance avec les notes et observations
    // (Ajuste les noms des colonnes selon ta table)
    await query(
      `UPDATE soutenances 
       SET note_ecrit = $1, note_oral = $2, note_generale = $3, observations = $4
       WHERE id = $5;`,
      [noteEcrit, noteOral, noteGenerale, commentaires, soutenanceId]
    );

    return NextResponse.json({ message: 'Évaluation enregistrée avec succès !', noteGenerale }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de l’évaluation :', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}