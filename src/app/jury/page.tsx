'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Importation du composant en haut du fichier
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

  // État pour contrôler l'affichage de la Modal de changement de mot de passe
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // États pour la modal
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
      console.error('Erreur réseau déconnexion:', err);
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
      if (!res.ok) throw new Error(resData.error || 'Erreur lors de l’enregistrement.');

      alert(`Évaluation validée ! Note générale : ${resData.noteFinale || resData.noteGenerale}/20`);
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
      alert('Veuillez spécifier des remarques dans le champ observations.');
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
      if (!res.ok) throw new Error(resData.error || 'Erreur lors de l’envoi des modifications.');

      alert('Notification de modification transmise avec succès à l’étudiant !');
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

  if (chargement) return <div className="p-8 text-center text-black">Chargement de votre espace...</div>;
  if (erreur) return <div className="p-8 text-center text-red-600">{erreur}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Espace Encadrant & Jury</h1>
            <p className="text-sm text-gray-500">Bienvenue, Pr. {data?.jury.prenom} {data?.jury.nom}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
              Enseignant / Jury
            </span>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition"
            >
              ⚙️ Mot de passe
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* SECTION NOUVELLE : Liste des Mémoires Attribués (Suivi Étape par Étape) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Vos Projets en Encadrement</h2>
            <p className="text-sm text-gray-500">Suivez et annotez les mémoires qui vous sont attribués avant ou après planification de la soutenance.</p>
          </div>

          {!data?.projetsAttribues || data.projetsAttribues.length === 0 ? (
            <p className="p-6 text-gray-500 text-center text-sm">Aucun projet de mémoire ne vous est actuellement assigné comme encadrant principal.</p>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projetsAttribues.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.titre}</h3>
                      <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wide ${
                        p.statut === 'valide' ? 'bg-green-100 text-green-800' : p.statut === 'A modifier' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.statut}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Étudiant : <span className="font-medium text-gray-700">{p.etudiant_prenom} {p.etudiant_nom}</span></p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between gap-2">
                    {p.url_livrable ? (
                      <a href={p.url_livrable} target="_blank" rel="noreferrer" className="text-2xs text-indigo-600 hover:underline font-bold">
                        📄 Voir le livrable PDF
                      </a>
                    ) : (
                      <span className="text-2xs text-gray-400 italic">Pas de livrable</span>
                    )}

                    <button
                      onClick={() => {
                        setProjetSelectionne(p);
                        setCommentaires(p.remarque_encadreur || '');
                      }}
                      className="bg-white border hover:bg-amber-50 text-amber-700 border-amber-200 px-2.5 py-1 rounded text-2xs font-medium transition"
                    >
                      📝 Annoter & Corriger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liste des soutenances plannifiées */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Vos Sessions de Soutenance Planifiées</h2>
            <p className="text-sm text-gray-500">Soutenances officielles programmées par l'administration.</p>
          </div>

          {data?.soutenances.length === 0 ? (
            <p className="p-6 text-gray-500 text-center text-sm">Aucune soutenance planifiée pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-100">
                    <th className="p-4">Date & Heure</th>
                    <th className="p-4">Étudiant</th>
                    <th className="p-4">Thème du mémoire</th>
                    <th className="p-4">Salle</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {data?.soutenances.map((s) => (
                    <tr key={s.soutenance_id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">
                        {s.date_soutenance ? new Date(s.date_soutenance).toLocaleDateString('fr-FR') : 'Date non définie'} 
                        {s.heure_debut ? ` à ${s.heure_debut.slice(0, 5)}` : ' (Heure non définie)'}
                      </td>
                      <td className="p-4 text-gray-700">{s.etudiant_prenom} {s.etudiant_nom}</td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{s.theme_memoire}</td>
                      <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{s.salle}</span></td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setSoutenanceSelectionnee(s)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition"
                        >
                          Évaluer / Jury
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour PROJET EN ENCADREMENT BRUT */}
      {projetSelectionne && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900">Modifications & Corrections de l'Encadrant</h3>
              <button onClick={fermerModal} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Thème : <span className="text-gray-800 font-bold">{projetSelectionne.titre}</span></p>
              <label className="block text-xs font-semibold text-amber-800 mt-4 mb-1">Observations et exigences de correction :</label>
              <textarea 
                rows={5} value={commentaires} onChange={(e) => setCommentaires(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-amber-200 rounded-md text-xs text-black focus:ring-amber-500 focus:border-amber-500 bg-amber-50/20 font-sans"
                placeholder="Ex: Revoir l'introduction, ajouter la partie architecture technique..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={fermerModal} className="px-4 py-2 border rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button 
                type="button" 
                onClick={() => handleDemanderModifications(projetSelectionne.id)}
                disabled={envoiEnCours || !commentaires.trim()} 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-medium disabled:bg-gray-300"
              >
                {envoiEnCours ? 'Transmission...' : 'Envoyer à l’étudiant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'évaluation pour SOUTENANCE OFFICIELLE */}
      {soutenanceSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-gray-900">Évaluation Jury</h3>
              <button onClick={fermerModal} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <div className="text-xs bg-gray-50 p-3 rounded-lg border text-gray-600 space-y-1">
              <p>Candidat : <strong className="text-gray-700">{soutenanceSelectionnee.etudiant_prenom} {soutenanceSelectionnee.etudiant_nom}</strong></p>
              <p>Thème : <span className="italic">{soutenanceSelectionnee.theme_memoire}</span></p>
            </div>

            <div className="flex border-b text-xs font-medium">
              <button 
                type="button"
                className={`flex-1 py-2 text-center border-b-2 ${actionType === 'notation' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-gray-500'}`}
                onClick={() => setActionType('notation')}
              >
                Attribuer les notes
              </button>
              <button 
                type="button"
                className={`flex-1 py-2 text-center border-b-2 ${actionType === 'correction' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-gray-500'}`}
                onClick={() => setActionType('correction')}
              >
                Demander des corrections
              </button>
            </div>

            {actionType === 'notation' ? (
              <form onSubmit={handleSoumettreNote} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Note Écrit (/20)</label>
                    <input 
                      type="number" step="0.25" min="0" max="20" required value={noteEcrit}
                      onChange={(e) => setNoteEcrit(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border rounded-md text-sm text-black"
                      placeholder="14.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Note Oral (/20)</label>
                    <input 
                      type="number" step="0.25" min="0" max="20" required value={noteOral}
                      onChange={(e) => setNoteOral(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border rounded-md text-sm text-black"
                      placeholder="16"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Observations / Procès-verbal</label>
                  <textarea 
                    rows={3} value={commentaires} onChange={(e) => setCommentaires(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md text-sm text-black"
                    placeholder="Très bonne présentation..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={fermerModal} className="px-4 py-2 border rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                  <button type="submit" disabled={envoiEnCours} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-xs font-medium">Valider la note</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-800">Modifications requises après soutenance</label>
                  <textarea 
                    rows={4} value={commentaires} onChange={(e) => setCommentaires(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-amber-200 rounded-md text-xs text-black bg-amber-50/10 font-sans"
                    placeholder="Ex: Corriger la conclusion..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={fermerModal} className="px-4 py-2 border rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                  <button 
                    type="button" 
                    onClick={() => handleDemanderModifications(soutenanceSelectionnee.projet_id || '')}
                    disabled={envoiEnCours || !commentaires.trim()} 
                    className="px-4 py-2 bg-amber-500 text-white rounded-md text-xs font-medium"
                  >
                    Envoyer les corrections
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instance globale de la Modal de modification du mot de passe */}
      <ModalChangementMotDePasse 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}