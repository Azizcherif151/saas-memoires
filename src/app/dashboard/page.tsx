'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  const cards = [
    {
      label: 'Étudiants',
      value: stats?.etudiants ?? 0,
      href: '/dashboard/etudiants',
      color: 'bg-indigo-500',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Mémoires',
      value: stats?.projets ?? 0,
      href: '/dashboard/memoires',
      color: 'bg-violet-500',
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Soutenances',
      value: stats?.soutenances ?? 0,
      href: '/dashboard/soutenances',
      color: 'bg-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Salles',
      value: stats?.salles ?? 0,
      href: '/dashboard/soutenances',
      color: 'bg-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue d&apos;ensemble de la gestion de votre établissement
        </p>
      </div>

      {/* Stats */}
      {chargement ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg} ${card.text}`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                Voir le détail
                <svg className="ml-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Actions rapides */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/dashboard/etudiants', title: 'Ajouter un étudiant', desc: 'Créer un nouveau compte étudiant' },
            { href: '/dashboard/memoires', title: 'Nouveau sujet de mémoire', desc: 'Attribuer un projet à un étudiant' },
            { href: '/dashboard/soutenances', title: 'Planifier une soutenance', desc: 'Choisir salle + créneau + jury' },
            { href: '/dashboard/admin', title: 'Attribuer un encadreur', desc: 'Lier un encadreur à un étudiant' },
            { href: '/dashboard/jury', title: 'Gérer le jury', desc: 'Créer et affecter les membres du jury' },
          ].map((action) => (
            <Link
              key={action.href + action.title}
              href={action.href}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">{action.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}