'use client';

import { useState, useEffect } from 'react';

interface Salle {
  id: string;
  nom: string;
  est_virtuelle: boolean;
}

interface Projet {
  id: string;
  titre: string;
}

interface Soutenance {
  id: string;
  date_debut: string;
  date_fin: string;
  note_finale: number | null;
  projet_titre: string;
  salle_nom: string;
}

export default function SoutenancesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [soutenances, setSoutenances] = useState<Soutenance[]>([]);
  const [chargement, setChargement] = useState(true);

  const [nomSalle, setNomSalle] = useState('');
  const [estVirtuelle, setEstVirtuelle] = useState(false);

  const [planif, setPlanif] = useState({ projet_id: '', salle_id: '', date_debut: '', date_fin: '' });

  const [notif, setNotif] = useState<{ type: 'succes' | 'erreur' | null; message: string }>({ type: null, message: '' });
  const [envoi, setEnvoi] = useState(false);

  const loadAllData = async () => {
    try {
      const [resSalles, resProjets, resSout] = await Promise.all([
        fetch('/api/salles'),
        fetch('/api/memoires'),
        fetch('/api/soutenances'),
      ]);

      if (resSalles.ok) setSalles((await resSalles.json()).salles);
      if (resProjets.ok) setProjets((await resProjets.json()).memoires);
      if (resSout.ok) setSoutenances((await resSout.json()).soutenances);
    } catch (err) {
      console.error('Erreur lors du chargement des données', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateSalle = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotif({ type: null, message: '' });
    try {
      const res = await fetch('/api/salles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: nomSalle, est_virtuelle: estVirtuelle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotif({ type: 'succes', message: 'Salle créée avec succès !' });
      setNomSalle('');
      setEstVirtuelle(false);
      loadAllData();
    } catch (err: any) {
      setNotif({ type: 'erreur', message: err.message });
    }
  };

  const handleScheduleSoutenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setNotif({ type: null, message: '' });

    try {
      const res = await fetch('/api/soutenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planif),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotif({ type: 'succes', message: 'Soutenance planifiée avec succès !' });
      setPlanif({ projet_id: '', salle_id: '', date_debut: '', date_fin: '' });
      loadAllData();
    } catch (err: any) {
      setNotif({ type: 'erreur', message: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Salles & Soutenances
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Gérez la logistique des locaux et planifiez les sessions de soutenance
          </p>
        </div>
      </header>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {notif.message && (
          <div className={`p-4  -lg text-sm font-medium flex items-center gap-3 ${
            notif.type === 'succes'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <span>{notif.type === 'succes' ? '✓' : '⚠️'}</span>
            {notif.message}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Formulaires */}
          <div className="space-y-6">
            {/* Création de salle */}
            <div className="bg-white  -xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50  -lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m0 0H9.5m0 0H4m0 0v-1" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Ajouter une salle</h2>
                <p className="text-xs text-gray-600 mt-1">Créez une salle de soutenance</p>
              </div>

              <form onSubmit={handleCreateSalle} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Nom de la salle</label>
                  <input
                    type="text"
                    required
                    value={nomSalle}
                    onChange={(e) => setNomSalle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                    placeholder="Ex: Amphi A, Salle 204..."
                  />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-3  -lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="virtuelle"
                    checked={estVirtuelle}
                    onChange={(e) => setEstVirtuelle(e.target.checked)}
                    className="h-4 w-4 text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="virtuelle" className="text-sm text-gray-700 cursor-pointer flex-1">
                    Salle virtuelle (Visioconférence)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold py-2.5  -lg transition-all duration-200 transform hover:scale-105 text-sm uppercase tracking-wider"
                >
                  Créer la salle
                </button>
              </form>
            </div>

            {/* Planification */}
            <div className="bg-white  -xl border border-blue-200 p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-100  -lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Planifier une session</h2>
                <p className="text-xs text-gray-600 mt-1">Programmez une nouvelle soutenance</p>
              </div>

              <form onSubmit={handleScheduleSoutenance} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Projet</label>
                  <select
                    required
                    value={planif.projet_id}
                    onChange={(e) => setPlanif({ ...planif, projet_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
                  >
                    <option value="">Sélectionner un projet...</option>
                    {projets.map((p) => (
                      <option key={p.id} value={p.id}>{p.titre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Salle</label>
                  <select
                    required
                    value={planif.salle_id}
                    onChange={(e) => setPlanif({ ...planif, salle_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
                  >
                    <option value="">Sélectionner une salle...</option>
                    {salles.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom} {s.est_virtuelle ? '🌐' : '📍'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Date & Heure début</label>
                  <input
                    type="datetime-local"
                    required
                    value={planif.date_debut}
                    onChange={(e) => setPlanif({ ...planif, date_debut: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Date & Heure fin</label>
                  <input
                    type="datetime-local"
                    required
                    value={planif.date_fin}
                    onChange={(e) => setPlanif({ ...planif, date_fin: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={envoi}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-2.5  -lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 text-sm uppercase tracking-wider"
                >
                  {envoi ? 'Planification...' : 'Valider la planification'}
                </button>
              </form>
            </div>
          </div>

          {/* Planning */}
          <div className="xl:col-span-2 bg-white  -xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                Planning des Soutenances ({soutenances.length})
              </h2>
            </div>

            {chargement ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100  -full animate-pulse mb-3">
                  <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 text-sm font-medium">Chargement des données...</p>
              </div>
            ) : soutenances.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-600 text-sm font-medium">Aucune soutenance n'est encore programmée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Projet / Sujet</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Salle</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Date & Horaires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {soutenances.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs truncate">
                          {s.projet_titre}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800  -full font-medium text-xs">
                            📍 {s.salle_nom}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900">
                              {new Date(s.date_debut).toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-gray-500 text-xs font-mono">
                              {new Date(s.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(s.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}