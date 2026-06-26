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
        fetchData(); // Actualiser l'état
      } else {
        alert("Erreur lors de l'attribution.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSauvegardeEnCours(null);
    }
  };

  if (chargement) return <div className="p-12 text-center text-sm animate-pulse text-gray-500">Chargement du panel d'administration...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel Administration</h1>
        <p className="text-sm text-gray-500 mt-1">Attribuez et gérez les encadreurs pour chaque étudiant inscrit.</p>
      </div>

      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
              <th className="p-4">Étudiant</th>
              <th className="p-4">Projet / Thème</th>
              <th className="p-4">Encadreur Attribué</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {etudiants.map((etudiant) => (
              <tr key={etudiant.etudiant_id} className="hover:bg-gray-50/50 transition">
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{etudiant.prenom} {etudiant.nom}</div>
                  <div className="text-xs text-gray-400">{etudiant.email}</div>
                </td>
                <td className="p-4 max-w-xs truncate">
                  {etudiant.titre ? (
                    <span className="text-gray-900 font-medium">{etudiant.titre}</span>
                  ) : (
                    <span className="text-amber-600 italic text-xs">Aucun projet créé (sera initialisé)</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <select
                      disabled={sauvegardeEnCours === etudiant.etudiant_id}
                      defaultValue={etudiant.encadreur_id || ''}
                      onChange={(e) => handleAssignation(etudiant.etudiant_id, e.target.value, etudiant.projet_id)}
                      className="text-xs p-2 rounded-md border border-gray-200 bg-white focus:outline-indigo-600 font-medium text-gray-800 disabled:opacity-50"
                    >
                      <option value="" disabled>-- Choisir un encadreur --</option>
                      {encadreurs.map((enc) => (
                        <option key={enc.id} value={enc.id}>
                          M./Mme {enc.nom} {enc.prenom}
                        </option>
                      ))}
                    </select>
                    {sauvegardeEnCours === etudiant.etudiant_id && (
                      <span className="text-xs text-indigo-600 animate-pulse font-medium">Mise à jour...</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}