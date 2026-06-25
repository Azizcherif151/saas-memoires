import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
// Importe ton utilitaire de décodage/vérification de token ici si nécessaire
// e.g., import { verifyToken } from '@/lib/auth';

// 1. Récupérer les projets assignés à l'encadreur connecté
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Non autorisé. Session manquante.' }, { status: 401 });
    }

    // --- ICI : Décode ou vérifie ton sessionToken pour obtenir l'ID de l'encadreur ---
    // Exemple fictif (remplace selon ta logique : JWT, session DB, etc.) :
    // const payload = verifyToken(sessionToken);
    // const encadreurId = payload.userId;
    
    const encadreurId = 'METS_ICI_L_ID_EXTRAIT_DU_TOKEN'; 

    if (!encadreurId) {
      return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    const projets = await query(
      `SELECT p.id, p.titre, p.description, p.statut, p.remarque_encadreur, p.url_livrable, p.derniere_mise_a_jour,
              u.nom AS etudiant_nom, u.prenom AS etudiant_prenom
       FROM projets_memoire p
       JOIN utilisateurs u ON p.etudiant_id = u.id
       WHERE p.encadreur_id = $1
       ORDER BY p.derniere_mise_a_jour DESC;`,
      [encadreurId]
    );

    return NextResponse.json(projets.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Valider ou Rejeter un mémoire
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }

    const { projetId, action, remarque } = await request.json();

    // Vérification de l'action par rapport à ton ENUM Postgres
    let nouveauStatut = '';
    if (action === 'APPROUVER') nouveauStatut = 'valide';
    else if (action === 'REJETER') nouveauStatut = 'rejete';
    else return NextResponse.json({ error: 'Action invalide' }, { status: 400 });

    await query(
      `UPDATE projets_memoire 
       SET statut = $1, remarque_encadreur = $2, derniere_mise_a_jour = NOW()
       WHERE id = $3;`,
      [nouveauStatut, remarque, projetId]
    );

    return NextResponse.json({ success: true, message: `Projet mis à jour avec succès (Statut: ${nouveauStatut})` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}