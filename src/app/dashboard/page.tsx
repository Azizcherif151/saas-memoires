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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Tableau de bord
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Bienvenue dans la vue d'ensemble de votre établissement
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
        {chargement ? (
          /* Loading Skeleton */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-white  -xl border border-gray-200 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques clés</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Étudiants Card */}
                <div className="group relative bg-white  -xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent  -xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Étudiants</span>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50  -lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 5h-4m7-9h-4m4 5h4m-11 0h4" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-gray-900">{stats?.etudiants}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">↑ 12%</span>
                        <span className="text-xs text-gray-500">vs mois dernier</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mémoires Card */}
                <div className="group relative bg-white  -xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent  -xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Mémoires</span>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50  -lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.996 10-10.747S17.5 6.253 12 6.253z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-gray-900">{stats?.projets}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">↑ 8%</span>
                        <span className="text-xs text-gray-500">vs mois dernier</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Soutenances Card */}
                <div className="group relative bg-white  -xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent  -xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Soutenances</span>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50  -lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-gray-900">{stats?.soutenances}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-yellow-600 font-medium">→ 5%</span>
                        <span className="text-xs text-gray-500">stable</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salles Card */}
                <div className="group relative bg-white  -xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent  -xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Salles Jury</span>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50  -lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m0 0H9.5m0 0H4m0 0v-1" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-gray-900">{stats?.salles}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">↑ 3%</span>
                        <span className="text-xs text-gray-500">vs mois dernier</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}