'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  prenom: string;
  nom: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [chargement, setChargement] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) {
          throw new Error('Non autorisé');
        }
        const data = await res.json();
        setUser(data.utilisateur);
      } catch (err) {
        router.push('/login');
      } finally {
        setChargement(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    // Pour se déconnecter, on appellera une route ou on videra le cookie
    // Option simple temporaire : redirection après suppression logique
    document.cookie = 'session_token=; max-age=0; path=/;';
    router.push('/login');
  };

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg animate-pulse">Chargement de votre espace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100 text-black">
      {/* 1. Sidebar / Barre latérale de navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div className="space-y-6">
          <div className="px-2 py-4 border-b border-slate-700">
  <h2 className="text-xl font-black tracking-wider text-indigo-400">EduSoutenance</h2>
  <p className="text-xs text-slate-400 mt-1 font-mono">Espace Administration</p>
</div>
          
          <nav className="space-y-2">
            <a href="#" className="block px-4 py-2.5 rounded-md bg-indigo-600 text-white font-medium">
              Vue d'ensemble
            </a>
            <a href="#" className="block px-4 py-2.5 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition">
              Étudiants
            </a>
            <a href="#" className="block px-4 py-2.5 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition">
              Projets de Mémoire
            </a>
            <a href="#" className="block px-4 py-2.5 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition">
              Salles & Soutenances
            </a>
            <a href="#" className="block px-4 py-2.5 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition">
              Membres du Jury
            </a>
          </nav>
        </div>

        {/* Pied de la Sidebar avec l'utilisateur connecté */}
        <div className="pt-4 border-t border-slate-700 space-y-3">
          <div className="px-2">
            <p className="text-sm font-semibold truncate">{user?.prenom} {user?.nom}</p>
            <p className="text-xs text-slate-400 truncate font-mono">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition text-xs py-2 px-3 rounded-md font-medium"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* 2. Contenu principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center pb-6 border-b border-gray-200 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-sm text-gray-500 mt-1">
              Bienvenue dans l'espace de gestion de votre établissement.
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            {user?.role}
          </span>
        </header>

        {/* Grille de statistiques rapides (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Étudiants</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider font-sans">Mémoires</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Soutenances</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Salles de Jury</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}