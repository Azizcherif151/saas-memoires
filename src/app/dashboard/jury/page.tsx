'use client';

import { useEffect, useState } from 'react';

interface MembreJuryCompte {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  cree_at: string;
}

interface SoutenanceDisponible {
  id: string;
  projet_titre: string;
  etudiant_nom: string;
  etudiant_prenom: string;
}

export default function GestionComptesJury() {
  const [juryListe, setJuryListe] = useState<MembreJuryCompte[]>([]);
  const [soutenances, setSoutenances] = useState<SoutenanceDisponible[]>([]);
  const [chargement, setChargement] = useState(true);
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [affectationEnCours, setAffectationEnCours] = useState(false);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  // Champs Inscription (Bloc 1)
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  // Champs Affectation (Bloc 2)
  const [enseignantId, setEnseignantId] = useState('');
  const [soutenanceId, setSoutenanceId] = useState('');
  const [roleJury, setRoleJury] = useState('');

  const chargerDonneesInitiales = async () => {
    setChargement(true);
    try {
      const [resJury, resSoutenances] = await Promise.all([
        fetch('/api/jury'),
        fetch('/api/soutenances')
      ]);

      if (resJury.ok) {
        const dataJury = await resJury.json();
        setJuryListe(dataJury.jury || []);
      }
      if (resSoutenances.ok) {
        const dataSout = await resSoutenances.json();
        setSoutenances(dataSout.soutenances || []);
      }
    } catch (err) {
      console.error('Erreur de chargement', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDonneesInitiales();
  }, []);

  // Action 1 : Uniquement inscrire l'enseignant
  const handleInscrireEnseignant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreationEnCours(true);
    setMessageErreur(null);
    setMessageSucces(null);

    try {
      const res = await fetch('/api/jury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, motDePasse }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessageSucces("Compte enseignant créé avec succès !");
        setPrenom('');
        setNom('');
        setEmail('');
        setMotDePasse('');
        chargerDonneesInitiales();
      } else {
        setMessageErreur(data.error || 'Une erreur est survenue lors de l\'inscription.');
      }
    } catch (err) {
      setMessageErreur('Impossible de joindre le serveur.');
    } finally {
      setCreationEnCours(false);
    }
  };

  // Action 2 : Uniquement affecter un enseignant existant
  const handleAffecterEnseignant = async (e: React.FormEvent) => {
    e.preventDefault();
    setAffectationEnCours(true);
    setMessageErreur(null);
    setMessageSucces(null);

    try {
      const res = await fetch('/api/jury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilisateurId: enseignantId,
          soutenanceId,
          roleJury
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessageSucces("Enseignant affecté à la soutenance avec succès !");
        setEnseignantId('');
        setSoutenanceId('');
        setRoleJury('');
        chargerDonneesInitiales();
      } else {
        setMessageErreur(data.error || 'Une erreur est survenue lors de l\'affectation.');
      }
    } catch (err) {
      setMessageErreur('Impossible de joindre le serveur.');
    } finally {
      setAffectationEnCours(false);
    }
  };

  return (
    <div className="text-black space-y-4">

      {/* Messages globaux */}
      {messageErreur && <div className="p-3 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100 font-bold">{messageErreur}</div>}
      {messageSucces && <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 font-bold">{messageSucces}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne Gauche : Les deux modules d'action séparés */}
        <div className="flex flex-col gap-6">

          {/* ================= FORMULAIRE 1 : INSCRIPTION ================= */}
          <form onSubmit={handleInscrireEnseignant} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-black mb-1">Identité du Jury</h2>
            <p className="text-xs text-black mb-4 font-medium">Créez le compte d'un enseignant.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-3xs font-bold uppercase text-black mb-1">Prénom</label>
                <input
                  type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Jean" className="w-full text-xs p-2 rounded border bg-white border-gray-300 font-medium"
                />
              </div>
              <div>
                <label className="block text-3xs font-bold uppercase text-black mb-1">Nom</label>
                <input
                  type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
                  placeholder="Dupont" className="w-full text-xs p-2 rounded border bg-white border-gray-300 font-medium"
                />
              </div>
              <div>
                <label className="block text-3xs font-bold uppercase text-black mb-1">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="j.dupont@univ.com" className="w-full text-xs p-2 rounded border bg-white border-gray-300 font-medium"
                />
              </div>
              <div>
                <label className="block text-3xs font-bold uppercase text-black mb-1">Mot de passe</label>
                <input
                  type="password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••" className="w-full text-xs p-2 rounded border bg-white border-gray-300 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creationEnCours}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {creationEnCours ? "Inscription..." : "Créer le compte"}
            </button>
          </form>

          {/* ================= FORMULAIRE 2 : AFFECTATION ================= */}
          <form onSubmit={handleAffecterEnseignant} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-black mb-1">Affectation de Jury</h2>
            <p className="text-xs text-black mb-4 font-medium">Liez un enseignant existant à un examen.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-3xs font-bold uppercase text-black mb-1">Choisir l'enseignant</label>
                <select
                  required
                  value={enseignantId}
                  onChange={(e) => setEnseignantId(e.target.value)}
                  className="w-full text-xs p-2 rounded border bg-white text-black border-gray-300 font-semibold"
                >
                  <option value="">-- Sélectionner l'enseignant --</option>
                  {juryListe.map((j) => (
                    <option key={j.id} value={j.id}>M./Mme {j.nom} {j.prenom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-3xs font-bold uppercase text-black mb-1">Choisir la soutenance</label>
                <select
                  required
                  value={soutenanceId}
                  onChange={(e) => setSoutenanceId(e.target.value)}
                  className="w-full text-xs p-2 rounded border bg-white text-black border-gray-300 font-semibold"
                >
                  <option value="">-- Sélectionner la soutenance --</option>
{soutenances.map((s) => (
  <option key={s.id} value={s.id}>
    {(s.etudiant_prenom || '')} {(s.etudiant_nom || 'Étudiant')} — {(s.projet_titre?.substring(0, 25) || 'Sans titre')}...
  </option>
))}
                </select>
              </div>

              <div>
                <label className="block text-3xs font-bold uppercase text-black mb-1">Rôle affecté</label>
               <select
  required
  value={roleJury}
  onChange={(e) => setRoleJury(e.target.value)}
  className="w-full text-xs p-2 rounded border bg-white text-black border-gray-300 font-semibold"
>
  <option value="">-- Définir un rôle --</option>
  <option value="president">Président du Jury</option>
  <option value="rapporteur">Rapporteur</option>
  <option value="examinateur">Examinateur</option>
</select>
              </div>
            </div>

            <button
              type="submit"
              disabled={affectationEnCours}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {affectationEnCours ? "Affectation..." : "Valider l'affectation"}
            </button>
          </form>

        </div>

        {/* Colonne Droite : Tableau complet */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-bold text-black">Membres du Jury Enregistrés</h3>
          </div>

          {chargement ? (
            <p className="p-6 text-sm text-black animate-pulse font-medium">Mise à jour des listes...</p>
          ) : juryListe.length === 0 ? (
            <p className="p-6 text-sm text-black italic font-medium">Aucun compte enseignant créé.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-2xs font-bold text-black uppercase tracking-wider">
                  <th className="p-4">Nom complet</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-black font-medium">
                {juryListe.map((membre) => (
                  <tr key={membre.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold text-black">M./Mme {membre.prenom} {membre.nom}</td>
                    <td className="p-4 text-black">{membre.email}</td>
                    <td className="p-4 text-emerald-700 font-bold">Compte Actif</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}