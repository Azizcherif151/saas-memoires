'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  prenom: string;
  nom: string;
  email: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [chargement, setChargement] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) throw new Error('Non autorisé');
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

  const handleLogout = () => {
    document.cookie = 'session_token=; max-age=0; path=/;';
    router.push('/login');
  };

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
        <p className="text-gray-600 text-lg animate-pulse font-medium">Chargement d'EduSoutenance...</p>
      </div>
    );
  }

  // Fonction pour ajouter le style dynamique si l'onglet est actif
  const linkStyle = (path: string) => 
    `block px-4 py-2.5 rounded-md font-medium transition ${
      pathname === path 
        ? 'bg-indigo-600 text-white' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-100 text-black">
      {/* Sidebar Fixe */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl shrink-0">
        <div className="space-y-6">
          <div className="px-2 py-4 border-b border-slate-700">
            <h2 className="text-xl font-black tracking-wider text-indigo-400">EduSoutenance</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">Espace Administration</p>
          </div>
          
          <nav className="space-y-2">
            <Link href="/dashboard" className={linkStyle('/dashboard')}>
              Vue d'ensemble
            </Link>
            <Link href="/dashboard/etudiants" className={linkStyle('/dashboard/etudiants')}>
              Étudiants
            </Link>
            <Link href="/dashboard/memoires" className={linkStyle('/dashboard/memoires')}>
  Projets de Mémoire
</Link>
            <a href="#" className="block px-4 py-2.5 rounded-md text-slate-500 cursor-not-allowed text-xs">
              Salles & Soutenances (Bientôt)
            </a>
          </nav>
        </div>

        {/* Pied de la Sidebar */}
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

      {/* Zone de contenu variable */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}