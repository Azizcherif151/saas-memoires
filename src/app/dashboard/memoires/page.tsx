'use client';

import { useState, useEffect } from 'react';

interface Memoire {
  id: string;
  titre: string;
  description: string;
  statut: string;
  etudiant_prenom?: string;
  etudiant_nom?: string;
  derniere_mise_a_jour: string;
}

interface Etudiant {
  id: string;
  prenom: string;
  nom: string;
}

export default function MemoiresPage() {
  const [memoires, setMemoires] = useState<Memoire[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [chargement, setChargement] = useState(true);

  const [formData, setFormData] = useState({ titre: '', description: '', etudiantId: '' });
  const [statut, setStatut] = useState<{ type: 'succes' | 'erreur' | null; message: string }>({ type: null, message: '' });
  const [envoi, setEnvoi] = useState(false);

  const fetchData = async () => {
    try {
      // On interroge la route unifiée /api/memoires pour récupérer les deux listes d'un coup
      const res = await fetch('/api/memoires');
      const data = await res.json();

      if (res.ok) {
        setMemoires(data.memoires || []);
        setEtudiants(data.etudiants || []);
      } else {
        console.error("Erreur renvoyée par l'API :", data.error);
      }

    } catch (err) {
      console.error('Erreur de chargement des données', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setStatut({ type: null, message: '' });

    try {
      const res = await fetch('/api/memoires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création.');

      setStatut({ type: 'succes', message: data.message });
      setFormData({ titre: '', description: '', etudiantId: '' });
      fetchData(); // Actualise instantanément la liste des mémoires et retire l'étudiant choisi de la liste déroulante
    } catch (err: any) {
      setStatut({ type: 'erreur', message: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="p-8 text-black bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projets de Mémoire</h1>
        <p className="text-sm text-gray-500 mt-1">Attribuez et suivez l'avancement des sujets de thèses.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nouveau sujet</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">Titre du projet</label>
              <input
                type="text"
                required
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                placeholder="Ex: Application de gestion de stock..."
              />
            </div>
            

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">Description / Cahier des charges</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black h-24 resize-none"
                placeholder="Objectifs du projet..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">Attribuer à un Étudiant (Optionnel)</label>
              <select
                value={formData.etudiantId}
                onChange={(e) => setFormData({ ...formData, etudiantId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black bg-white"
              >
                <option value="">Sélectionner un étudiant...</option>
                {etudiants.map((et) => (
                  <option key={et.id} value={et.id}>{et.prenom} {et.nom}</option>
                ))}
              </select>
            </div>

            {statut.message && (
              <div className={`p-3 rounded-md text-xs text-center font-medium ${statut.type === 'succes' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {statut.message}
              </div>
            )}

            <button
              type="submit"
              disabled={envoi}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
            >
              {envoi ? 'Enregistrement...' : 'Créer le projet'}
            </button>
          </form>
        </div>

        {/* Liste */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Liste des projets ({memoires.length})</h2>
          {chargement ? (
            <p className="text-gray-500 text-sm animate-pulse">Chargement...</p>
          ) : memoires.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun sujet enregistré.</p>
          ) : (
            <div className="space-y-4">
              {memoires.map((m) => (
                <div key={m.id} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition bg-gray-50">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 text-base">{m.titre}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
  m.statut === 'valide' ? 'bg-green-100 text-green-800' :
  m.statut === 'brouillon' ? 'bg-gray-100 text-gray-800' :
  'bg-yellow-100 text-yellow-800'
}`}>
  {m.statut === 'brouillon' ? 'Brouillon' : m.statut === 'en_attente_validation' ? 'En attente' : m.statut}
</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{m.description || 'Aucune description.'}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <div>
                      Assigné à : <span className="font-medium text-gray-700">{m.etudiant_prenom ? `${m.etudiant_prenom} ${m.etudiant_nom}` : 'Non attribué'}</span>
                    </div>
                    <div>
                      Mis à jour le : {new Date(m.derniere_mise_a_jour).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}