'use client';
import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalChangementMotDePasse({ isOpen, onClose }: ModalProps) {
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [statut, setStatut] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [enCours, setEnCours] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatut(null);

    if (nouveauMotDePasse !== confirmation) {
      setStatut({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setStatut({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setEnCours(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ancienMotDePasse, nouveauMotDePasse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');

      setStatut({ type: 'success', message: 'Mot de passe modifié avec succès !' });
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmation('');
      setTimeout(() => { onClose(); setStatut(null); }, 1500);
    } catch (err: any) {
      setStatut({ type: 'error', message: err.message });
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] text-black animate-fade-in">
      <div className="bg-white  -xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-gray-100">
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Modifier le mot de passe</h3>
            <p className="text-2xs text-gray-400">Sécurisez l'accès à votre espace personnel.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {statut && (
          <div className={`p-2.5  -md text-2xs font-medium ${
            statut.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {statut.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-2xs font-semibold text-gray-700">Mot de passe actuel</label>
            <input
              type="password"
              required
              value={ancienMotDePasse}
              onChange={(e) => setAncienMotDePasse(e.target.value)}
              className="mt-1 block w-full px-3 py-1.5 border border-gray-200  -md text-xs bg-white text-black focus:outline-indigo-600"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-gray-700">Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              className="mt-1 block w-full px-3 py-1.5 border border-gray-200  -md text-xs bg-white text-black focus:outline-indigo-600"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-gray-700">Confirmer le mot de passe</label>
            <input
              type="password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-1 block w-full px-3 py-1.5 border border-gray-200  -md text-xs bg-white text-black focus:outline-indigo-600"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t text-2xs">
            <button type="button" onClick={onClose} className="px-3 py-1.5 border  -md text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={enCours} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white  -md font-medium disabled:bg-indigo-400">
              {enCours ? 'Mise à jour...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}