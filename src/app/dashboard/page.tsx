'use client';

import { useEffect, useState } from 'react';

interface Stats {
  etudiants: number;
  projets: number;
  soutenances: number;
  salles: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques', err);
      } finally {
        setChargement(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8 text-black bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center pb-6 border-b border-gray-200 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bienvenue dans la vue d'ensemble de la gestion de votre établissement.
          </p>
        </div>
      </header>

      {chargement ? (
        <p className="text-gray-500 text-sm animate-pulse">Chargement des données clés...</p>
      ) : (
        /* Grille de statistiques rapides */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Étudiants</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.etudiants}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Mémoires</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.projets}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Soutenances</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.soutenances}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Salles de Jury</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.salles}</p>
          </div>
        </div>
      )}
    </div>
  );
}