import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs'; // 1. On importe la bibliothèque de hashage

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      nomEtablissement, 
      emailAdmin, 
      motDePasseEnClair, 
      prenomAdmin, 
      nomAdmin 
    } = body;

    // Validation des champs
    if (!nomEtablissement || !emailAdmin || !motDePasseEnClair || !prenomAdmin || !nomAdmin) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis.' },
        { status: 400 }
      );
    }

    // 2. On génère un "sel" et on hache le mot de passe
    // Le chiffre 10 représente la complexité (le nombre de tours de hashage)
    const sel = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasseEnClair, sel);

    // Début de la transaction SQL
    await query('BEGIN');

    // 3. Insertion de l'établissement
    const etablissementResult = await query(
      `INSERT INTO etablissements (nom) 
       VALUES ($1) 
       RETURNING id, nom;`,
      [nomEtablissement]
    );

    const etablissementId = etablissementResult.rows[0].id;

    // 4. Insertion de l'administrateur (on lui passe 'motDePasseHash' à la place du texte en clair)
    const adminResult = await query(
      `INSERT INTO utilisateurs (etablissement_id, email, mot_de_passe_hash, prenom, nom, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, prenom, nom, email, role;`,
      [etablissementId, emailAdmin, motDePasseHash, prenomAdmin, nomAdmin, 'admin']
    );

    // Validation finale de la transaction
    await query('COMMIT');

    return NextResponse.json({
      message: 'Établissement et compte administrateur sécurisé créés avec succès !',
      etablissement: etablissementResult.rows[0],
      administrateur: adminResult.rows[0]
    }, { status: 201 });

  } catch (error: any) {
    await query('ROLLBACK');
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé par un utilisateur.' },
        { status: 409 }
      );
    }

    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json(
      { error: 'Une erreur interne est survenue.' },
      { status: 500 }
    );
  }
}