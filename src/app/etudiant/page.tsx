'use client';

import { useEffect, useState, useRef } from 'react';
import ModalChangementMotDePasse from '@/components/ModalChangementMotDePasse';
import MemoirEditorPro from '@/components/memoir/MemoirEditorPro';
import { 
  BookOpen,
  LogOut,
  Lock,
  AlertCircle,
  Calendar,
  MapPin,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Settings,
  Loader
} from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de votre espace personnel...</p>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg max-w-md flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          <p>{erreur}</p>
        </div>
      </div>
    );
  }

  const { projet, soutenance } = data || { projet: null, soutenance: null };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Espace Étudiant</h1>
              <p className="text-gray-600 text-sm mt-1">Écrivez votre mémoire et préparez votre soutenance</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Mot de passe</span>
              </button>
              <button
                onClick={async () => {
                  document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
                  window.location.href = '/login';
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sujet de Mémoire */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Sujet de Mémoire
                </h2>
                {projet && (
                  <span className={`px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                    projet.statut === 'valide' || projet.statut === 'Validé' || projet.statut === 'soumis'
                      ? 'bg-green-100 text-green-800'
                      : projet.statut === 'En cours'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {projet.statut === 'valide' ? 'Validé' : projet.statut}
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
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        Remarques de l'encadreur
                      </h4>
                      <p className="text-sm text-amber-900">{projet.remarque_encadreur}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 pt-4 border-t border-gray-200 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Dernière mise à jour : {new Date(projet.derniere_mise_a_jour).toLocaleDateString('fr-FR')} à {new Date(projet.derniere_mise_a_jour).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun projet de mémoire ne vous a été attribué.</p>
              )}
            </div>

            {/* Éditeur de Mémoire */}
            {projet && (
              <div className="bg-white border border-gray-200 p-6">
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Éditeur de Mémoire
                  </h2>
                  <p className="text-xs text-gray-600 mt-2">Écrivez votre mémoire directement. Auto-sauvegarde toutes les 30 secondes.</p>
                </div>
                <MemoirEditorPro memoireId={projet.id} />
              </div>
            )}

            {/* Dépôt du PDF */}
            {projet && (
              <div className="bg-white border border-gray-200 p-6">
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Upload className="w-6 h-6 text-blue-600" />
                    Dépôt du Livrable Final
                  </h2>
                  <p className="text-xs text-gray-600 mt-2">Téléversez votre rapport au format PDF</p>
                </div>

                {statutSoumission === 'soumis' ? (
                  <div className="p-4 bg-green-50 border border-green-200 text-green-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <p className="text-sm font-semibold">Rapport PDF enregistré avec succès</p>
                    </div>
                    {typeof urlLivrable === 'string' && (
                      <a href={urlLivrable} target="_blank" rel="noreferrer" className="text-sm underline text-green-700 hover:text-green-900 block break-all">
                        Voir mon PDF soumis
                      </a>
                    )}
                    <button
                      onClick={() => setStatutSoumission('en_attente')}
                      className="text-xs text-green-700 underline hover:text-green-900 font-medium"
                    >
                      Remplacer le fichier
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSoumission} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Fichier PDF
                      </label>
                      <input
                        type="file"
                        required
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setUrlLivrable(e.target.files[0]);
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                      />
                    </div>

                    {messageSoumission && (
                      <p className={`text-xs font-medium ${messageSoumission.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
                        {messageSoumission}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={envoiEnCours}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold transition flex items-center justify-center gap-2"
                    >
                      {envoiEnCours ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Téléversement...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Soumettre mon mémoire
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Soutenance */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-blue-600" />
                Ma Soutenance
              </h2>

              {!projet ? (
                <p className="text-sm text-gray-500">En attente d'attribution d'un sujet.</p>
              ) : soutenance ? (
                <div className="space-y-4">
                  {/* Date */}
                  <div className="bg-blue-50 border border-blue-200 p-4">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Date de passage</p>
                    <p className="text-lg font-bold text-blue-900">
                      {new Date(soutenance.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-blue-900 mt-2 font-medium">
                      {new Date(soutenance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(soutenance.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Salle */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Salle
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 bg-gray-900 text-white font-medium text-xs">
                        {soutenance.salle_nom}
                      </span>
                      {soutenance.est_virtuelle && (
                        <span className="text-xs text-blue-600 font-medium">(Visio)</span>
                      )}
                    </div>
                  </div>

                  {/* Convocation */}
                  {convocation && (
                    <button
                      onClick={telechargerPDF}
                      disabled={generateurPdfEnCours}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                    >
                      {generateurPdfEnCours ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Télécharger la convocation
                        </>
                      )}
                    </button>
                  )}

                  {/* Note Finale */}
                  {soutenance.note_finale !== null && (
                    <div className="pt-4 border-t border-gray-200 text-center">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Note Finale</p>
                      <p className="text-4xl font-extrabold text-green-600">{soutenance.note_finale} <span className="text-lg">/20</span></p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 space-y-3 bg-gray-50 p-4">
                  <p>Votre sujet est en cours d'évaluation.</p>
                  <div className="flex items-start gap-2 text-xs">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>L'administration programmera votre créneau horaire de passage.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Convocation Hidden */}
      {convocation && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <div ref={convocationRef} style={{ width: '210mm', minHeight: '297mm', fontFamily: 'serif', padding: '20mm', backgroundColor: '#ffffff', color: '#000000', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
              <div style={{ textAlign: 'left' }}>
                Ministère de l'Enseignement Supérieur<br />
                Direction des Examens et Concours<br />
                Institut Supérieur de Technologie
              </div>
              <div style={{ textAlign: 'right' }}>
                Année Académique<br />
                2025-2026
              </div>
            </div>

            <div style={{ textAlign: 'center', fontWeight: '900', fontSize: '18px', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'underline', padding: '24px 0' }}>
              CONVOCATION OFFICIELLE À LA SOUTENANCE DE MÉMOIRE
            </div>

            <div style={{ marginBottom: '16px', lineHeight: '1.8' }}>
              <p>L'administration académique convoque officiellement l'étudiant(e) :</p>
              <p style={{ fontWeight: 'bold', textTransform: 'uppercase', marginTop: '8px' }}>{convocation.etudiant_nom} {convocation.etudiant_prenom}</p>
              <p style={{ marginTop: '16px' }}>pour la validation de ses travaux de fin d'études.</p>
              <p style={{ marginTop: '16px' }}><strong>Thème de recherche :</strong> {convocation.memoire_titre}</p>
            </div>

            <div style={{ border: '2px solid #000', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>DÉTAILS DE L'ÉVALUATION</div>
              <div><strong>Date :</strong> {new Date(convocation.date_soutenance).toLocaleDateString('fr-FR')}</div>
              <div><strong>Horaires :</strong> {convocation.heure_debut} - {convocation.heure_fin}</div>
              <div><strong>Salle :</strong> {convocation.salle_nom}</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>COMPOSITION DU JURY</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Nom & Prénoms</th>
                    <th style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {convocation.membres_jury?.map((jury, idx) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>{jury.prenom} {jury.nom}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', fontStyle: 'italic' }}>{jury.role || 'Membre'}</td>
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