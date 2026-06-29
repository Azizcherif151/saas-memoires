'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Soutenance {
  soutenance_id: number;
  date_soutenance: string;
  heure_debut: string;
  salle: string;
  theme_memoire: string;
  etudiant_nom: string;
  etudiant_prenom: string;
}

export default function JuryDashboard() {
  const router = useRouter();
  const [data, setData] = useState<{ jury: any; soutenances: Soutenance[] } | null>(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  // États pour la modal de notation
  const [soutenanceSelectionnee, setSoutenanceSelectionnee] = useState<Soutenance | null>(null);
  const [noteEcrit, setNoteEcrit] = useState('');
  const [noteOral, setNoteOral] = useState('');
  const [commentaires, setCommentaires] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const fetchJuryData = async () => {
    try {
      const res = await fetch('/api/jury/dashboard');
      const info = await res.json();
      if (!res.ok) throw new Error(info.error || 'Impossible de charger vos soutenances.');
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

  // Fonction de déconnexion
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
      setSoutenanceSelectionnee(null);
      setNoteEcrit('');
      setNoteOral('');
      setCommentaires('');
      fetchJuryData(); // Rafraîchir les données
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (chargement) return <div className="p-8 text-center text-black">Chargement de votre espace...</div>;
  if (erreur) return <div className="p-8 text-center text-red-600">{erreur}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header avec bouton Déconnexion */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Espace Membre du Jury</h1>
            <p className="text-gray-500">Bienvenue, Pr. {data?.jury.prenom} {data?.jury.nom}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
              Enseignant / Jury
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Liste des soutenances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Vos Sessions de Soutenance</h2>
            <p className="text-sm text-gray-500">Liste des mémoires que vous devez évaluer.</p>
          </div>

          {data?.soutenances.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">Aucune soutenance planifiée pour le moment.</p>
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
                          Noter / Évaluer
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

      {/* Modal d'évaluation */}
      {soutenanceSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-gray-900">Évaluation de la soutenance</h3>
              <button onClick={() => setSoutenanceSelectionnee(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <p className="text-xs text-gray-500">
              Candidat : <strong className="text-gray-700">{soutenanceSelectionnee.etudiant_prenom} {soutenanceSelectionnee.etudiant_nom}</strong><br/>
              Thème : <span className="italic">{soutenanceSelectionnee.theme_memoire}</span>
            </p>

            <form onSubmit={handleSoumettreNote} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Note Écrit (/20)</label>
                  <input 
                    type="number" step="0.25" min="0" max="20" required value={noteEcrit}
                    onChange={(e) => setNoteEcrit(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md text-sm text-black focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="14.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Note Oral (/20)</label>
                  <input 
                    type="number" step="0.25" min="0" max="20" required value={noteOral}
                    onChange={(e) => setNoteOral(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md text-sm text-black focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="16"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Observations / Commentaires</label>
                <textarea 
                  rows={3} value={commentaires} onChange={(e) => setCommentaires(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border rounded-md text-sm text-black focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Très bonne maîtrise du sujet, quelques corrections mineures à apporter au rapport..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" onClick={() => setSoutenanceSelectionnee(null)}
                  className="px-4 py-2 border rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" disabled={envoiEnCours}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium disabled:bg-indigo-400"
                >
                  {envoiEnCours ? 'Enregistrement...' : 'Valider la note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}