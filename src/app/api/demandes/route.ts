import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomEtablissement, nomContact, email, telephone, message } = body;

    if (!nomEtablissement?.trim() || !nomContact?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Établissement, contact et email sont obligatoires.' },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO demandes_acces
         (nom_etablissement, nom_contact, email, telephone, message, statut)
       VALUES ($1, $2, $3, $4, $5, 'nouvelle')`,
      [
        nomEtablissement.trim(),
        nomContact.trim(),
        email.trim().toLowerCase(),
        telephone?.trim() || null,
        message?.trim() || null,
      ]
    );

    return NextResponse.json(
      { message: 'Demande enregistrée. Nous vous recontacterons rapidement.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/demandes:', error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande." },
      { status: 500 }
    );
  }
}