import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomEtablissement, nomContact, email, telephone, message } = body;

    if (!nomEtablissement || !nomContact || !email) {
      return NextResponse.json(
        { error: 'Établissement, contact et email sont obligatoires.' },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO demandes_acces
         (nom_etablissement, nom_contact, email, telephone, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        nomEtablissement,
        nomContact,
        email,
        telephone || null,
        message || null,
      ]
    );

    return NextResponse.json(
      { message: 'Demande enregistrée. Nous vous recontacterons rapidement.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/demandes:', error);
    return NextResponse.json(
      { error: 'Impossible d\'enregistrer la demande.' },
      { status: 500 }
    );
  }
}