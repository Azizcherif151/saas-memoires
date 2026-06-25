'use client';

import { useEffect, useState } from 'react';

interface Projet {
  id: string;
  titre: string;
  description: string;
  statut: string;
  remarque_encadreur: string | null;
  derniere_mise_a_jour: string;
  url_livrable?: string | null;
}

interface Soutenance {
  date_debut: string;
  date_fin: string;
  note_finale: number | null;
  convocation_envoyee: boolean;
  salle_nom: string;
  est_virtuelle: boolean;
}

export default function EtudiantDashboard() {
  const [data, setData] = useState<{ projet: Projet | null; soutenance: Soutenance | null } | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  // États locaux pour le dépôt de document (accepte une chaîne ou un objet File de type local)
  const [urlLivrable, setUrlLivrable] = useState<string | File>('');
  const [statutSoumission, setStatutSoumission] = useState('en_attente'); // en_attente, soumis
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [messageSoumission, setMessageSoumission] = useState('');

  const fetchEtudiantData = async () => {
    try {
      const res = await fetch('/api/etudiants/dashboard');
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expirée ou non autorisée.');
        throw new Error('Impossible de charger vos données.');
      }
      const tokenData = await res.json();
      setData(tokenData);

      // Si un livrable a déjà été soumis, on pré-remplit l'interface
      if (tokenData.projet?.url_livrable) {
        setUrlLivrable(tokenData.projet.url_livrable);
        setStatutSoumission('soumis');
      }
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchEtudiantData();
  }, []);

  const handleSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoiEnCours(true);
    setMessageSoumission('');

    try {
      // Construction du FormData pour le transport du fichier binaire
      const formDataToSend = new FormData();
      formDataToSend.append('file', urlLivrable); 

      const res = await fetch('/api/etudiants/soumettre', {
        method: 'POST',
        body: formDataToSend,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Une erreur est survenue.');

      setStatutSoumission('soumis');
      setMessageSoumission('✓ Votre mémoire PDF a bien été enregistré et transmis au jury.');
      fetchEtudiantData(); // Rafraîchir les données globales
    } catch (err: any) {
      setMessageSoumission(`Erreur : ${err.message}`);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (chargement) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-black">
        <p className="text-sm font-medium animate-pulse text-gray-500">Chargement de votre espace personnel...</p>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-black">
        <div className="bg-red-50 text-red-800 p-4 rounded-md text-sm border border-red-100 max-w-md text-center">
          {erreur}
        </div>
      </div>
    );
  }

  const { projet, soutenance } = data || { projet: null, soutenance: null };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6 md:p-12">
      <header className="max-w-5xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mon Espace Étudiant</h1>
          <p className="text-sm text-gray-500 mt-1">Suivez l'état d'avancement de votre mémoire et votre planification.</p>
        </div>
        <button 
          onClick={async () => {
            document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = '/login';
          }}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-gray-700 transition"
        >
          Déconnexion
        </button>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section Gauche : Mémoire et Dépôt */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sujet de mémoire */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <h2 className="text-lg font-bold text-gray-800">Sujet de Mémoire Enregistré</h2>
              {projet && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  projet.statut === 'Validé' || projet.statut === 'soumis' ? 'bg-green-50 text-green-700 border border-green-200' :
                  projet.statut === 'En cours' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                  'bg-orange-50 text-orange-700 border border-orange-200'
                }`}>
                  {projet.statut}
                </span>
              )}
            </div>

            {projet ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{projet.titre}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">{projet.description || 'Aucune description fournie.'}</p>
                </div>
                
                {projet.remarque_encadreur && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mt-4">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Note / Remarque de l'encadreur :</h4>
                    <p className="text-sm text-amber-900 mt-1">{projet.remarque_encadreur}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  Dernière mise à jour : {new Date(projet.derniere_mise_a_jour).toLocaleDateString('fr-FR')} à {new Date(projet.derniere_mise_a_jour).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">Aucun projet de mémoire ne vous a encore été attribué par l'administration.</p>
            )}
          </div>

          {/* Dépôt du document final */}
          {projet && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="border-b pb-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800">Dépôt du Livrable Final</h2>
                <p className="text-xs text-gray-500 mt-0.5">Téléversez votre rapport de mémoire au format officiel PDF pour le jury.</p>
              </div>

              {statutSoumission === 'soumis' ? (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg space-y-2">
                  <p className="text-sm font-semibold">✓ Rapport PDF enregistré avec succès !</p>
                  <p className="text-xs">
                    Fichier disponible : <a href={typeof urlLivrable === 'string' ? urlLivrable : '#'} target="_blank" rel="noreferrer" className="underline font-mono text-indigo-600 hover:text-indigo-800 break-all">Voir mon PDF soumis</a>
                  </p>
                  <button 
                    onClick={() => setStatutSoumission('en_attente')} 
                    className="text-xs text-gray-500 underline hover:text-gray-700 mt-2 block font-medium"
                  >
                    Remplacer le fichier PDF
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSoumission} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Fichier du mémoire (Format PDF uniquement)</label>
                    <input 
                      type="file" 
                      required 
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUrlLivrable(e.target.files[0]); 
                        }
                      }}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100"
                    />
                  </div>

                  {messageSoumission && (
                    <p className={`text-xs font-medium ${messageSoumission.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
                      {messageSoumission}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={envoiEnCours}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition disabled:bg-indigo-400"
                    >
                      {envoiEnCours ? 'Téléversement du PDF...' : 'Soumettre mon mémoire'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Section Droite : Planification Soutenance */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ma Soutenance</h2>

            {!projet ? (
              <p className="text-sm text-gray-500">En attente de l'attribution d'un sujet.</p>
            ) : soutenance ? (
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-950">
                  <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Date de passage</div>
                  <div className="text-base font-bold mt-1">
                    {new Date(soutenance.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-sm mt-0.5 font-medium">
                    Horaires : {new Date(soutenance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(soutenance.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lieu / Salle</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 bg-slate-800 text-white rounded font-medium text-xs">
                      {soutenance.salle_nom}
                    </span>
                    {soutenance.est_virtuelle && (
                      <span className="text-xs text-indigo-600 font-medium">(Lien visio disponible le jour J)</span>
                    )}
                  </div>
                </div>

                {soutenance.note_finale !== null && (
                  <div className="pt-4 border-t border-gray-100 text-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Note Finale Obtenue</span>
                    <div className="text-4xl font-extrabold text-green-600 mt-1">{soutenance.note_finale} / 20</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-2 space-y-2">
                <p>Votre sujet est en cours d'évaluation ou d'encadrement.</p>
                <p className="bg-gray-50 p-3 rounded-md text-xs">📅 L'administration n'a pas encore programmé votre créneau horaire de passage.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}