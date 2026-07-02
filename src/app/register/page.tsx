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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8  -xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="space-y-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50  -lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m0 0H9.5m0 0H4m0 0v-1" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Inscrire un Établissement
          </h2>
          <p className="text-center text-sm text-gray-600">
            Créez l'établissement et son compte administrateur principal
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Établissement Section */}
          <div className="space-y-4 pb-6 border-b border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                🏢 Nom de l'établissement
              </label>
              <input
                name="nomEtablissement"
                type="text"
                required
                value={formData.nomEtablissement}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                placeholder="Ex: Université de Technologie"
              />
            </div>
          </div>

          {/* Admin Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                👤 Prénom du responsable
              </label>
              <input
                name="prenomAdmin"
                type="text"
                required
                value={formData.prenomAdmin}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                placeholder="Jean"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                👤 Nom du responsable
              </label>
              <input
                name="nomAdmin"
                type="text"
                required
                value={formData.nomAdmin}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                placeholder="Dupont"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                📧 Email de l'administrateur
              </label>
              <input
                name="emailAdmin"
                type="email"
                required
                value={formData.emailAdmin}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                placeholder="admin@etablissement.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                🔒 Mot de passe initial
              </label>
              <input
                name="motDePasseEnClair"
                type="password"
                required
                value={formData.motDePasseEnClair}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300  -lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Messages */}
          {statut.message && (
            <div className={`p-4  -lg text-sm text-center font-medium transition ${
              statut.type === 'succes'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {statut.type === 'succes' ? '✓' : '⚠️'} {statut.message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={chargement}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold  -lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 text-sm uppercase tracking-wider"
          >
            {chargement ? '⏳ Inscription en cours...' : '✓ Inscrire l\'établissement'}
          </button>
        </form>

        {/* Footer Info */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Ces identifiants permettront de créer le compte administrateur de votre établissement.
          </p>
        </div>
      </div>
    </div>
  );
}