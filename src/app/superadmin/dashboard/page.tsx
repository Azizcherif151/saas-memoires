'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, ShieldAlert, Plus, Search, CheckCircle, AlertCircle, Loader2, Power, PowerOff, LogOut } from 'lucide-react';

interface Etablissement {
  id: string;
  nom: string;
  responsable: string;
  email?: string;
  etudiants?: number;
  statut: string;
}

interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: string;
  etablissement: string | null;
}

interface LogActivite {
  id: number;
  utilisateur_nom: string;
  action: string;
  cible: string;
  ip: string;
  date_action: string;
}

type TabType = 'etablissements' | 'utilisateurs' | 'logs';

export default function SuperAdminDashboard() {
  const router = useRouter();

  // Navigation par onglet
  const [activeTab, setActiveTab] = useState<TabType>('etablissements');
  
  // États du formulaire établissement complet (fusionné depuis register)
  const [formData, setFormData] = useState({
    nomEtablissement: '',
    prenomAdmin: '',
    nomAdmin: '',
    emailAdmin: '',
    motDePasseEnClair: '',
  });
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  // États des données serveurs
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [logs, setLogs] = useState<LogActivite[]>([]);
  const [loading, setLoading] = useState(true);

  // Recherche textuelle
  const [searchQuery, setSearchQuery] = useState('');

  // Gestion des changements du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Chargement des données au démarrage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const resEtab = await fetch('/api/superadmin/etablissements');
        const dataEtab = await resEtab.json();
        if (resEtab.ok) setEtablissements(dataEtab.etablissements || dataEtab || []);

        const resUsers = await fetch('/api/superadmin/utilisateurs');
        const dataUsers = await resUsers.json();
        if (resUsers.ok) setUtilisateurs(dataUsers.utilisateurs || dataUsers || []);

        const resLogs = await fetch('/api/superadmin/logs');
        const dataLogs = await resLogs.json();
        if (resLogs.ok) setLogs(dataLogs.logs || dataLogs || []);

      } catch (err) {
        setIsError(true);
        setStatusMessage("Erreur réseau lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      } else {
        console.error("Erreur lors de la déconnexion");
      }
    } catch (error) {
      console.error("Erreur réseau lors de la déconnexion", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Création d'une instance avec son admin référent (POST)
  const handleCreateEtablissement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    setStatusMessage('');

    try {
      const response = await fetch('/api/etablissement/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setStatusMessage(data.error || "Une erreur est survenue lors de l'inscription.");
      } else {
        setIsError(false);
        setStatusMessage(`✓ L'établissement "${formData.nomEtablissement}" et son compte administrateur ont été configurés.`);
        
        const nouvelEtab = {
          id: data.data?.id || Math.random().toString(),
          nom: formData.nomEtablissement,
          responsable: `${formData.prenomAdmin} ${formData.nomAdmin}`,
          email: formData.emailAdmin,
          statut: 'Actif'
        };
        setEtablissements(prev => [nouvelEtab, ...prev]);

        setFormData({
          nomEtablissement: '',
          prenomAdmin: '',
          nomAdmin: '',
          emailAdmin: '',
          motDePasseEnClair: '',
        });

        const resLogs = await fetch('/api/superadmin/logs');
        const dataLogs = await resLogs.json();
        if (resLogs.ok) setLogs(dataLogs.logs || []);
      }
    } catch (error) {
      setIsError(true);
      setStatusMessage("Erreur de communication avec le serveur.");
    }
  };

  // Activer / Suspendre une instance (PATCH)
  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Actif' ? 'Suspendu' : 'Actif';
    try {
      const response = await fetch('/api/superadmin/etablissements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut: nextStatus }),
      });
      if (response.ok) {
        setEtablissements(prev =>
          prev.map(item => item.id === id ? { ...item, statut: nextStatus } : item)
        );
        const resLogs = await fetch('/api/superadmin/logs');
        const dataLogs = await resLogs.json();
        if (resLogs.ok) setLogs(dataLogs.logs || []);
      }
    } catch (err) {
      console.error("Impossible de modifier le statut.");
    }
  };

  // Filtrage par barre de recherche
  const filteredEtablissements = etablissements.filter(e => 
    e.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.responsable.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUtilisateurs = utilisateurs.filter(u => 
    u.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLogs = logs.filter(l =>
    l.utilisateur_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.cible.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 antialiased font-sans">
      
      {/* Header (Inspiré de superadmin2) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Panel SuperAdmin
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Console de contrôle global • EduSoutenance
              </p>
            </div>
            
            {/* Bouton de déconnexion */}
            <button
              onClick={handleLogout}
              disabled={isDisconnecting}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition duration-200 disabled:opacity-50"
            >
              {isDisconnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{isDisconnecting ? 'Déconnexion...' : 'Se déconnecter'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation - Onglets modernes et clairs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'etablissements', label: 'Établissements', icon: Building2 },
              { id: 'utilisateurs', label: ' Gestion des Comptes', icon: Users },
              { id: 'logs', label: ' Sécurité & Logs', icon: ShieldAlert },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4 stroke-[2]" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Zone Principale */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12 space-y-8">
        
        {/* Messages de statut */}
        {statusMessage && (
          <div className={`p-4  text-sm font-medium flex items-center gap-3 ${
            isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {isError ? <AlertCircle className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
            {statusMessage}
          </div>
        )}

        {/* CONTENU ONGLET : ÉTABLISSEMENTS */}
        {activeTab === 'etablissements' && (
          <div className="space-y-6">
            
            {/* Formulaire complet d'enregistrement */}
            <div className="bg-white  border border-gray-200 shadow-sm p-6 sm:p-8">
              <div className="mb-6 space-y-1">
                <h2 className="text-xl font-bold text-gray-900">Inscrire un Nouvel Établissement</h2>
                <p className="text-gray-600 text-xs">Configurez l'instance de l'école et générez instantanément les accès de l'administrateur principal.</p>
              </div>
        
              <form onSubmit={handleCreateEtablissement} className="space-y-6">
                {/* Section Instance */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider" >Nom de l'établissement</label>
                  <input 
                    type="text" 
                    name="nomEtablissement" 
                    required 
                    value={formData.nomEtablissement} 
                    onChange={handleChange} 
                    placeholder="Ex: Université de Technologie (ESATIC)" 
                    className="w-full px-4 py-2.5 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition"
                  />
                </div>

                {/* Section Admin Responsable */}
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Compte Administrateur Référent</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Prénom</label>
                      <input 
                        type="text" 
                        name="prenomAdmin" 
                        required 
                        value={formData.prenomAdmin} 
                        onChange={handleChange} 
                        placeholder="Jean" 
                        className="w-full px-4 py-2.5 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"> Nom</label>
                      <input 
                        type="text" 
                        name="nomAdmin" 
                        required 
                        value={formData.nomAdmin} 
                        onChange={handleChange} 
                        placeholder="Dupont" 
                        className="w-full px-4 py-2.5 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Email Professionnel</label>
                      <input 
                        type="email" 
                        name="emailAdmin" 
                        required 
                        value={formData.emailAdmin} 
                        onChange={handleChange} 
                        placeholder="admin@etablissement.com" 
                        className="w-full px-4 py-2.5 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Mot de passe initial</label>
                      <input 
                        type="password" 
                        name="motDePasseEnClair" 
                        required 
                        value={formData.motDePasseEnClair} 
                        onChange={handleChange} 
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white  font-medium text-sm transition shadow-sm flex items-center gap-2 uppercase tracking-wider text-xs"
                  >
                    <Plus className="w-4 h-4" /> Créer l'établissement et l'admin
                  </button>
                </div>
              </form>
            </div>

            {/* Tableau des instances */}
            <div className="bg-white  border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">Établissements sous gestion ({filteredEtablissements.length})</h3>
                <div className="relative w-full sm:w-auto">
                  <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Rechercher une instance..." 
                    className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Nom de l'école</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Responsable</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Statut</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500">
                          <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-blue-600"/>Chargement...
                        </td>
                      </tr>
                    ) : filteredEtablissements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-400">Aucun établissement trouvé.</td>
                      </tr>
                    ) : (
                      filteredEtablissements.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-semibold text-gray-900">{item.nom}</td>
                          <td className="px-6 py-4 text-gray-600">{item.responsable}</td>
                          <td className="px-6 py-4 text-gray-600 font-mono text-xs">{item.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1  text-xs font-semibold ${
                              item.statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => toggleStatus(item.id, item.statut)}
                              className={`px-4 py-2 text-xs font-medium transition flex items-center gap-1.5 ml-auto ${
                                item.statut === 'Actif' 
                                  ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                                  : 'bg-green-100 hover:bg-green-200 text-green-700'
                              }`}
                              title={item.statut === 'Actif' ? "Suspendre l'établissement" : "Réactiver l'établissement"}
                            >
                              {item.statut === 'Actif' ? (
                                <>
                                  <PowerOff className="w-3.5 h-3.5" /> Suspendre
                                </>
                              ) : (
                                <>
                                  <Power className="w-3.5 h-3.5" />Réactiver
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET : GESTION DES COMPTES */}
        {activeTab === 'utilisateurs' && (
          <div className="bg-white  border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-gray-900">Tous les comptes utilisateurs</h3>
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Rechercher un utilisateur..." 
                  className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Nom complet</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Rôle</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Établissement affecté</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-blue-600"/>Chargement...
                      </td>
                    </tr>
                  ) : filteredUtilisateurs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-neutral-400">Aucun compte trouvé.</td>
                    </tr>
                  ) : (
                    filteredUtilisateurs.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900">{user.nom}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1  text-xs font-semibold uppercase tracking-wider">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{user.etablissement || "(Global / SaaS)"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET : SÉCURITÉ & LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white  border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Journal d'audit et événements système</h3>
                <p className="text-sm text-gray-600 mt-1">Historique des actions critiques de l'infrastructure.</p>
              </div>
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Filtrer les logs..." 
                  className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Date & Heure</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Opérateur</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Action</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Cible</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-blue-600"/>Chargement...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-neutral-400">Aucun log correspondant trouvé.</td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition font-mono text-xs">
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(log.date_action).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 font-sans text-sm">{log.utilisateur_nom}</td>
                        <td className="px-6 py-4 text-gray-600 font-sans text-sm">{log.action}</td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1  text-xs font-mono">
                            {log.cible}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{log.ip || '127.0.0.1'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}