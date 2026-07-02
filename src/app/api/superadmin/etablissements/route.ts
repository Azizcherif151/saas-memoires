import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// 1. OBTENIR TOUS LES ÉTABLISSEMENTS
export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 });
    }

    // Le COALESCE permet de remplacer les valeurs NULL à la volée lors de la lecture
    const result = await query(
      `SELECT 
        id, 
        nom, 
        COALESCE(responsable, 'Non spécifié') AS responsable, 
        COALESCE(email_contact, 'contact@ecole.com') AS email, 
        COALESCE(statut, 'Actif') AS statut, 
        date_creation
       FROM etablissements 
       ORDER BY date_creation DESC;`
    );

    return NextResponse.json({ etablissements: result.rows }, { status: 200 });

  } catch (error) {
    console.error('Erreur GET:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

// 2. CRÉER UN ÉTABLISSEMENT
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
    if (payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 });
    }

    const body = await request.json();
    const { nom, responsable, email } = body;

    if (!nom || !responsable || !email) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 });
    }

    // Insertion avec génération d'UUID si non géré par défaut, ou insertion classique
    // On utilise date_creation à la place de cree_a
    const nouveauEtablissement = await query(
      `INSERT INTO etablissements (nom, responsable, email_contact, statut, date_creation)
       VALUES ($1, $2, $3, 'Actif', NOW())
       RETURNING id, nom, responsable, email_contact AS email, statut;`,
      [nom, responsable, email]
    );

    return NextResponse.json({
      message: 'Établissement créé avec succès !',
      data: nouveauEtablissement.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur POST:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
// À ajouter à la suite des méthodes GET et POST existantes dans :
// src/app/api/superadmin/etablissements/route.ts

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, statut } = body; // id (UUID) et statut ('Actif' ou 'Suspendu')

    if (!id || !statut) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    const result = await query(
      `UPDATE etablissements 
       SET statut = $1 
       WHERE id = $2 
       RETURNING id, statut;`,
      [statut, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Établissement introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Statut mis à jour', data: result.rows[0] }, { status: 200 });

  } catch (error) {
    console.error('Erreur PATCH:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}