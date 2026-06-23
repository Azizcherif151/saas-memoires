'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nomEtablissement: '',
    prenomAdmin: '',
    nomAdmin: '',
    emailAdmin: '',
    motDePasseEnClair: '',
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
      const reponse = await fetch('/api/etablissement/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        throw new Error(donnees.error || "Une erreur est survenue lors de l'inscription.");
      }

      setStatut({
        type: 'succes',
        message: 'Établissement et compte administrateur créés avec succès !',
      });
      
      setFormData({ nomEtablissement: '', prenomAdmin: '', nomAdmin: '', emailAdmin: '', motDePasseEnClair: '' });

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
            Inscrire un établissement
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Créez l'établissement et son compte administrateur principal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Infos Établissement */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom de l'établissement</label>
              <input
                name="nomEtablissement"
                type="text"
                required
                value={formData.nomEtablissement}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                placeholder="Ex: Université de Technologie"
              />
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Infos Admin */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom Admin</label>
                <input
                  name="prenomAdmin"
                  type="text"
                  required
                  value={formData.prenomAdmin}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom Admin</label>
                <input
                  name="nomAdmin"
                  type="text"
                  required
                  value={formData.nomAdmin}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email de l'administrateur</label>
              <input
                name="emailAdmin"
                type="email"
                required
                value={formData.emailAdmin}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                placeholder="admin@etablissement.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                name="motDePasseEnClair"
                type="password"
                required
                value={formData.motDePasseEnClair}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
          </div>

          {/* Messages de retour */}
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
              {chargement ? 'Inscription en cours...' : "Inscrire l'établissement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}