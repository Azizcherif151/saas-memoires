'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
  });

  const [statut, setStatut] = useState<{
    type: 'succes' | 'erreur' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });

  const [chargement, setChargement] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setStatut({ type: null, message: '' });

    try {
      const reponse = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        throw new Error(donnees.error || 'Une erreur est survenue.');
      }

      setStatut({
        type: 'succes',
        message: `Bienvenue, ${donnees.utilisateur.prenom} ! Redirection en cours...`,
      });

      // Redirection dynamique reçue depuis l'API
      setTimeout(() => {
        router.push(donnees.redirectTo);
      }, 800);
    } catch (erreur: any) {
      setStatut({
        type: 'erreur',
        message: erreur.message,
      });
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ========== PARTIE GAUCHE (visuel) ========== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 overflow-hidden">
        {/* Décorations */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-white font-bold text-xl">
                E
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Edu<span className="text-indigo-200">Soutenance</span>
              </span>
            </Link>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold leading-tight">
              Bienvenue sur la plateforme de gestion des mémoires
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Connectez-vous pour accéder à votre espace : administrateur,
              étudiant, encadreur ou membre du jury.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              {[
                'Suivi complet des mémoires',
                'Planification des soutenances',
                'Notation et validation en ligne',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-indigo-50">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-indigo-200/80">
            © {new Date().getFullYear()} EduSoutenance — Côte d&apos;Ivoire
          </p>
        </div>
      </div>

      {/* ========== PARTIE DROITE (formulaire) ========== */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl">
                E
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Edu<span className="text-indigo-600">Soutenance</span>
              </span>
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
              <p className="mt-2 text-sm text-slate-500">
                Accédez à votre espace de travail
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                    placeholder="votre.email@etablissement.ci"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    name="motDePasse"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.motDePasse}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Message d'état */}
              {statut.message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium text-center transition ${
                    statut.type === 'succes'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {statut.message}
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={chargement}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed transition hover:scale-[1.01] active:scale-[0.99]"
              >
                {chargement ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Vérification...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Lien retour */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-sm text-slate-500 hover:text-indigo-600 transition inline-flex items-center gap-1.5"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Vous n&apos;avez pas encore de compte ?{' '}
            <a href="/#demande" className="font-medium text-indigo-600 hover:text-indigo-700">
              Faire une demande d&apos;accès
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}