'use client';

import { useState, useEffect } from 'react';

interface MembreJury {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  cree_at: string;
}

export default function JuryPage() {
  const [jury, setJury] = useState<MembreJury[]>([]);
  const [chargement, setChargement] = useState(true);
  
  const [formData, setFormData] = useState({ prenom: '', nom: '', email: '', motDePasse: '' });
  const [statut, setStatut] = useState<{ type: 'succes' | 'erreur' | null; message: string }>({ type: null, message: '' });
  const [envoi, setEnvoi] = useState(false);

  const fetchJury = async () => {
    try {
      const res = await fetch('/api/jury');
      if (res.ok) {
        const data = await res.json();
        setJury(data.jury);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du jury', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchJury();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setStatut({ type: null, message: '' });

    try {
      const res = await fetch('/api/jury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');

      setStatut({ type: 'succes', message: data.message });
      setFormData({ prenom: '', nom: '', email: '', motDePasse: '' });
      fetchJury();
    } catch (err: any) {
      setStatut({ type: 'erreur', message: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="p-8 text-black bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Membres du Jury</h1>
        <p className="text-sm text-gray-500 mt-1">Enregistrez les enseignants et évaluateurs pour vos sessions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ajouter un évaluateur</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">Prénom</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                placeholder="Ex: Jean"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">Nom</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                placeholder="Ex: Dupont"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">Adresse Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                placeholder="enseignant@ecole.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">Mot de passe d'accès</label>
              <input
                type="password"
                required
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
            >
              {envoi ? 'Création...' : 'Ajouter au jury'}
            </button>
          </form>
        </div>

        {/* Liste */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Membres enregistrés ({jury.length})</h2>
          
          {chargement ? (
            <p className="text-gray-500 text-sm animate-pulse">Chargement...</p>
          ) : jury.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun membre du jury enregistré pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nom complet</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Membre depuis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jury.map((membre) => (
                    <tr key={membre.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{membre.prenom} {membre.nom}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{membre.email}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(membre.cree_at).toLocaleDateString('fr-FR')}</td>
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