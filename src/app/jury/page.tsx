'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalChangementMotDePasse from '@/components/ModalChangementMotDePasse';

interface Soutenance {
  soutenance_id: number;
  date_soutenance: string;
  heure_debut: string;
  salle: string;
  theme_memoire: string;
  etudiant_nom: string;
  etudiant_prenom: string;
  projet_id?: string;
  url_livrable?: string | null;
}

interface ProjetAttribue {
  id: string;
  titre: string;
  description: string;
  statut: string;
  remarque_encadreur: string | null;
  url_livrable: string | null;
  etudiant_nom: string;
  etudiant_prenom: string;
  derniere_mise_a_jour: string;
}

export default function JuryDashboard() {
  const router = useRouter();
  const [data, setData] = useState<{ jury: any; soutenances: Soutenance[]; projetsAttribues: ProjetAttribue[] } | null>(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [soutenanceSelectionnee, setSoutenanceSelectionnee] = useState<Soutenance | null>(null);
  const [projetSelectionne, setProjetSelectionne] = useState<ProjetAttribue | null>(null);
  const [noteEcrit, setNoteEcrit] = useState('');
  const [noteOral, setNoteOral] = useState('');
  const [commentaires, setCommentaires] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [actionType, setActionType] = useState<'notation' | 'correction'>('notation');

  const fetchJuryData = async () => {
    try {
      const res = await fetch('/api/jury/dashboard');
      const info = await res.json();
      if (!res.ok) throw new Error(info.error || 'Impossible de charger vos données.');
      setData(info);
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchJuryData();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      } else {
        alert('Erreur lors de la déconnexion.');
      }
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  };

  const handleSoumettreNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soutenanceSelectionnee) return;

    setEnvoiEnCours(true);
    try {
      const res = await fetch('/api/jury/evaluer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soutenanceId: soutenanceSelectionnee.soutenance_id,
          noteEcrit,
          noteOral,
          commentaires,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Erreur lors de l\'enregistrement.');

      alert(`Évaluation validée ! Note : ${resData.noteFinale || resData.noteGenerale}/20`);
      fermerModal();
      fetchJuryData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleDemanderModifications = async (targetProjetId: string) => {
    if (!commentaires.trim()) {
      alert('Veuillez spécifier des remarques.');
      return;
    }

    setEnvoiEnCours(true);
    try {
      const res = await fetch('/api/jury/remarque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetId: targetProjetId,
          remarque: commentaires,
          action: 'CORRIGER'
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Erreur.');

      alert('Notification de modification transmise à l\'étudiant !');
      fermerModal();
      fetchJuryData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const fermerModal = () => {
    setSoutenanceSelectionnee(null);
    setProjetSelectionne(null);
    setNoteEcrit('');
    setNoteOral('');
    setCommentaires('');
    setActionType('notation');
  };

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full animate-pulse mb-3">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600 text-sm font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-red-50 text-red-800 p-6 rounded-lg border border-red-200 max-w-md text-center">
          ⚠️ {erreur}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Espace Encadrant & Jury
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Bienvenue, Pr. {data?.jury.prenom} {data?.jury.nom}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                👨‍⚖️ Jury & Encadreur
              </span>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition"
              >
                ⚙️ Mot de passe
              </button>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-2 rounded-lg font-medium transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12 space-y-8">
        {/* Projets en Encadrement */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Vos Projets en Encadrement</h2>
            <p className="text-sm text-gray-600 mt-1">Suivez et annotez les mémoires qui vous sont attribués</p>
          </div>

          {!data?.projetsAttribues || data.projetsAttribues.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-gray-600 text-sm">Aucun projet de mémoire ne vous est actuellement assigné</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projetsAttribues.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{p.titre}</h3>
                      <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${
                        p.statut === 'valide' ? 'bg-green-100 text-green-800' : p.statut === 'A modifier' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.statut}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Étudiant : <span className="font-medium text-gray-900">{p.etudiant_prenom} {p.etudiant_nom}</span></p>
                    <p className="text-xs text-gray-600 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-2 mt-3">
                    {p.url_livrable ? (
                      <a href={p.url_livrable} target="_blank" rel="noreferrer" className="text-2xs text-blue-600 hover:underline font-medium">
                        📄 Voir PDF
                      </a>
                    ) : (
                      <span className="text-2xs text-gray-400 italic">Pas de livrable</span>
                    )}

                    <button
                      onClick={() => {
                        setProjetSelectionne(p);
                        setCommentaires(p.remarque_encadreur || '');
                      }}
                      className="bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 px-2.5 py-1 rounded text-2xs font-medium transition"
                    >
                      ✏️ Annoter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Soutenances Planifiées */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Vos Sessions de Soutenance Planifiées</h2>
            <p className="text-sm text-gray-600 mt-1">Soutenances programmées par l'administration</p>
          </div>

          {data?.soutenances.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-gray-600 text-sm">Aucune soutenance planifiée pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-gray-700 text-xs uppercase font-semibold">
                    <th className="px-6 py-4 text-left">Date & Heure</th>
                    <th className="px-6 py-4 text-left">Étudiant</th>
                    <th className="px-6 py-4 text-left">Thème</th>
                    <th className="px-6 py-4 text-left">Salle</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.soutenances.map((s) => (
                    <tr key={s.soutenance_id} className="hover:bg-gray-50 transition text-gray-800">
                      <td className="px-6 py-4 font-medium">
                        {s.date_soutenance ? new Date(s.date_soutenance).toLocaleDateString('fr-FR') : 'N/A'}
                        {s.heure_debut ? ` à ${s.heure_debut.slice(0, 5)}` : ''}
                      </td>
                      <td className="px-6 py-4">{s.etudiant_prenom} {s.etudiant_nom}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-700">{s.theme_memoire}</td>
                      <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{s.salle}</span></td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSoutenanceSelectionnee(s)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
                        >
                          🎯 Évaluer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Projet */}
      {projetSelectionne && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Annotations & Corrections</h3>
              <button onClick={fermerModal} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">Thème : <span className="text-gray-900 font-bold">{projetSelectionne.titre}</span></p>
              <label className="block text-xs font-bold text-amber-900 mb-2 uppercase">Observations & Corrections</label>
              <textarea
                rows={5}
                value={commentaires}
                onChange={(e) => setCommentaires(e.target.value)}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-xs text-gray-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="Ex: Revoir l'introduction..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={fermerModal} className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={() => handleDemanderModifications(projetSelectionne.id)}
                disabled={envoiEnCours || !commentaires.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-xs font-medium"
              >
                {envoiEnCours ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Soutenance */}
      {soutenanceSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Évaluation Jury</h3>
              <button onClick={fermerModal} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="text-xs bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-1 text-gray-700">
              <p>Candidat : <strong className="text-gray-900">{soutenanceSelectionnee.etudiant_prenom} {soutenanceSelectionnee.etudiant_nom}</strong></p>
              <p>Thème : <span className="italic">{soutenanceSelectionnee.theme_memoire}</span></p>
            </div>

            <div className="flex border-b text-xs font-medium">
              <button
                className={`flex-1 py-2 text-center border-b-2 ${actionType === 'notation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
                onClick={() => setActionType('notation')}
              >
                📊 Notes
              </button>
              <button
                className={`flex-1 py-2 text-center border-b-2 ${actionType === 'correction' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-600'}`}
                onClick={() => setActionType('correction')}
              >
                ✏️ Corrections
              </button>
            </div>

            {actionType === 'notation' ? (
              <form onSubmit={handleSoumettreNote} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Note Écrit (/20)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="20"
                      required
                      value={noteEcrit}
                      onChange={(e) => setNoteEcrit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="14.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Note Oral (/20)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="20"
                      required
                      value={noteOral}
                      onChange={(e) => setNoteOral(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="16"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Observations</label>
                  <textarea
                    rows={3}
                    value={commentaires}
                    onChange={(e) => setCommentaires(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Très bonne présentation..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={fermerModal} className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Annuler
                  </button>
                  <button type="submit" disabled={envoiEnCours} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-medium">
                    Valider
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-2 uppercase">Modifications requises</label>
                  <textarea
                    rows={4}
                    value={commentaires}
                    onChange={(e) => setCommentaires(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-xs text-gray-900 bg-amber-50 focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Corriger la conclusion..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={fermerModal} className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemanderModifications(soutenanceSelectionnee.projet_id || '')}
                    disabled={envoiEnCours || !commentaires.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-xs font-medium"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ModalChangementMotDePasse isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
}