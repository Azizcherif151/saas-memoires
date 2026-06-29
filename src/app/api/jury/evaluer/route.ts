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
    const { soutenanceId, noteEcrit, noteOral } = body;

    if (!soutenanceId || noteEcrit === undefined || noteOral === undefined) {
      return NextResponse.json({ error: 'Données incomplètes.' }, { status: 400 });
    }

    // Calcul de la note globale
    const noteFinale = (parseFloat(noteEcrit) + parseFloat(noteOral)) / 2;

    // 1. Mise à jour de la note finale dans la table soutenances
    await query(
      `UPDATE soutenances 
       SET note_finale = $1
       WHERE id = $2;`,
      [noteFinale, soutenanceId]
    );

    // 2. Mise à jour du statut du mémoire lié pour corriger le badge étudiant (en_attente_validation -> evalue)
    // On utilise une sous-requête pour trouver le bon mémoire à partir de l'ID de la soutenance
    // 2. Mise à jour du statut du mémoire lié (on passe à 'valide')
await query(
  `UPDATE projets_memoire 
   SET statut = 'valide' 
   WHERE id = (SELECT projet_id FROM soutenances WHERE id = $1);`,
  [soutenanceId]
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