import { Pool } from 'pg';

// On utilise un "Pool" de connexions, ce qui est beaucoup plus performant 
// car il réutilise les connexions existantes au lieu d'en ouvrir une nouvelle à chaque clic.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Utile pour le développement : affiche les requêtes exécutées dans ton terminal
    console.log('Requête exécutée :', { text, duree: `${duration}ms`, lignes: res.rowCount });
    
    return res;
  } catch (error) {
    console.error('Erreur de base de données :', error);
    throw error;
  }
};