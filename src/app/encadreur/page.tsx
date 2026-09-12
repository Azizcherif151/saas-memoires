'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Loader,
  ChevronRight
} from 'lucide-react';
import MemoirEditorPro from '@/components/memoir/MemoirEditorPro';

interface Projet {
  id: string;
  titre: string;
  description: string;
  statut: 'brouillon' | 'en_attente_validation' | 'valide' | 'rejete' | 'A modifier';
  remarque_encadreur: string | null;
  url_livrable: string | null;
  etudiant_nom: string;
  etudiant_prenom: string;
  derniere_mise_a_jour: string;
}

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const getStatusColor = (statut: string) => {
  switch (statut) {
    case 'valide':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'en_attente_validation':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse';
    case 'A modifier':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'rejete':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getStatusLabel = (statut: string) => {
  switch (statut) {
    case 'en_attente_validation':
      return 'À valider';
    case 'A modifier':
      return 'À modifier';
    default:
      return statut;
  }
};

export default function EncadreurDashboard() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [chargement, setChargement] = useState(true);
  const [remarques, setRemarques] = useState<{ [key: string]: string }>({});
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [selectedProjetId, setSelectedProjetId] = useState<string | null>(null);
  const [showMemoirEditor, setShowMemoirEditor] = useState(false);

  const fetchProjets = async () => {
    try {
      const res = await fetch('/api/encadreur/projets');
      if (res.ok) {
        const data = await res.json();
        setProjets(data);
        if (data.length > 0 && !selectedProjetId) {
          setSelectedProjetId(data[0].id);
        }
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

  const handleDecision = async (projetId: string, action: 'APPROUVER' | 'REJETER' | 'CORRIGER') => {
    setActionEnCours(projetId);
    try {
      const res = await fetch('/api/encadreur/projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetId,
          action,
          remarque: remarques[projetId] !== undefined ? remarques[projetId] : (projets.find(p => p.id === projetId)?.remarque_encadreur || ''),
        }),
      });

      if (res.ok) {
        fetchProjets();
      } else {
        alert('Une erreur est survenue lors de la soumission.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionEnCours(null);
    }
  };

  const selectedProjet = projets.find(p => p.id === selectedProjetId);

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Espace Encadrement</h1>
          <p className="text-gray-600 text-sm mt-1">Relisez, annotez et validez les mémoires de vos étudiants</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Vue: Mémoire avec corrections */}
        {showMemoirEditor && selectedProjet ? (
          <div className="space-y-6">
            {/* Back Button + Info */}
            <div className="bg-white border border-gray-200 p-6">
              <button
                onClick={() => setShowMemoirEditor(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Retour à la liste
              </button>
              
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProjet.titre}</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Étudiant : <span className="font-semibold">{selectedProjet.etudiant_prenom} {selectedProjet.etudiant_nom}</span>
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold whitespace-nowrap border rounded ${getStatusColor(selectedProjet.statut)}`}>
                  {getStatusLabel(selectedProjet.statut)}
                </span>
              </div>
            </div>

            {/* Memoir Editor */}
            <div className="bg-white border border-gray-200 p-6">
              <MemoirEditorPro 
                memoireId={selectedProjet.id}
                canEdit={false}
              />
            </div>

            {/* Actions */}
            {selectedProjet.statut === 'en_attente_validation' && (
              <div className="bg-white border border-gray-200 p-6">
                <div className="space-y-4 mb-6">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Remarques générales
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Laissez vos remarques générales (visibles par l'étudiant)..."
                    defaultValue={selectedProjet.remarque_encadreur || ''}
                    onChange={(e) => setRemarques({ ...remarques, [selectedProjet.id]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-blue-600 resize-none text-sm bg-white text-gray-900"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    disabled={actionEnCours === selectedProjet.id}
                    onClick={() => handleDecision(selectedProjet.id, 'CORRIGER')}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Demander des modifications
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      disabled={actionEnCours === selectedProjet.id}
                      onClick={() => handleDecision(selectedProjet.id, 'REJETER')}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                    <button
                      disabled={actionEnCours === selectedProjet.id}
                      onClick={() => handleDecision(selectedProjet.id, 'APPROUVER')}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Valider le projet
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Vue: Liste des projets */
          <div>
            {projets.length === 0 ? (
              <div className="bg-white border border-gray-200 p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">Aucun projet ne vous a été attribué</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projets.map((projet) => (
                  <div key={projet.id} className="bg-white border border-gray-200 hover:border-gray-300 transition">
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{projet.titre}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold border rounded ${getStatusColor(projet.statut)}`}>
                              {getStatusLabel(projet.statut)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">{projet.etudiant_prenom} {projet.etudiant_nom}</span>
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-700">{projet.description}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Mis à jour : {new Date(projet.derniere_mise_a_jour).toLocaleDateString('fr-FR')}</span>
                      </div>

                      {/* PDF Link */}
                      {projet.url_livrable && isValidUrl(projet.url_livrable) ? (
                        <a 
                          href={projet.url_livrable} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          Ouvrir le document PDF soumis
                        </a>
                      ) : projet.url_livrable ? (
                        <p className="text-xs text-red-600 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          URL du document invalide
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Aucun document PDF déposé
                        </p>
                      )}

                      {/* Remarques */}
                      {projet.remarque_encadreur && (
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Remarques actuelles :</p>
                          <p className="text-xs text-gray-600">{projet.remarque_encadreur}</p>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          setSelectedProjetId(projet.id);
                          setShowMemoirEditor(true);
                        }}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Consulter et annoter le mémoire
                      </button>

                      {/* Decision Block (if needed) */}
                      {projet.statut === 'en_attente_validation' && (
                        <div className="pt-4 border-t border-gray-200">
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                            Remarques / Corrections
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Laissez vos remarques ici..."
                            defaultValue={projet.remarque_encadreur || ''}
                            onChange={(e) => setRemarques({ ...remarques, [projet.id]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-blue-600 resize-none text-xs bg-white text-gray-900 mb-3"
                          />

                          <div className="flex gap-2">
                            <button
                              disabled={actionEnCours === projet.id}
                              onClick={() => handleDecision(projet.id, 'CORRIGER')}
                              className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <AlertCircle className="w-4 h-4" />
                              Modifier
                            </button>
                            <button
                              disabled={actionEnCours === projet.id}
                              onClick={() => handleDecision(projet.id, 'REJETER')}
                              className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Rejeter
                            </button>
                            <button
                              disabled={actionEnCours === projet.id}
                              onClick={() => handleDecision(projet.id, 'APPROUVER')}
                              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Valider
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}