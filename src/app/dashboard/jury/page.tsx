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

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Gestion des Membres du Jury
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Créez les comptes d'enseignants et assignez-les aux soutenances
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-3">
        {messageErreur && (
          <div className="p-4 bg-red-50 border border-red-200  -lg text-red-800 text-sm font-medium flex items-center gap-3">
            <span>⚠️</span> {messageErreur}
          </div>
        )}
        {messageSucces && (
          <div className="p-4 bg-green-50 border border-green-200  -lg text-green-800 text-sm font-medium flex items-center gap-3">
            <span>✓</span> {messageSucces}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaires */}
          <div className="space-y-6">
            {/* Création de compte */}
            <div className="bg-white  -xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50  -lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Créer un compte</h2>
                <p className="text-xs text-gray-600 mt-1">Enregistrez un nouvel enseignant</p>
              </div>

              <form onSubmit={handleInscrireEnseignant} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Prénom</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Nom</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Dupont"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="j.dupont@univ.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creationEnCours}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-2.5  -lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 text-sm uppercase tracking-wider"
                >
                  {creationEnCours ? "Création en cours..." : "Créer le compte"}
                </button>
              </form>
            </div>

            {/* Affectation */}
            <div className="bg-white  -xl border border-blue-200 p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-100  -lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Affecter à une soutenance</h2>
                <p className="text-xs text-gray-600 mt-1">Liez un enseignant à une soutenance</p>
              </div>

              <form onSubmit={handleAffecterEnseignant} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Enseignant</label>
                  <select
                    required
                    value={enseignantId}
                    onChange={(e) => setEnseignantId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">-- Sélectionner --</option>
                    {juryListe.map((j) => (
                      <option key={j.id} value={j.id}>M./Mme {j.nom} {j.prenom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Soutenance</label>
                  <select
                    required
                    value={soutenanceId}
                    onChange={(e) => setSoutenanceId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">-- Sélectionner --</option>
                    {soutenances.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.etudiant_prenom} {s.etudiant_nom} — {s.projet_titre.substring(0, 25)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Rôle</label>
                  <select
                    required
                    value={roleJury}
                    onChange={(e) => setRoleJury(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">-- Choisir un rôle --</option>
                    <option value="president">🎓 Président du Jury</option>
                    <option value="rapporteur">📄 Rapporteur</option>
                    <option value="examinateur">✓ Examinateur</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={affectationEnCours}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-2.5  -lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 text-sm uppercase tracking-wider"
                >
                  {affectationEnCours ? "Affectation..." : "Valider l'affectation"}
                </button>
              </form>
            </div>
          </div>

          {/* Tableau */}
          <div className="lg:col-span-2 bg-white  -xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                Membres enregistrés ({juryListe.length})
              </h2>
            </div>

            {chargement ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100  -full animate-pulse mb-3">
                  <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 text-sm font-medium">Chargement...</p>
              </div>
            ) : juryListe.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-600 text-sm font-medium">Aucun compte enseignant créé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Nom complet</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {juryListe.map((membre) => (
                      <tr key={membre.id} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8  -full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {membre.prenom.charAt(0)}{membre.nom.charAt(0)}
                            </div>
                            M./Mme {membre.prenom} {membre.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs font-mono">{membre.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold  -full">
                            <span className="w-2 h-2 bg-green-600  -full"></span>
                            Actif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}