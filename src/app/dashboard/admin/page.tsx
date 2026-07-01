'use client';

import { useEffect, useState } from 'react';

interface Etudiant {
  etudiant_id: string;
  nom: string;
  prenom: string;
  email: string;
  projet_id: string | null;
  titre: string | null;
  encadreur_id: string | null;
}

interface Encadreur {
  id: string;
  nom: string;
  prenom: string;
}

export default function AdminDashboard() {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [encadreurs, setEncadreurs] = useState<Encadreur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/attributions');
      if (res.ok) {
        const data = await res.json();
        setEtudiants(data.etudiants);
        setEncadreurs(data.encadreurs);
      }
    } catch (err) {
      console.error('Erreur de chargement des données admin', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignation = async (etudiantId: string, encadreurId: string, projetId: string | null) => {
    setSauvegardeEnCours(etudiantId);
    try {
      const res = await fetch('/api/admin/attributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etudiantId, encadreurId, projetId }),
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Erreur lors de l'attribution.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSauvegardeEnCours(null);
    }
  };

  const filteredEtudiants = etudiants.filter(et =>
    `${et.prenom} ${et.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    et.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sansProjets = etudiants.filter(et => !et.titre).length;
  const sansEncadreur = etudiants.filter(et => !et.encadreur_id).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Panel d'Administration
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Attribuez et gérez les encadreurs pour chaque étudiant
              </p>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Étudiants sans projet</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{sansProjets}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Étudiants sans encadreur</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{sansEncadreur}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👨‍🏫</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {chargement ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full animate-pulse mb-3">
              <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600 text-sm font-medium">Chargement du panel d'administration...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                Gestion des Attributions ({filteredEtudiants.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">Total: {etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''}</p>
            </div>

            {filteredEtudiants.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-600 text-sm font-medium">
                  {searchQuery ? 'Aucun étudiant ne correspond à votre recherche' : 'Aucun étudiant trouvé'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Étudiant</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Projet / Thème</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Encadreur Attribué</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEtudiants.map((etudiant) => (
                      <tr key={etudiant.etudiant_id} className="hover:bg-blue-50 transition">
                        {/* Étudiant */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {etudiant.prenom.charAt(0)}{etudiant.nom.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{etudiant.prenom} {etudiant.nom}</div>
                              <div className="text-xs text-gray-500 font-mono">{etudiant.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Projet */}
                        <td className="px-6 py-4 max-w-xs">
                          {etudiant.titre ? (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                              <span className="text-gray-900 font-medium truncate">{etudiant.titre}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                              <span className="text-amber-700 italic text-xs">Aucun projet créé</span>
                            </div>
                          )}
                        </td>

                        {/* Encadreur */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <select
                              disabled={sauvegardeEnCours === etudiant.etudiant_id}
                              defaultValue={etudiant.encadreur_id || ''}
                              onChange={(e) => handleAssignation(etudiant.etudiant_id, e.target.value, etudiant.projet_id)}
                              className="text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 disabled:opacity-50 cursor-pointer"
                            >
                              <option value="" disabled className="text-gray-500">
                                -- Choisir un encadreur --
                              </option>
                              {encadreurs.map((enc) => (
                                <option key={enc.id} value={enc.id}>
                                  M./Mme {enc.nom} {enc.prenom}
                                </option>
                              ))}
                            </select>
                            {sauvegardeEnCours === etudiant.etudiant_id && (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                                <span className="text-xs text-blue-600 font-medium">Mise à jour...</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-6 py-6 text-center">
        <p className="text-xs text-gray-500">
          <span className="font-semibold">EduSoutenance v1.0</span> — Panel d'administration
        </p>
      </div>
    </div>
  );
}