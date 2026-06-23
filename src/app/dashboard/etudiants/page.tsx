'use client';

import { useState, useEffect } from 'react';

interface Etudiant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  cree_at: string;
}

export default function EtudiantsPage() {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [chargement, setChargement] = useState(true);
  
  // États du formulaire
  const [formData, setFormData] = useState({ prenom: '', nom: '', email: '', motDePasse: '' });
  const [statut, setStatut] = useState<{ type: 'succes' | 'erreur' | null; message: string }>({ type: null, message: '' });
  const [envoi, setEnvoi] = useState(false);

  // 1. Charger la liste des étudiants au démarrage
  const fetchEtudiants = async () => {
    try {
      const res = await fetch('/api/etudiants');
      if (res.ok) {
        const data = await res.json();
        setEtudiants(data.etudiants);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des étudiants', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchEtudiants();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Soumission du formulaire d'ajout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setStatut({ type: null, message: '' });

    try {
      const res = await fetch('/api/etudiants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      setStatut({ type: 'succes', message: data.message });
      setFormData({ prenom: '', nom: '', email: '', motDePasse: '' }); // Réinitialise le formulaire
      fetchEtudiants(); // Rafraîchit la liste du tableau

    } catch (err: any) {
      setStatut({ type: 'erreur', message: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="p-8 text-black bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Étudiants</h1>
        <p className="text-sm text-gray-500 mt-1">Inscrivez et gérez la liste des étudiants de votre établissement.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne 1 : Formulaire d'ajout */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ajouter un étudiant</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Prénom</label>
              <input
                type="text"
                name="prenom"
                required
                value={formData.prenom}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                placeholder="Ex: Aziz"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Nom</label>
              <input
                type="text"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                placeholder="Ex: Cherif"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Adresse Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                placeholder="etudiant@ecole.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Mot de passe provisoire</label>
              <input
                type="password"
                name="motDePasse"
                required
                value={formData.motDePasse}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
              />
            </div>

            {statut.message && (
              <div className={`p-3 rounded-md text-xs text-center font-medium ${statut.type === 'succes' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {statut.message}
              </div>
            )}

            <button
              type="submit"
              disabled={envoi}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition disabled:bg-indigo-400"
            >
              {envoi ? 'Inscription...' : 'Inscrire l’étudiant'}
            </button>
          </form>
        </div>

        {/* Colonne 2 : Liste des étudiants */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Liste des inscrits ({etudiants.length})</h2>
          
          {chargement ? (
            <p className="text-gray-500 text-sm animate-pulse">Chargement de la liste...</p>
          ) : etudiants.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun étudiant inscrit pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nom complet</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date d'inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {etudiants.map((etudiant) => (
                    <tr key={etudiant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{etudiant.prenom} {etudiant.nom}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{etudiant.email}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(etudiant.cree_at).toLocaleDateString('fr-FR')}</td>
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