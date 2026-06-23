import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // On tente une requête très simple : demander l'heure actuelle à PostgreSQL
    const resultat = await query('SELECT NOW() as heure_actuelle;');
    
    return NextResponse.json({
      statut: 'Succès',
      message: 'Connexion à la base de données réussie !',
      timestamp: resultat.rows[0].heure_actuelle,
    });
  } catch (erreur) {
    return NextResponse.json(
      { statut: 'Erreur', message: 'Impossible de se connecter à la base de données.' },
      { status: 500 }
    );
  }
}