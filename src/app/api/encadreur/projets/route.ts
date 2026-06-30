import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

// Fonction interne pour récupérer et vérifier les informations de l'encadrant via le token
async function getEncadrantInfoFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const secretText = process.env.JWT_SECRET;
  if (!secretText) throw new Error('JWT_SECRET manquant');
  const secret = new TextEncoder().encode(secretText);

  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.id as string, role: payload.role as string };
  } catch (err) {
    return null;
  }
}

// 1. Récupérer TOUS les projets assignés à l'encadreur connecté
export async function GET(request: Request) {
  try {
    const auth = await getEncadrantInfoFromToken();

    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé. Session manquante ou expirée.' }, { status: 401 });
    }

    const encadreurId = auth.id; 

    // CORRECTION : Tri par ID ou titre si la derniere_mise_a_jour est parfois NULL au début
    const projets = await query(
      `SELECT p.id, p.titre, p.description, p.statut, p.remarque_encadreur, p.url_livrable, p.derniere_mise_a_jour,
              u.nom AS etudiant_nom, u.prenom AS etudiant_prenom
       FROM projets_memoire p
       JOIN utilisateurs u ON p.etudiant_id = u.id
       WHERE p.encadreur_id = $1
       ORDER BY COALESCE(p.derniere_mise_a_jour, NOW()) DESC;`,
      [encadreurId]
    );

    return NextResponse.json(projets.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Valider, Rejeter ou Demander des modifications sur un mémoire
export async function POST(request: Request) {
  try {
    const auth = await getEncadrantInfoFromToken();

    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé. Session manquante ou expirée.' }, { status: 401 });
    }

    const { projetId, action, remarque } = await request.json();

    // Gestion des statuts basés sur les actions transmises par ton interface
    let nouveauStatut = '';
    if (action === 'APPROUVER') nouveauStatut = 'valide';
    else if (action === 'REJETER') nouveauStatut = 'rejete';
    else if (action === 'CORRIGER') nouveauStatut = 'A modifier'; // Gère l'état d'édition requis avant planification
    else return NextResponse.json({ error: 'Action invalide' }, { status: 400 });

    // Sécurité : On s'assure de filtrer également par encadreur_id pour que seul l'encadrant affecté puisse le modifier
    await query(
      `UPDATE projets_memoire 
       SET statut = $1, remarque_encadreur = $2, derniere_mise_a_jour = NOW()
       WHERE id = $3 AND encadreur_id = $4;`,
      [nouveauStatut, remarque, projetId, auth.id]
    );

    return NextResponse.json({ success: true, message: `Projet mis à jour avec succès (Statut: ${nouveauStatut})` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}