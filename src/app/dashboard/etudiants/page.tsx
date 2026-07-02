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
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({ prenom: '', nom: '', email: '', motDePasse: '' });
  const [statut, setStatut] = useState<{ type: 'succes' | 'erreur' | null; message: string }>({ type: null, message: '' });
  const [envoi, setEnvoi] = useState(false);

  const fetchEtudiants = async () => {
    try {
      const res = await fetch('/api/etudiants');
      if (res.ok) {
        const data = await res.json();
        setEtudiants(data.etudiants || []);
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
      setFormData({ prenom: '', nom: '', email: '', motDePasse: '' });
      fetchEtudiants();

    } catch (err: any) {
      setStatut({ type: 'erreur', message: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  const filteredEtudiants = etudiants.filter(et => 
    `${et.prenom} ${et.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    et.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Gestion des Étudiants
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Inscrivez et gérez la liste complète de vos étudiants
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300  -lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire d'ajout */}
          <div className="bg-white  -xl border border-gray-200 p-8 shadow-sm h-fit sticky top-24">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50  -lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ajouter un étudiant</h2>
              <p className="text-sm text-gray-600 mt-1">Créez un nouveau compte d'accès</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                  placeholder="Ex: Aziz"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Nom</label>
                <input
                  type="text"
                  name="nom"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                  placeholder="Ex: Cherif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                  placeholder="etudiant@ecole.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Mot de passe</label>
                <input
                  type="password"
                  name="motDePasse"
                  required
                  value={formData.motDePasse}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>

              {statut.message && (
                <div className={`p-3  -lg text-xs font-medium text-center transition ${
                  statut.type === 'succes'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {statut.message}
                </div>
              )}

              <button
                type="submit"
                disabled={envoi}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-2.5  -lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
              >
                {envoi ? 'Inscription en cours...' : 'Inscrire l\'étudiant'}
              </button>
            </form>
          </div>

          {/* Liste des étudiants */}
          <div className="lg:col-span-2 bg-white  -xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                Liste des inscrits ({filteredEtudiants.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''}
              </p>
            </div>

            {chargement ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100  -full animate-pulse mb-3">
                  <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 text-sm font-medium">Chargement de la liste...</p>
              </div>
            ) : filteredEtudiants.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-600 text-sm font-medium">
                  {searchQuery ? 'Aucun étudiant ne correspond à votre recherche' : 'Aucun étudiant inscrit pour le moment'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Nom complet</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEtudiants.map((etudiant) => (
                      <tr key={etudiant.id} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8  -full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {etudiant.prenom.charAt(0)}{etudiant.nom.charAt(0)}
                            </div>
                            {etudiant.prenom} {etudiant.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">{etudiant.email}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {new Date(etudiant.cree_at).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
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