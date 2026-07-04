'use client';

import { useState, useEffect } from 'react';
import {
  ResearchIcon,
  BoockIcon,
  StudentIcon,
  CalendarIcon,
  SablierIcon,
  ProjectIcon
} from '@/components/icons';


interface Memoire {
  id: string;
  titre: string;
  description: string;
  statut: string;
  etudiant_prenom?: string;
  etudiant_nom?: string;
  derniere_mise_a_jour: string;
}

interface Etudiant {
  id: string;
  prenom: string;
  nom: string;
}

export default function MemoiresPage() {
  const [memoires, setMemoires] = useState<Memoire[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [chargement, setChargement] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({ titre: '', description: '', etudiantId: '' });
  const [statut, setStatut] = useState<{ type: 'succes' | 'erreur' | null; message: string }>({ type: null, message: '' });
  const [envoi, setEnvoi] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/memoires');
      const data = await res.json();

      if (res.ok) {
        setMemoires(data.memoires || []);
        setEtudiants(data.etudiants || []);
      } else {
        console.error("Erreur renvoyée par l'API :", data.error);
      }

    } catch (err) {
      console.error('Erreur de chargement des données', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setStatut({ type: null, message: '' });

    try {
      const res = await fetch('/api/memoires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création.');

      setStatut({ type: 'succes', message: data.message });
      setFormData({ titre: '', description: '', etudiantId: '' });
      fetchData();
    } catch (err: any) {
      setStatut({ type: 'erreur', message: err.message });
    } finally {
      setEnvoi(false);
    }
  };

  const filteredMemoires = memoires.filter(m =>
    m.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      'brouillon': { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: <ProjectIcon  />, 
        label: 'Brouillon' 
      },
      'en_attente_validation': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: <SablierIcon/>, 
        label: 'En attente' 
      },
      'valide': { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>, 
        label: 'Validé' 
      },
    };
    return badges[statut as keyof typeof badges] || badges['brouillon'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Projets de Mémoire
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Attribuez et suivez l'avancement des sujets de thèses
              </p>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400"><ResearchIcon/> </span>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-fit sticky top-24">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Nouveau sujet</h2>
              <p className="text-sm text-gray-600 mt-1">Créez un projet de mémoire</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Titre du projet</label>
                <input
                  type="text"
                  required
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  placeholder="Ex: Application de gestion..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 h-24 resize-none"
                  placeholder="Objectifs du projet..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Attribuer à un étudiant</label>
                <select
                  value={formData.etudiantId}
                  onChange={(e) => setFormData({ ...formData, etudiantId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
                >
                  <option value="">Sélectionner un étudiant...</option>
                  {etudiants.map((et) => (
                    <option key={et.id} value={et.id}>{et.prenom} {et.nom}</option>
                  ))}
                </select>
              </div>

              {statut.message && (
                <div className={`p-3 rounded-lg text-xs font-medium text-center transition ${
                  statut.type === 'succes'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {statut.message}
                </div>
              )}

              <button
                type="submit"
                disabled={envoi}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
              >
                {envoi ? 'Enregistrement...' : 'Créer le projet'}
              </button>
            </form>
          </div>

          {/* Liste */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Projets ({filteredMemoires.length})
              </h2>
              <p className="text-sm text-gray-600">Total: {memoires.length} projet{memoires.length > 1 ? 's' : ''}</p>
            </div>

            {chargement ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
                ))}
              </div>
            ) : filteredMemoires.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="relative flex items-center justify-center mb-3">
                  <BoockIcon />
                </div>
                <p className="text-gray-600 text-sm font-medium">
                  {searchQuery ? 'Aucun projet ne correspond à votre recherche' : 'Aucun sujet enregistré'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMemoires.map((m) => {
                  const badge = getStatutBadge(m.statut);
                  return (
                    <div
                      key={m.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="font-bold text-gray-900 text-base flex-1">{m.titre}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge.bg} ${badge.text}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {m.description || 'Aucune description fournie.'}
                      </p>

                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <span><StudentIcon/></span>
                            <span className="font-medium text-gray-900">
                              {m.etudiant_prenom ? `${m.etudiant_prenom} ${m.etudiant_nom}` : 'Non attribué'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span><CalendarIcon/> Mis à jour le {new Date(m.derniere_mise_a_jour).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}