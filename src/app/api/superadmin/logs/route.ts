import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

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

    // Récupérer les 50 derniers logs d'audit
    const result = await query(
      `SELECT id, utilisateur_nom, action, cible, ip_adresse AS ip, date_action
       FROM logs_activite 
       ORDER BY date_action DESC 
       LIMIT 50;`
    );

    return NextResponse.json({ logs: result.rows }, { status: 200 });

  } catch (error) {
    console.error('Erreur GET Logs:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}