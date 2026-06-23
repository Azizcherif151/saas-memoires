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
  // Listes de données
  const [salles, setSalles] = useState<Salle[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [soutenances, setSoutenances] = useState<Soutenance[]>([]);
  const [chargement, setChargement] = useState(true);

  // Formulaire Salle
  const [nomSalle, setNomSalle] = useState('');
  const [estVirtuelle, setEstVirtuelle] = useState(false);

  // Formulaire Soutenance
  const [planif, setPlanif] = useState({ projet_id: '', salle_id: '', date_debut: '', date_fin: '' });

  // Notifications
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

  // Action : Créer une salle
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

  // Action : Planifier une soutenance
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
    <div className="p-8 text-black bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Salles & Soutenances</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez la logistique des locaux et planifiez les sessions de soutenance.</p>
      </header>

      {notif.message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${notif.type === 'succes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notif.message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Colonne Formulaires (Gauche) */}
        <div className="space-y-8 xl:col-span-1">
          
          {/* Formulaire Salles */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ajouter une Salle</h2>
            <form onSubmit={handleCreateSalle} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase">Nom de la salle</label>
                <input
                  type="text"
                  required
                  value={nomSalle}
                  onChange={(e) => setNomSalle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                  placeholder="Ex: Amphi A, Salle 204..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="virtuelle"
                  checked={estVirtuelle}
                  onChange={(e) => setEstVirtuelle(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="virtuelle" className="ml-2 block text-sm text-gray-700">
                  Cette salle est virtuelle (Visioconférence)
                </label>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium py-2 rounded-md transition">
                Créer la salle
              </button>
            </form>
          </div>

          {/* Formulaire Soutenances */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Planifier une Session</h2>
            <form onSubmit={handleScheduleSoutenance} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase">Projet de mémoire</label>
                <select
                  required
                  value={planif.projet_id}
                  onChange={(e) => setPlanif({ ...planif, projet_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black bg-white"
                >
                  <option value="">Sélectionner un projet...</option>
                  {projets.map((p) => (
                    <option key={p.id} value={p.id}>{p.titre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase">Salle assignée</label>
                <select
                  required
                  value={planif.salle_id}
                  onChange={(e) => setPlanif({ ...planif, salle_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black bg-white"
                >
                  <option value="">Sélectionner une salle...</option>
                  {salles.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom} {s.est_virtuelle ? '(Virtuelle)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase">Date & Heure de début</label>
                <input
                  type="datetime-local"
                  required
                  value={planif.date_debut}
                  onChange={(e) => setPlanif({ ...planif, date_debut: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase">Date & Heure de fin</label>
                <input
                  type="datetime-local"
                  required
                  value={planif.date_fin}
                  onChange={(e) => setPlanif({ ...planif, date_fin: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                />
              </div>

              <button type="submit" disabled={envoi} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition disabled:bg-indigo-400">
                {envoi ? 'Planification...' : 'Valider la planification'}
              </button>
            </form>
          </div>

        </div>

        {/* Liste des Plannings (Droite) */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Planning des Soutenances ({soutenances.length})</h2>
          
          {chargement ? (
            <p className="text-gray-500 text-sm animate-pulse">Chargement des données...</p>
          ) : soutenances.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune soutenance n'est encore programmée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Projet / Sujet</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Salle</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date & Horaires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {soutenances.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{s.projet_titre}</td>
                      <td className="px-4 py-3 text-gray-700">
                        <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded font-medium text-xs">
                          {s.salle_nom}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-sans text-xs">
                        <div className="font-semibold text-gray-900">
                          {new Date(s.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="text-gray-500 mt-0.5">
                          {new Date(s.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(s.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
}