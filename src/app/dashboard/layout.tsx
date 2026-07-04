'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  DashboardIcon,
  StudentIcon,
  ProjectIcon,
  JuryIcon,
  CalendarIcon,
  SettingsIcon,
  LogoutIcon,
} from '@/components/icons';

interface UserProfile {
  prenom: string;
  nom: string;
  email: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [chargement, setChargement] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 mb-4 animate-pulse">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg font-medium">Chargement d'EduSoutenance...</p>
        </div>
      </div>
    );
  }

  // Fonction pour ajouter le style dynamique si l'onglet est actif
  const linkStyle = (path: string) => {
    return `flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 ${
      pathname === path 
        ? 'bg-blue-600 text-white shadow-md scale-105' 
        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
    }`;
  };

  const navItems = [
    { href: '/dashboard', label: 'Vue d\'ensemble', Icon: DashboardIcon },
    { href: '/dashboard/etudiants', label: 'Étudiants', Icon: StudentIcon },
    { href: '/dashboard/memoires', label: 'Projets de Mémoire', Icon: ProjectIcon },
    { href: '/dashboard/jury', label: 'Membres du Jury', Icon: JuryIcon },
    { href: '/dashboard/soutenances', label: 'Salles & Soutenances', Icon: CalendarIcon },
    { href: '/dashboard/admin', label: 'Administration', Icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 hover:shadow-md transition"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative w-72 bg-white border-r border-gray-200 flex flex-col justify-between p-6 shadow-lg lg:shadow-none transition-transform duration-300 z-40 h-screen overflow-y-auto shrink-0`}>
        
        {/* Top Section */}
        <div className="space-y-8">
          {/* Logo & Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.996 10-10.747S17.5 6.253 12 6.253z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">EduSoutenance</h2>
                <p className="text-xs text-gray-500 font-medium">Administration</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkStyle(item.href)}
                onClick={() => setSidebarOpen(false)}
              >
                <item.Icon />
                <span>{item.label}</span>
                {pathname === item.href && (
                  <span className="ml-auto text-lg">✓</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="h-px bg-gray-200"></div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          {/* User Profile */}
          <div className="bg-gray-50 p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-block w-2 h-2 bg-green-500"></span>
              <span className="text-gray-600 font-medium capitalize">{user?.role || 'Utilisateur'}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 text-sm py-2.5 px-4 font-medium shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>

          {/* Footer Info */}
          <p className="text-xs text-gray-500 text-center pt-2">
            EduSoutenance v1.0
          </p>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full lg:w-auto">
        {children}
      </div>
    </div>
  );
}