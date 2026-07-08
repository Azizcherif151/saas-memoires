import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs'; // ← Nouveau import

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

// 2. CRÉER UN ÉTABLISSEMENT + ADMINISTRATEUR (FUSIONNÉ)
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
    const { 
      nom,                    // Nom de l'établissement
      responsable,            // Responsable (optionnel)
      email,                  // Email de contact (optionnel)
      prenomAdmin,            // Nouveau : Prénom du 1er administrateur
      nomAdmin,               // Nouveau : Nom du 1er administrateur
      emailAdmin,             // Nouveau : Email de l'administrateur
      motDePasseEnClair       // Nouveau : Mot de passe en clair
    } = body;

    // Validation des champs OBLIGATOIRES
    if (!nom || !prenomAdmin || !nomAdmin || !emailAdmin || !motDePasseEnClair) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : nom établissement, prénom admin, nom admin, email admin, mot de passe.' },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const sel = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasseEnClair, sel);

    // Début de la transaction
    await query('BEGIN');

    try {
      // 1. Créer l'établissement
      const etablissementResult = await query(
        `INSERT INTO etablissements (nom, responsable, email_contact, statut, date_creation)
         VALUES ($1, $2, $3, 'Actif', NOW())
         RETURNING id, nom, responsable, email_contact AS email, statut;`,
        [
          nom,
          responsable || null,  // Optionnel
          email || null         // Optionnel
        ]
      );

      const etablissementId = etablissementResult.rows[0].id;

      // 2. Créer l'administrateur de l'établissement
      const adminResult = await query(
        `INSERT INTO utilisateurs (etablissement_id, email, mot_de_passe_hash, prenom, nom, role, date_creation)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, prenom, nom, email, role;`,
        [etablissementId, emailAdmin, motDePasseHash, prenomAdmin, nomAdmin, 'admin']
      );

      // Valider la transaction
      await query('COMMIT');

      return NextResponse.json({
        message: 'Établissement et compte administrateur créés avec succès !',
        data: {
          etablissement: etablissementResult.rows[0],
          administrateur: adminResult.rows[0]
        }
      }, { status: 201 });

    } catch (dbError: any) {
      await query('ROLLBACK');
      throw dbError;
    }

  } catch (error: any) {
    console.error('Erreur POST:', error);
    
    // Gestion des erreurs spécifiques
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}

// 3. METTRE À JOUR LE STATUT (PATCH)
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
    const { id, statut } = body;

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

    return NextResponse.json(
      { message: 'Statut mis à jour', data: result.rows[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur PATCH:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}