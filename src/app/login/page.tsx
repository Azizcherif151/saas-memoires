'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
  });

  const [statut, setStatut] = useState<{ type: 'succes' | 'erreur' | null; message: string }>({
    type: null,
    message: '',
  });

  const [chargement, setChargement] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
        message: `Bienvenue, ${donnees.utilisateur.prenom} ! Connexion réussie.`,
      });

      // Redirection dynamique reçue depuis l'API (/etudiant, /jury ou /dashboard)
      router.push(donnees.redirectTo);

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
      {/* Côté Blanc - Formulaire */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Connexion
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Accédez à votre espace de gestion
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
                <input
                  name="motDePasse"
                  type="password"
                  required
                  value={formData.motDePasse}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300  text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-white border border-gray-300  accent-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
              </label>
            </div>

            {/* Status Message */}
            {statut.message && (
              <div className={`p-4  text-sm text-center transition ${
                statut.type === 'succes' 
                  ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {statut.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={chargement}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold  transition duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {chargement ? 'Vérification...' : 'Se connecter'}
            </button>
          </form>

          
        </div>
      </div>

      {/* Côté Bleu - Welcome Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex-col items-center justify-center px-12 py-12 relative overflow-hidden">
        {/* Décoration */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-blue-300  opacity-40 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-200  opacity-40 blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          <h2 className="text-5xl font-bold text-white mb-4">
            EduSoutenance
          </h2>
          <p className="text-blue-50 text-lg leading-relaxed mb-8">
           Simplifiez la planification, le suivi et l'évaluation de vos mémoires de fin de cycle. Une expérience fluide et centralisée pour étudiants, encadreur et membres du jury.
          </p>
        </div>
      </div>
    </div>
  );
}