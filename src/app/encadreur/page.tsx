'use client';

import { useEffect, useState } from 'react';

interface Projet {
  id: string;
  titre: string;
  description: string;
  statut: 'brouillon' | 'en_attente_validation' | 'valide' | 'rejete';
  remarque_encadreur: string | null;
  url_livrable: string | null;
  etudiant_nom: string;
  etudiant_prenom: string;
  derniere_mise_a_jour: string;
}

export default function EncadreurDashboard() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [chargement, setChargement] = useState(true);
  const [remarques, setRemarques] = useState<{ [key: string]: string }>({});
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  const fetchProjets = async () => {
    try {
      const res = await fetch('/api/encadreur/projets');
      if (res.ok) {
        const data = await res.json();
        setProjets(data);
      }
    } catch (err) {
      console.error('Erreur de chargement des projets', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchProjets();
  }, []);

  const handleDecision = async (projetId: string, action: 'APPROUVER' | 'REJETER') => {
    setActionEnCours(projetId);
    try {
      const res = await fetch('/api/encadreur/projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetId,
          action,
          remarque: remarques[projetId] || '',
        }),
      });

      if (res.ok) {
        fetchProjets(); // Recharger la liste
      } else {
        alert('Une erreur est survenue lors de la soumission.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionEnCours(null);
    }
  };

  if (chargement) return <div className="p-12 text-center text-sm animate-pulse text-gray-500">Chargement de votre espace encadreur...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Espace Encadrement & Validations</h1>
        <p className="text-sm text-gray-500 mt-1">Suivez, annotez et validez les rapports de mémoire de vos étudiants.</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {projets.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white p-6 rounded-xl border text-center">Aucun projet ne vous a été attribué pour le moment.</p>
        ) : (
          projets.map((projet) => (
            <div key={projet.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Infos Projet & Étudiant */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    projet.statut === 'valide' ? 'bg-green-50 text-green-700 border border-green-200' :
                    projet.statut === 'en_attente_validation' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse' :
                    projet.statut === 'rejete' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {projet.statut === 'en_attente_validation' ? 'À valider' : projet.statut}
                  </span>
                  <span className="text-xs text-gray-400">
                    Mis à jour le : {new Date(projet.derniere_mise_a_jour).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <h2 className="text-lg font-bold text-gray-900">{projet.titre}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{projet.description}</p>
                
                <div className="pt-2 text-xs text-gray-500 font-medium">
                  Étudiant : <span className="text-gray-900">{projet.etudiant_prenom} {projet.etudiant_nom}</span>
                </div>

                {/* Lien vers le PDF si existant */}
                {projet.url_livrable ? (
                  <div className="pt-2">
                    <a 
                      href={projet.url_livrable} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                    >
                      📄 Ouvrir et relire le document PDF soumis
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 italic pt-2">Aucun document déposé par l'étudiant pour le moment.</p>
                )}
              </div>

              {/* Bloc Décision Encadreur */}
              <div className="bg-gray-50 p-4 rounded-xl flex flex-col justify-between border border-gray-100">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Commentaires / Remarques</label>
                  <textarea
                    rows={3}
                    placeholder="Laissez vos corrections ou retours ici..."
                    defaultValue={projet.remarque_encadreur || ''}
                    onChange={(e) => setRemarques({ ...remarques, [projet.id]: e.target.value })}
                    className="w-full text-xs p-2 rounded-md border border-gray-200 focus:outline-indigo-600 resize-none bg-white"
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    disabled={actionEnCours === projet.id || !projet.url_livrable}
                    onClick={() => handleDecision(projet.id, 'REJETER')}
                    className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold transition disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                  <button
                    disabled={actionEnCours === projet.id || !projet.url_livrable}
                    onClick={() => handleDecision(projet.id, 'APPROUVER')}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition disabled:opacity-50"
                  >
                    Valider le projet
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}