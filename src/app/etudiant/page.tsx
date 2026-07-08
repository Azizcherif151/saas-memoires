'use client';

import { useEffect, useState, useRef } from 'react';
import ModalChangementMotDePasse from '@/components/ModalChangementMotDePasse';
import { 
  ProjectIcon, 
  LogoutIcon, 
  SettingsIcon, 
  AvertissIcon, 
  CalendarIcon, 
  LocalisIcon,
  UploadIcon,
  PdfIcon 
} from '@/components/icons';

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

interface JuryMembre {
  nom: string;
  prenom: string;
  role: string;
}

interface ConvocationData {
  soutenance_id: string;
  date_soutenance: string;
  heure_debut: string;
  heure_fin: string;
  salle_nom: string;
  memoire_titre: string;
  etudiant_nom: string;
  etudiant_prenom: string;
  membres_jury: JuryMembre[];
}

export default function EtudiantDashboard() {
  const [data, setData] = useState<{ projet: Projet | null; soutenance: Soutenance | null } | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [urlLivrable, setUrlLivrable] = useState<string | File>('');
  const [statutSoumission, setStatutSoumission] = useState('en_attente');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [messageSoumission, setMessageSoumission] = useState('');

  const [convocation, setConvocation] = useState<ConvocationData | null>(null);
  const [generateurPdfEnCours, setGenerateurPdfEnCours] = useState(false);
  const convocationRef = useRef<HTMLDivElement>(null);

  const fetchEtudiantData = async () => {
    try {
      const res = await fetch('/api/etudiants/dashboard');
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expirée ou non autorisée.');
        throw new Error('Impossible de charger vos données.');
      }
      const tokenData = await res.json();
      setData(tokenData);

      if (tokenData.projet?.url_livrable) {
        setUrlLivrable(tokenData.projet.url_livrable);
        setStatutSoumission('soumis');
      }

      if (tokenData.soutenance) {
        const resConv = await fetch('/api/etudiants/convocation');
        if (resConv.ok) {
          const convData = await resConv.json();
          setConvocation(convData);
        }
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
      fetchEtudiantData();
    } catch (err: any) {
      setMessageSoumission(`Erreur : ${err.message}`);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const telechargerPDF = async () => {
    if (!convocationRef.current) return;
    setGenerateurPdfEnCours(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = convocationRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Convocation_${convocation?.etudiant_nom || 'Soutenance'}.pdf`);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
    } finally {
      setGenerateurPdfEnCours(false);
    }
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
          <p className="text-gray-600 text-sm font-medium">Chargement de votre espace personnel...</p>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-red-50 text-red-800 p-6 rounded-lg text-sm border border-red-200 max-w-md text-center flex items-center gap-2 justify-center">
          <AvertissIcon /> {erreur}
        </div>
      </div>
    );
  }

  const { projet, soutenance } = data || { projet: null, soutenance: null };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Mon Espace Étudiant
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Suivez l'état d'avancement de votre mémoire et votre planification
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5"
              >
                <SettingsIcon /> Mot de passe
              </button>
              <button
                onClick={async () => {
  document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
  window.location.href = '/login';
}}
                className="text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5"
              >
                <LogoutIcon /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gauche : Mémoire et Dépôt */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sujet de mémoire */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ProjectIcon /> Sujet de Mémoire Enregistré
                </h2>
                {projet && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    projet.statut === 'valide' || projet.statut === 'Validé' || projet.statut === 'soumis'
                      ? 'bg-green-100 text-green-800'
                      : projet.statut === 'En cours'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {projet.statut === 'valide' ? '✓ Validé' : projet.statut}
                  </span>
                )}
              </div>

              {projet ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{projet.titre}</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{projet.description || 'Aucune description fournie.'}</p>
                  </div>

                  {projet.remarque_encadreur && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <AvertissIcon /> Note de l'encadreur
                      </h4>
                      <p className="text-sm text-amber-900 mt-2">{projet.remarque_encadreur}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 pt-4 border-t border-gray-200">
                    Dernière mise à jour : {new Date(projet.derniere_mise_a_jour).toLocaleDateString('fr-FR')} à {new Date(projet.derniere_mise_a_jour).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-4">Aucun projet de mémoire ne vous a encore été attribué par l'administration.</p>
              )}
            </div>

            {/* Dépôt du document */}
            {projet && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Dépôt du Livrable Final</h2>
                  <p className="text-xs text-gray-600 mt-1">Téléversez votre rapport de mémoire au format PDF pour le jury</p>
                </div>

                {statutSoumission === 'soumis' ? (
                  <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg space-y-3">
                    <p className="text-sm font-semibold">✓ Rapport PDF enregistré avec succès !</p>
                    <p className="text-xs">
                      Fichier disponible : <a href={typeof urlLivrable === 'string' ? urlLivrable : '#'} target="_blank" rel="noreferrer" className="underline font-mono text-green-700 hover:text-green-900 break-all">Voir mon PDF soumis</a>
                    </p>
                    <button
                      onClick={() => setStatutSoumission('en_attente')}
                      className="text-xs text-green-700 underline hover:text-green-900 font-medium block"
                    >
                      ↻ Remplacer le fichier PDF
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSoumission} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Fichier du mémoire (PDF)</label>
                      <input
                        type="file"
                        required
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setUrlLivrable(e.target.files[0]);
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100 transition"
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
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-lg text-xs font-semibold transition transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
                      >
                        {envoiEnCours ? 'Téléversement...' : <><UploadIcon /> Soumettre mon mémoire</>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Droite : Soutenance */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ma Soutenance</h2>

              {!projet ? (
                <p className="text-sm text-gray-500">En attente de l'attribution d'un sujet.</p>
              ) : soutenance ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarIcon /> Date de passage
                    </div>
                    <div className="text-lg font-bold text-blue-900 mt-2">
                      {new Date(soutenance.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-blue-900 mt-2 font-medium">
                      {new Date(soutenance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(soutenance.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <LocalisIcon /> Salle
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 bg-slate-800 text-white rounded-lg font-medium text-xs">
                        {soutenance.salle_nom}
                      </span>
                      {soutenance.est_virtuelle && (
                        <span className="text-xs text-blue-600 font-medium">(Visio)</span>
                      )}
                    </div>
                  </div>

                  {convocation && (
                    <button
                      onClick={telechargerPDF}
                      disabled={generateurPdfEnCours}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-300 disabled:to-emerald-400 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center"
                    >
                      {generateurPdfEnCours ? '⏳ Génération...' : <><PdfIcon /> Télécharger la convocation</>}
                    </button>
                  )}

                  {soutenance.note_finale !== null && (
                    <div className="pt-4 border-t border-gray-200 text-center">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">🎓 Note Finale</span>
                      <div className="text-4xl font-extrabold text-green-600">{soutenance.note_finale} <span className="text-lg">/20</span></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 space-y-3">
                  <p>Votre sujet est en cours d'évaluation.</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-xs flex items-start gap-2 border border-gray-100">
                    <CalendarIcon />
                    <span className="text-gray-600">L'administration n'a pas encore programmé votre créneau horaire de passage.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Convocation off-screen */}
      {convocation && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <div ref={convocationRef} style={{ width: '210mm', minHeight: '297mm', fontFamily: 'serif', padding: '20mm', backgroundColor: '#ffffff', color: '#000000', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', justifyContent: 'between', borderBottom: '1px solid #000000', paddingBottom: '16px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
              <div style={{ textAlign: 'left' }}>
                Ministère de l'Enseignement Supérieur<br />
                Direction des Examens et Concours<br />
                Institut Supérieur de Technologie
              </div>
              <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                Année Académique<br />
                2025-2026
              </div>
            </div>

            <div style={{ textAlign: 'center', fontWeight: '900', fontSize: '20px', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'underline', padding: '24px 0' }}>
              CONVOCATION OFFICIELLE À LA SOUTENANCE DE MÉMOIRE
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p>
                L'administration académique convoque officiellement l'étudiant(e) : <strong style={{ textTransform: 'uppercase' }}>{convocation.etudiant_nom}</strong> {convocation.etudiant_prenom} à se présenter devant le jury pour la validation de ses travaux de fin d'études.
              </p>
              <p style={{ marginBottom: '24px' }}>
                <strong>Thème de recherche :</strong> <span style={{ fontStyle: 'italic' }}>« {convocation.memoire_titre} »</span>
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '20px', backgroundColor: '#f9fafb', marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px' }}>Détails de l'évaluation</div>
              <div><strong>Date :</strong> {new Date(convocation.date_soutenance).toLocaleDateString('fr-FR')}</div>
              <div><strong>Horaires :</strong> {convocation.heure_debut} - {convocation.heure_fin}</div>
              <div><strong>Salle :</strong> {convocation.salle_nom}</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '8px', marginBottom: '12px' }}>Composition du Jury</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>Nom & Prénoms</th>
                    <th style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {convocation.membres_jury?.map((jury, idx) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #000000', padding: '8px' }}>{jury.prenom} {jury.nom}</td>
                      <td style={{ border: '1px solid #000000', padding: '8px', fontStyle: 'italic' }}>{jury.role || 'Membre'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ModalChangementMotDePasse isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
}