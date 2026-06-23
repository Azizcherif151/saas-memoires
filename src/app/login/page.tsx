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

      router.push('/dashboard');

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Connexion Administration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accédez à votre espace de gestion
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse Email</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                placeholder="admin@etablissement.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                name="motDePasse"
                type="password"
                required
                value={formData.motDePasse}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
          </div>

          {statut.message && (
            <div className={`p-3 rounded-md text-sm text-center ${statut.type === 'succes' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {statut.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={chargement}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {chargement ? 'Vérification...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}