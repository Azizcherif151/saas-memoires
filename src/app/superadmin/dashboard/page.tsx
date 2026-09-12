'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  ShieldAlert,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Power,
  PowerOff,
  LogOut,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface Etablissement {
  id: string;
  nom: string;
  responsable: string;
  email?: string;
  etudiants?: number;
  statut: string;
}

interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: string;
  etablissement: string | null;
}

interface LogActivite {
  id: number;
  utilisateur_nom: string;
  action: string;
  cible: string;
  ip: string;
  date_action: string;
}

type TabType = 'etablissements' | 'utilisateurs' | 'logs';

export default function SuperAdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('etablissements');
  const [formData, setFormData] = useState({
    nom: '',
    responsable: '',
    email: '',
    prenomAdmin: '',
    nomAdmin: '',
    emailAdmin: '',
    motDePasseEnClair: '',
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [logs, setLogs] = useState<LogActivite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [resEtab, resUsers, resLogs] = await Promise.all([
          fetch('/api/superadmin/etablissements'),
          fetch('/api/superadmin/utilisateurs'),
          fetch('/api/superadmin/logs'),
        ]);

        const dataEtab = await resEtab.json();
        const dataUsers = await resUsers.json();
        const dataLogs = await resLogs.json();

        if (resEtab.ok) setEtablissements(dataEtab.etablissements || dataEtab || []);
        if (resUsers.ok) setUtilisateurs(dataUsers.utilisateurs || dataUsers || []);
        if (resLogs.ok) setLogs(dataLogs.logs || dataLogs || []);
      } catch {
        setIsError(true);
        setStatusMessage('Erreur réseau lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) router.push('/login');
    } catch (error) {
      console.error('Erreur réseau lors de la déconnexion', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleCreateEtablissement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    setStatusMessage('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/superadmin/etablissements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setStatusMessage(data.error || "Une erreur est survenue lors de la création.");
      } else {
        setIsError(false);
        setStatusMessage(`✓ L'établissement "${formData.nom}" et son compte administrateur ont été créés.`);

        const nouvelEtab = {
          id: data.data?.etablissement?.id || Math.random().toString(),
          nom: formData.nom,
          responsable: formData.responsable || `${formData.prenomAdmin} ${formData.nomAdmin}`,
          email: formData.email || formData.emailAdmin,
          statut: 'Actif',
        };
        setEtablissements((prev) => [nouvelEtab, ...prev]);

        setFormData({
          nom: '',
          responsable: '',
          email: '',
          prenomAdmin: '',
          nomAdmin: '',
          emailAdmin: '',
          motDePasseEnClair: '',
        });

        const resLogs = await fetch('/api/superadmin/logs');
        const dataLogs = await resLogs.json();
        if (resLogs.ok) setLogs(dataLogs.logs || []);
      }
    } catch {
      setIsError(true);
      setStatusMessage('Erreur de communication avec le serveur.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Actif' ? 'Suspendu' : 'Actif';
    try {
      const response = await fetch('/api/superadmin/etablissements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut: nextStatus }),
      });
      if (response.ok) {
        setEtablissements((prev) =>
          prev.map((item) => (item.id === id ? { ...item, statut: nextStatus } : item))
        );
        const resLogs = await fetch('/api/superadmin/logs');
        const dataLogs = await resLogs.json();
        if (resLogs.ok) setLogs(dataLogs.logs || []);
      }
    } catch {
      console.error('Impossible de modifier le statut.');
    }
  };

  const handleDeleteEtablissement = async (id: string, nom: string) => {
    if (!window.confirm(`Supprimer l'établissement "${nom}" ?`)) return;
    if (
      !window.confirm(
        `ATTENTION : action IRRÉVERSIBLE.\n\nTous les utilisateurs, projets et données liés à "${nom}" seront supprimés.\n\nConfirmer ?`
      )
    )
      return;

    setDeletingId(id);
    setIsError(false);
    setStatusMessage('');

    try {
      const response = await fetch('/api/superadmin/etablissements/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsError(false);
        setStatusMessage(`✓ ${data.message}`);
        setEtablissements((prev) => prev.filter((item) => item.id !== id));
        const resLogs = await fetch('/api/superadmin/logs');
        const dataLogs = await resLogs.json();
        if (resLogs.ok) setLogs(dataLogs.logs || []);
      } else {
        setIsError(true);
        setStatusMessage(data.error || 'Erreur lors de la suppression.');
      }
    } catch {
      setIsError(true);
      setStatusMessage('Erreur réseau lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEtablissements = etablissements.filter(
    (e) =>
      e.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.responsable.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUtilisateurs = utilisateurs.filter(
    (u) =>
      u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLogs = logs.filter(
    (l) =>
      l.utilisateur_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.cible.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const actifs = etablissements.filter((e) => e.statut === 'Actif').length;
  const suspendus = etablissements.filter((e) => e.statut === 'Suspendu').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              E
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                Panel SuperAdmin
              </h1>
              <p className="text-xs text-slate-500">Console de contrôle global • EduSoutenance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Accueil
            </Link>
            <button
              onClick={handleLogout}
              disabled={isDisconnecting}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isDisconnecting ? 'Déconnexion...' : 'Déconnexion'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Établissements', value: etablissements.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Actifs', value: actifs, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Suspendus', value: suspendus, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Utilisateurs', value: utilisateurs.length, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Message statut */}
        {statusMessage && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              isError
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {isError ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            )}
            {statusMessage}
          </div>
        )}

        {/* Onglets */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-px">
          {[
            { id: 'etablissements' as TabType, label: 'Établissements', icon: Building2 },
            { id: 'utilisateurs' as TabType, label: 'Comptes', icon: Users },
            { id: 'logs' as TabType, label: 'Sécurité & Logs', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Recherche */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* ========== ONGLET ÉTABLISSEMENTS ========== */}
            {activeTab === 'etablissements' && (
              <div className="grid gap-8 lg:grid-cols-5">
                {/* Formulaire */}
                <div className="lg:col-span-2">
                  <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900">Nouvel établissement</h2>
                        <p className="text-xs text-slate-500">Création + compte admin</p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateEtablissement} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Nom de l&apos;établissement *
                        </label>
                        <input
                          type="text"
                          name="nom"
                          required
                          value={formData.nom}
                          onChange={handleChange}
                          placeholder="Ex: Université Félix Houphouët-Boigny"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                          Administrateur principal
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Prénom *</label>
                            <input
                              type="text"
                              name="prenomAdmin"
                              required
                              value={formData.prenomAdmin}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Nom *</label>
                            <input
                              type="text"
                              name="nomAdmin"
                              required
                              value={formData.nomAdmin}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="mb-1 block text-xs font-medium text-slate-600">Email admin *</label>
                          <input
                            type="email"
                            name="emailAdmin"
                            required
                            value={formData.emailAdmin}
                            onChange={handleChange}
                            placeholder="admin@universite.ci"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div className="mt-3">
                          <label className="mb-1 block text-xs font-medium text-slate-600">Mot de passe provisoire *</label>
                          <input
                            type="password"
                            name="motDePasseEnClair"
                            required
                            value={formData.motDePasseEnClair}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isCreating}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Créer l&apos;établissement
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Liste */}
                <div className="lg:col-span-3">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <h3 className="font-semibold text-slate-900">
                        Établissements ({filteredEtablissements.length})
                      </h3>
                    </div>

                    {filteredEtablissements.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Building2 className="mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">Aucun établissement</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Créez le premier via le formulaire
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredEtablissements.map((etab) => (
                          <div
                            key={etab.id}
                            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/80 transition"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900 truncate">{etab.nom}</p>
                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                    etab.statut === 'Actif'
                                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                  }`}
                                >
                                  {etab.statut}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {etab.responsable}
                                {etab.email ? ` · ${etab.email}` : ''}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleStatus(etab.id, etab.statut)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                  etab.statut === 'Actif'
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {etab.statut === 'Actif' ? (
                                  <>
                                    <PowerOff className="h-3.5 w-3.5" /> Suspendre
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-3.5 w-3.5" /> Activer
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteEtablissement(etab.id, etab.nom)}
                                disabled={deletingId === etab.id}
                                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                {deletingId === etab.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========== ONGLET UTILISATEURS ========== */}
            {activeTab === 'utilisateurs' && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="font-semibold text-slate-900">
                    Comptes utilisateurs ({filteredUtilisateurs.length})
                  </h3>
                </div>

                {filteredUtilisateurs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Users className="mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-500">Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Nom</th>
                          <th className="px-5 py-3">Email</th>
                          <th className="px-5 py-3">Rôle</th>
                          <th className="px-5 py-3">Établissement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUtilisateurs.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80">
                            <td className="px-5 py-3.5 font-medium text-slate-900">{u.nom}</td>
                            <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                            <td className="px-5 py-3.5">
                              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600">
                              {u.etablissement || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ========== ONGLET LOGS ========== */}
            {activeTab === 'logs' && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="font-semibold text-slate-900">
                    Journal d&apos;activité ({filteredLogs.length})
                  </h3>
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <ShieldAlert className="mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-500">Aucune activité enregistrée</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Utilisateur</th>
                          <th className="px-5 py-3">Action</th>
                          <th className="px-5 py-3">Cible</th>
                          <th className="px-5 py-3">IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/80">
                            <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                              {new Date(log.date_action).toLocaleString('fr-FR')}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-slate-900">
                              {log.utilisateur_nom}
                            </td>
                            <td className="px-5 py-3.5 text-slate-700">{log.action}</td>
                            <td className="px-5 py-3.5 text-slate-600">{log.cible}</td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                              {log.ip}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}