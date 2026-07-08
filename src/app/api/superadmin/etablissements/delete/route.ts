// app/api/superadmin/etablissements/delete/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID de l\'établissement manquant.' }, { status: 400 });
    }

    // Début de la transaction
    await query('BEGIN');

    try {
      // a. Supprimer les projets de mémoire (liés aux étudiants de l'établissement)
      await query(`
        DELETE FROM projets_memoire 
        WHERE etudiant_id IN (SELECT id FROM utilisateurs WHERE etablissement_id = $1)
      `, [id]);

      // b. Supprimer les utilisateurs (étudiants, admins, encadreurs) de l'établissement
      await query('DELETE FROM utilisateurs WHERE etablissement_id = $1', [id]);

      // c. Supprimer les salles
      await query('DELETE FROM salles WHERE etablissement_id = $1', [id]);

      // d. Supprimer l'établissement lui-même et récupérer son nom
      const result = await query('DELETE FROM etablissements WHERE id = $1 RETURNING nom', [id]);

      if (result.rowCount === 0) {
        throw new Error('Établissement non trouvé.');
      }

      const nomEtablissement = result.rows[0].nom;

      // e. Enregistrer l'action dans votre table logs_activite
      // Note : ip_adresse est optionnel (NULL) pour le moment puisque l'API tourne côté serveur
      await query(
        'INSERT INTO logs_activite (utilisateur_nom, action, cible, ip_adresse) VALUES ($1, $2, $3, $4)',
        ['Superadmin (Système)', 'Suppression complète', nomEtablissement, '127.0.0.1']
      );

      // Valider la transaction
      await query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: `L'établissement "${nomEtablissement}" et toutes ses données associées ont été supprimés définitivement.` 
      });

    } catch (dbError: any) {
      // Annuler tout en cas d'erreur SQL
      await query('ROLLBACK');
      throw dbError;
    }

  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'établissement:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur.' }, { status: 500 });
  }
}