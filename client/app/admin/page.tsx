'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  login,
  getStats,
  getParametres,
  updateParametres,
  getVisiteurs,
  getCommandes,
  getTypesArticlesAdmin,
  creerTypeArticle,
  supprimerTypeArticle,
  getArticles,
  getArticlesAdmin,
  deleteArticle,
  toggleDisponible,
  toggleIndisponible,
  creerPAC,
  updatePAC,
  getPACsAdmin,
  togglePACActif,
  deletePAC,
  reinitialiserSite,
  reinitialiserStats,
  getAdmins,
  creerAdmin,
  supprimerAdmin,
  modifierPasswordAdmin,
  bloquerAdmin,
  getAdminLogs,
  getFraisLivraison,
  updatePrixLivraison,
  creerCommuneLivraison,
  supprimerCommuneLivraison,
  getPackVisiteurs,
  creerPackVisiteur,
  updatePackVisiteur,
  deletePackVisiteur,
  togglePackVisiteurActif,
  getContenusLegaux,
  updateContenuLegal,
  deleteContenuLegal,
  getContenuLegalPublic,
} from '@/lib/api';
import ArticleForm from './components/ArticleForm';

import QuillEditor from '@/components/QuillEditor';

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<string | null>(null); // Pour isoler les états par admin
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>({});
  const [parametres, setParametres] = useState<any>({});
  const [parametresInitiaux, setParametresInitiaux] = useState<any>({});
  const [visiteurs, setVisiteurs] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [typesArticles, setTypesArticles] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [pacs, setPACs] = useState<any[]>([]);
  const [fraisLivraison, setFraisLivraison] = useState<any[]>([]);
  const [prixEnEdition, setPrixEnEdition] = useState<{ [key: number]: string }>({});
  const [showCommuneForm, setShowCommuneForm] = useState(false);
  const [newCommune, setNewCommune] = useState({ commune: '', prix: 1500 });
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [editingPasswordId, setEditingPasswordId] = useState<number | null>(null);
  const [editingPassword, setEditingPassword] = useState('');
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [showPackForm, setShowPackForm] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any | null>(null);
  const [packType, setPackType] = useState<'boutique' | 'clients' | null>(null);
  type Pack = {
  nom: string;
  description: string;
  nombre_articles: number;
  prix: string;
  prix_original: string;
  type_id?: string;
  articles_selectionnes: { article_id: number; quantite: number }[];
  actif: boolean;
};
const [newPack, setNewPack] = useState<Pack>({
    nom: '',
    description: '',
    nombre_articles: 2,
    prix: '',
    prix_original: '',
    articles_selectionnes: [] as Array<{ article_id: number; quantite: number }>,
    actif: false
  });
  const [filtreVisiteurs, setFiltreVisiteurs] = useState({
    periode: 'semaine', // Par défaut : hebdomadaire
    date_debut: '',
    date_fin: '',
    heure: ''
  });
  const [filtreCommandes, setFiltreCommandes] = useState({
    periode: 'semaine',
    date_debut: '',
    date_fin: '',
    heure: '',
    lieu: '',
    contact: ''
  });
  const [searchArticles, setSearchArticles] = useState('');
  const [searchPacks, setSearchPacks] = useState('');
  const [packVisiteurs, setPackVisiteurs] = useState<any[]>([]);
  const [showPackVisiteursForm, setShowPackVisiteursForm] = useState(false);
  const [selectedPackVisiteur, setSelectedPackVisiteur] = useState<any | null>(null);
  const [packVisiteursConfig, setPackVisiteursConfig] = useState({
    nom: '',
    mode: 'articles' as 'articles' | 'type',
    articles_ids: [] as number[],
    type_id: null as number | null,
    reduction: 5,
    nombre_articles: 3,
    actif: true
  });

  // Charger les données du pack sélectionné pour modification
  useEffect(() => {
    if (selectedPack && packType === 'boutique') {
      // Charger les données du pack dans le formulaire
      // Les articles peuvent être au format {article_id, quantite} ou {id} (ancien format)
      const articlesSelectionnes: Array<{ article_id: number; quantite: number }> = [];
      if (selectedPack.articles && Array.isArray(selectedPack.articles)) {
        selectedPack.articles.forEach((article: any) => {
          if (article.article_id && article.quantite) {
            // Format avec article_id et quantite (nouveau format)
            articlesSelectionnes.push({
              article_id: article.article_id,
              quantite: article.quantite
            });
          } else if (article.id) {
            // Format simple avec juste l'ID (ancien format) - compter les occurrences
            const existing = articlesSelectionnes.find(item => item.article_id === article.id);
            if (existing) {
              existing.quantite += 1;
            } else {
              articlesSelectionnes.push({
                article_id: article.id,
                quantite: 1
              });
            }
          }
        });
      }
      
      setNewPack({
        nom: selectedPack.nom || '',
        description: selectedPack.description || '',
        nombre_articles: selectedPack.nombre_articles || 2,
        prix: selectedPack.prix ? String(selectedPack.prix) : '',
        prix_original: selectedPack.prix_original ? String(selectedPack.prix_original) : '',
        articles_selectionnes: articlesSelectionnes,
        actif: selectedPack.actif === 1 || selectedPack.actif === true
      });
      setShowPackForm(true);
    }
  }, [selectedPack, packType]);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedAdmin = localStorage.getItem('admin_username');
    if (savedToken) {
      // Vérifier si le token est valide en testant une requête simple
      getStats(savedToken)
        .then(() => {
          setToken(savedToken);
          setCurrentAdmin(savedAdmin);
          setAuthenticated(true);
          loadData(savedToken);
        })
        .catch((err) => {
          // Token invalide ou expiré - on essaie quand même de charger les données
          // Si ça échoue, l'utilisateur devra se reconnecter
          console.log('Token peut-être expiré, tentative de chargement...');
          setToken(savedToken);
          setCurrentAdmin(savedAdmin);
          setAuthenticated(true);
          loadData(savedToken).catch(() => {
            // Si vraiment le token est invalide, on déconnecte
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_username');
            setAuthenticated(false);
            setToken(null);
            setCurrentAdmin(null);
          });
        });
    }
  }, []);

  const loadData = async (authToken: string) => {
    try {
      // Charger chaque ressource indépendamment pour éviter qu'une erreur bloque tout
      const results = await Promise.allSettled([
        getStats(authToken),
        getParametres(authToken),
        getVisiteurs(authToken, { periode: filtreVisiteurs.periode || 'semaine' }),
        getCommandes(authToken),
        getTypesArticlesAdmin(authToken),
        getArticlesAdmin(authToken),
        getPACsAdmin(authToken),
        getAdmins(authToken),
        getFraisLivraison(authToken),
        getPackVisiteurs(authToken)
      ]);

      // Traiter chaque résultat avec gestion d'erreur individuelle
      const getResultData = (result: PromiseSettledResult<any>, defaultData: any) => {
        if (result.status === 'fulfilled') {
          return result.value?.data ?? defaultData;
        } else {
          console.error('Erreur lors du chargement:', result.reason?.response?.data || result.reason?.message || result.reason);
          return defaultData;
        }
      };

      const parametresData = getResultData(results[1], {});
      
      // Normaliser TOUS les _active (wave, réseaux sociaux, maintenance) lors du chargement initial
      // IMPORTANT: Ne pas écraser les valeurs si elles existent déjà et sont valides
      const activeParams = ['wave_active', 'tiktok_active', 'instagram_active', 'whatsapp_active', 'gmail_active', 'maintenance_active', 'alerte_fetes_active'];
      activeParams.forEach(key => {
        if (parametresData) {
          // Si la valeur existe déjà et est '1' ou '0', la conserver telle quelle
          if (parametresData[key] === '1' || parametresData[key] === '0') {
            // Valeur déjà normalisée, ne pas la modifier
            return;
          }
          // Sinon, normaliser
          if (parametresData[key] === undefined || parametresData[key] === null || parametresData[key] === '') {
          parametresData[key] = '0'; // Désactivé par défaut
          } else {
          // Normaliser explicitement : '1' ou 1 ou true ou 'true' = '1', sinon '0'
          parametresData[key] = (parametresData[key] === '1' || parametresData[key] === 1 || parametresData[key] === true || parametresData[key] === 'true') ? '1' : '0';
          }
        }
      });
      
      setStats(getResultData(results[0], {}));
      setParametres(parametresData || {});
      // Sauvegarder les paramètres initiaux pour comparaison (deep copy)
      setParametresInitiaux(JSON.parse(JSON.stringify(parametresData || {})));
      setVisiteurs(getResultData(results[2], []));
      setCommandes(getResultData(results[3], []));
      setTypesArticles(getResultData(results[4], []));
      setArticles(getResultData(results[5], []));
      setPACs(getResultData(results[6], []));
      setAdmins(getResultData(results[7], []));
      setFraisLivraison(getResultData(results[8], []));
      setPackVisiteurs(getResultData(results[9], []));
      
      // Les packs visiteurs sont maintenant chargés directement via getPackVisiteurs
      
      const statsData = getResultData(results[0], {});
      const articlesData = getResultData(results[5], []);
      const typesData = getResultData(results[4], []);
      
      console.log('✅ Données chargées avec succès:', {
        articles: articlesData?.length || 0,
        types: typesData?.length || 0,
        visiteurs: getResultData(results[2], [])?.length || 0,
        commandes: getResultData(results[3], [])?.length || 0,
        stats: statsData
      });
    } catch (err: any) {
      console.error('❌ Erreur critique lors du chargement des données:', err);
      alert(`Erreur lors du chargement des données: ${err?.message || 'Erreur inconnue'}\n\nVeuillez vérifier votre connexion et rafraîchir la page.`);
    }
  };

  const handleCreateType = async () => {
    if (!newTypeName.trim()) {
      alert('Veuillez entrer un nom');
      return;
    }
    try {
      await creerTypeArticle(newTypeName.trim(), token!);
      setNewTypeName('');
      await loadData(token!);
      alert('Type créé avec succès !');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la création du type');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      const authToken = res.data.token;
      const adminUsername = res.data.admin?.username || username;
      
      // Si changement d'admin, réinitialiser tous les formulaires
      if (currentAdmin && currentAdmin !== adminUsername) {
        setShowArticleForm(false);
        setSelectedArticle(null);
        setShowTypeForm(false);
        setNewTypeName('');
        setShowPackForm(false);
        setPackType(null);
        setNewPack({ nom: '', description: '', nombre_articles: 2, prix: '', prix_original: '', articles_selectionnes: [] as Array<{ article_id: number; quantite: number }>, actif: false });
        setShowAdminForm(false);
        setNewAdminUsername('');
        setNewAdminPassword('');
        setActiveTab('dashboard');
      }
      
      setToken(authToken);
      setCurrentAdmin(adminUsername);
      setAuthenticated(true);
      localStorage.setItem('admin_token', authToken);
      localStorage.setItem('admin_username', adminUsername);
      loadData(authToken);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur de connexion');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h1 className="luxury-title text-3xl text-[#1A1A1A] font-light tracking-wide mb-2">Admin</h1>
            <p className="luxury-text text-sm text-[#8B7355] font-light">Connexion à l'administration</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block luxury-text text-xs text-[#1A1A1A] uppercase tracking-wider mb-2 font-medium">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E5E5] focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white text-[#1A1A1A] luxury-text"
                required
              />
            </div>
            <div>
              <label className="block luxury-text text-xs text-[#1A1A1A] uppercase tracking-wider mb-2 font-medium">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E5E5] focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white text-[#1A1A1A] luxury-text"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1A1A1A] text-white py-3 px-6 uppercase tracking-wider text-sm font-medium hover:bg-[#2A2A2A] transition-colors luxury-text"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Admin - Design professionnel */}
      <header className="border-b border-[#E5E5E5] bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <img
                src="/logo/LOGO.png"
                alt="SAFIYA BOUTIQUE"
                className="h-8 sm:h-10 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div>
                <h1 className="luxury-title text-lg sm:text-xl text-[#1A1A1A] font-light tracking-wide">Administration</h1>
                <p className="luxury-text text-[10px] sm:text-xs text-[#8B7355]">Tableau de bord</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#FAF7F0] rounded-lg">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="luxury-text text-[10px] sm:text-xs text-[#3D2817] font-medium truncate">
                  {currentAdmin}
                </span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_token');
                  localStorage.removeItem('admin_username');
                  setAuthenticated(false);
                  setToken(null);
                  setCurrentAdmin(null);
                }}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 luxury-text text-[10px] sm:text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors uppercase tracking-wider font-medium"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">Déco</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation horizontale améliorée */}
        <nav className="border-t border-[#E5E5E5] bg-white/50">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="flex space-x-1 overflow-x-auto scrollbar-thin pb-2">
              {[
                { id: 'dashboard', label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { id: 'articles', label: 'Articles', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                { id: 'types', label: 'Types', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
                { id: 'pac', label: 'Packs', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                { id: 'visites', label: 'Visites', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
                { id: 'commandes', label: 'Commandes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { id: 'ca-potentiel', label: 'CA Potentiel', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { id: 'livraison', label: 'Livraison', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
                { id: 'contenus-legaux', label: 'Contenus Légaux', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { id: 'coordonnees', label: 'Coordonnées', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                { id: 'admins', label: 'Admins', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { id: 'parametres', label: 'Paramètres', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 luxury-text text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-[#D4AF37] text-[#1A1A1A] font-semibold bg-[#FAF7F0]' 
                      : 'border-transparent text-[#8B7355] hover:text-[#1A1A1A] hover:border-[#E5E5E5] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full">
            {/* En-tête du dashboard */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="luxury-title text-2xl sm:text-3xl text-[#1A1A1A] font-light mb-2">Tableau de bord</h2>
                <p className="luxury-text text-xs sm:text-sm text-[#8B7355]">Vue d'ensemble de votre boutique</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="luxury-text text-[10px] sm:text-xs text-[#8B7355] uppercase tracking-wider">Dernière mise à jour</p>
                <p className="luxury-text text-xs sm:text-sm text-[#3D2817] font-medium">{new Date().toLocaleString('fr-FR')}</p>
              </div>
            </div>

            {/* Cartes statistiques principales avec graphiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => setActiveTab('visites')}
                className="group bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-6 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer text-left rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 relative">
                    {(() => {
                      const maxValue = Math.max(stats.visiteurs || 0, 100);
                      const percentage = Math.min((stats.visiteurs || 0) / maxValue * 100, 100);
                      const circumference = 2 * Math.PI * 28;
                      const offset = circumference - (percentage / 100) * circumference;
                      return (
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-200" />
                          <circle 
                            cx="32" cy="32" r="28" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="text-blue-500 transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                      );
                    })()}
                  </div>
                </div>
                <h3 className="luxury-text text-xs text-blue-700 uppercase tracking-wider mb-2 font-medium">Total Visites</h3>
                <p className="luxury-title text-4xl text-blue-900 font-light mb-1">{stats.visiteurs || 0}</p>
                <p className="luxury-text text-xs text-blue-600 mt-1">Toutes les visites</p>
                <p className="luxury-text text-xs text-blue-500 mt-3 group-hover:translate-x-1 transition-transform">Voir les détails →</p>
              </button>

              <button
                onClick={() => setActiveTab('visites')}
                className="group bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 p-6 hover:border-green-400 hover:shadow-xl transition-all cursor-pointer text-left rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 relative">
                    {(() => {
                      const maxValue = Math.max(stats.visiteurs_uniques || 0, stats.visiteurs || 0, 50);
                      const percentage = stats.visiteurs ? Math.min((stats.visiteurs_uniques || 0) / stats.visiteurs * 100, 100) : 0;
                      const circumference = 2 * Math.PI * 28;
                      const offset = circumference - (percentage / 100) * circumference;
                      return (
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-green-200" />
                          <circle 
                            cx="32" cy="32" r="28" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="text-green-500 transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                      );
                    })()}
                  </div>
                </div>
                <h3 className="luxury-text text-xs text-green-700 uppercase tracking-wider mb-2 font-medium">Visiteurs Uniques</h3>
                <p className="luxury-title text-4xl text-green-900 font-light mb-1">{stats.visiteurs_uniques || 0}</p>
                <p className="luxury-text text-xs text-green-600 mt-1">Par IP distincte</p>
                <p className="luxury-text text-xs text-green-500 mt-3 group-hover:translate-x-1 transition-transform">Voir les détails →</p>
              </button>

              <button
                onClick={() => setActiveTab('commandes')}
                className="group bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6 hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer text-left rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 relative">
                    {(() => {
                      const maxValue = Math.max(stats.commandes || 0, 50);
                      const percentage = Math.min((stats.commandes || 0) / maxValue * 100, 100);
                      const circumference = 2 * Math.PI * 28;
                      const offset = circumference - (percentage / 100) * circumference;
                      return (
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-purple-200" />
                          <circle 
                            cx="32" cy="32" r="28" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="text-purple-500 transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                      );
                    })()}
                  </div>
                </div>
                <h3 className="luxury-text text-xs text-purple-700 uppercase tracking-wider mb-2 font-medium">Commandes</h3>
                <p className="luxury-title text-4xl text-purple-900 font-light mb-1">{stats.commandes || 0}</p>
                <p className="luxury-text text-xs text-purple-600 mt-1">Toutes les commandes</p>
                <p className="luxury-text text-xs text-purple-500 mt-3 group-hover:translate-x-1 transition-transform">Voir les détails →</p>
              </button>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 relative">
                    {(() => {
                      const maxValue = Math.max(stats.articles || 0, 100);
                      const percentage = Math.min((stats.articles || 0) / maxValue * 100, 100);
                      const circumference = 2 * Math.PI * 28;
                      const offset = circumference - (percentage / 100) * circumference;
                      return (
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-orange-200" />
                          <circle 
                            cx="32" cy="32" r="28" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="text-orange-500 transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                      );
                    })()}
                  </div>
                </div>
                <h3 className="luxury-text text-xs text-orange-700 uppercase tracking-wider mb-2 font-medium">Articles</h3>
                <p className="luxury-title text-4xl text-orange-900 font-light mb-1">{stats.articles || 0}</p>
                <p className="luxury-text text-xs text-orange-600 mt-1">Total articles</p>
              </div>
            </div>
            
            {/* Graphiques et statistiques détaillées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique des articles par statut */}
              <div className="bg-white border-2 border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Répartition des Articles</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="luxury-text text-sm text-[#5C4033]">Disponibles</span>
                      <span className="luxury-text text-sm font-semibold text-green-600">{stats.articles_disponibles || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.articles ? ((stats.articles_disponibles || 0) / stats.articles * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="luxury-text text-sm text-[#5C4033]">Cachés</span>
                      <span className="luxury-text text-sm font-semibold text-gray-600">{stats.articles_caches || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.articles ? ((stats.articles_caches || 0) / stats.articles * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="luxury-text text-sm text-[#5C4033]">Indisponibles</span>
                      <span className="luxury-text text-sm font-semibold text-orange-600">{stats.articles_indisponibles || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.articles ? ((stats.articles_indisponibles || 0) / stats.articles * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphique des packs */}
              <div className="bg-white border-2 border-[#E8E0D5] rounded-xl p-6 shadow-sm">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Statut des Packs</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="luxury-text text-sm text-[#5C4033]">Actifs</span>
                      <span className="luxury-text text-sm font-semibold text-green-600">{stats.packs_actifs || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.packs_total ? ((stats.packs_actifs || 0) / stats.packs_total * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="luxury-text text-sm text-[#5C4033]">Inactifs</span>
                      <span className="luxury-text text-sm font-semibold text-gray-600">{stats.packs_inactifs || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.packs_total ? ((stats.packs_inactifs || 0) / stats.packs_total * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[#E8E0D5]">
                  <p className="luxury-text text-sm text-[#8B7355]">Total: <span className="font-semibold text-[#3D2817]">{stats.packs_total || 0}</span> packs</p>
                </div>
              </div>
            </div>

            {/* Carte CA Potentiel */}
            <div>
              <button
                onClick={() => setActiveTab('ca-potentiel')}
                className="w-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] border-2 border-[#D4AF37] p-8 hover:shadow-2xl transition-all cursor-pointer text-left rounded-xl group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-white/20 rounded-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="luxury-text text-sm text-white/90 uppercase tracking-wider font-medium">CA Potentiel</h3>
                    </div>
                    <p className="luxury-title text-5xl text-white font-light mb-2">
                      {articles
                        .filter((a: any) => a.disponible === 1)
                        .reduce((sum: number, a: any) => sum + (parseFloat(a.prix) || 0), 0)
                        .toLocaleString()} FCFA
                    </p>
                    <p className="luxury-text text-sm text-white/80 mb-1">Somme des prix des articles disponibles</p>
                    <p className="luxury-text text-xs text-white/70 mt-3 group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                      Voir le détail par type
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </div>
                  <div className="ml-6">
                    <div className="w-24 h-24 relative">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/20" />
                        <circle 
                          cx="40" cy="40" r="36" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          strokeDasharray="226"
                          className="text-white transition-all duration-500"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bouton de réinitialisation des statistiques */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="luxury-title text-lg text-[#3D2817]">Réinitialisation des Statistiques</h3>
                </div>
                <p className="luxury-text text-sm text-[#8B6F47] mb-4">
                  Réinitialise uniquement les visites, visiteurs et commandes à 0. Les articles, packs, livraison et contenus légaux ne seront pas affectés.
                </p>
                <button
                  onClick={async () => {
                    if (confirm('Êtes-vous sûr de vouloir réinitialiser les statistiques ? Cette action supprimera définitivement toutes les visites, visiteurs et commandes. Les articles, packs, livraison et contenus légaux ne seront pas affectés.')) {
                      try {
                        await reinitialiserStats(token!);
                        alert('Statistiques réinitialisées avec succès !');
                        loadData(token!);
                      } catch (err) {
                        alert('Erreur lors de la réinitialisation');
                        console.error(err);
                      }
                    }
                  }}
                  className="w-full luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                >
                  Réinitialiser les Statistiques
                </button>
              </div>

              {/* Actions rapides */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="luxury-title text-lg text-[#3D2817]">Actions Rapides</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      setShowArticleForm(true);
                      setActiveTab('articles');
                    }}
                    className="w-full text-left px-4 py-2 bg-white hover:bg-blue-100 rounded-lg transition-colors luxury-text text-sm text-[#3D2817]"
                  >
                    + Ajouter un article
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPack(null);
                      setPackType('boutique');
                      setShowPackForm(true);
                      setActiveTab('pac');
                    }}
                    className="w-full text-left px-4 py-2 bg-white hover:bg-blue-100 rounded-lg transition-colors luxury-text text-sm text-[#3D2817]"
                  >
                    + Créer un pack
                  </button>
                  <button
                    onClick={() => setActiveTab('visites')}
                    className="w-full text-left px-4 py-2 bg-white hover:bg-blue-100 rounded-lg transition-colors luxury-text text-sm text-[#3D2817]"
                  >
                    📊 Voir les statistiques
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des articles sur le dashboard */}
            <div className="bg-white border-2 border-[#E8E0D5] rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="luxury-title text-xl text-[#1A1A1A] font-light mb-1">Articles Récents</h2>
                  <p className="luxury-text text-sm text-[#8B7355]">Total: {articles.length} article(s)</p>
                </div>
                <button
                  onClick={() => setActiveTab('articles')}
                  className="flex items-center gap-2 px-4 py-2 luxury-text text-xs uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors font-medium rounded-lg"
                >
                  Voir tous
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {articles.length === 0 ? (
                <p className="luxury-text text-[#8B6F47] text-center py-8">Aucun article pour le moment</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <div key={article.id} className="bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl p-4 border border-[#E8E0D5] hover:shadow-lg transition-all duration-300">
                      {article.image_principale && (
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          <img 
                            src={article.image_principale?.startsWith('http') 
                              ? article.image_principale 
                              : article.image_principale ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${article.image_principale}` : ''}
                            alt={article.nom}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                            }}
                          />
                        </div>
                      )}
                      {!article.image_principale && (
                        <div className="relative w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Pas d'image</span>
                        </div>
                      )}
                      <h3 className="luxury-title text-lg text-[#3D2817] mb-2 line-clamp-2">{article.nom}</h3>
                      <p className="luxury-text text-[#B8860B] font-bold mb-2">{article.prix.toLocaleString()} FCFA</p>
                      <p className="luxury-text text-sm text-[#8B6F47] mb-3">{article.type_nom}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedArticle(article);
                            setShowArticleForm(true);
                            setActiveTab('articles');
                          }}
                          className="flex-1 bg-[#D4AF37] text-white py-2 px-3 rounded-lg hover:bg-[#B8860B] transition-all duration-300 text-xs font-medium"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Supprimer cet article ?')) {
                              try {
                                await deleteArticle(article.id, token!);
                                loadData(token!);
                              } catch (err) {
                                alert('Erreur');
                              }
                            }
                          }}
                          className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-all duration-300 text-xs font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Articles */}
        {activeTab === 'articles' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="luxury-title text-3xl text-[#3D2817]">Gestion des Articles</h2>
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  setShowArticleForm(true);
                }}
                className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                + Ajouter un article
              </button>
            </div>
            
            {/* Barre de recherche */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Rechercher par ID ou nom..."
                value={searchArticles}
                onChange={(e) => setSearchArticles(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text text-[#3D2817]"
              />
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-md">
                <h3 className="luxury-text text-sm font-semibold mb-2 text-blue-700">Total Articles</h3>
                <p className="luxury-title text-3xl font-bold text-blue-900">{stats.articles_total || articles.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-md">
                <h3 className="luxury-text text-sm font-semibold mb-2 text-green-700">Disponibles</h3>
                <p className="luxury-title text-3xl font-bold text-green-900">{stats.articles_disponibles || articles.filter((a: any) => a.disponible === 1).length}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-md">
                <h3 className="luxury-text text-sm font-semibold mb-2 text-gray-700">Cachés</h3>
                <p className="luxury-title text-3xl font-bold text-gray-900">{stats.articles_caches || articles.filter((a: any) => a.disponible === 0).length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-md">
                <h3 className="luxury-text text-sm font-semibold mb-2 text-orange-700">Indisponibles</h3>
                <p className="luxury-title text-3xl font-bold text-orange-900">{stats.articles_indisponibles || articles.filter((a: any) => a.indisponible === 1).length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-md">
                <h3 className="luxury-text text-sm font-semibold mb-2 text-purple-700">Affichés</h3>
                <p className="luxury-title text-3xl font-bold text-purple-900">{stats.articles_affiches || articles.filter((a: any) => a.disponible === 1 && !a.indisponible).length}</p>
              </div>
            </div>
            
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="luxury-text text-xl text-[#8B6F47] mb-4">Aucun article</p>
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    setShowArticleForm(true);
                  }}
                  className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md font-semibold"
                >
                  Ajouter le premier article
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#E8E0D5]">
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">ID</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Nom</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Prix</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Type</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Statut</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles
                      .filter((article) => {
                        if (!searchArticles) return true;
                        const search = searchArticles.toLowerCase();
                        return (
                          article.id.toString().includes(search) ||
                          article.nom.toLowerCase().includes(search)
                        );
                      })
                      .map((article) => (
                      <tr key={article.id} className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0] transition-colors">
                        <td className="p-4 luxury-text text-[#8B6F47] font-medium">#{article.id}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {article.image_principale && (
                              <img 
                                src={article.image_principale?.startsWith('http') 
                                  ? article.image_principale 
                                  : article.image_principale ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${article.image_principale}` : ''}
                                alt={article.nom}
                                className="w-16 h-16 object-cover rounded border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                            <span className="luxury-title text-[#3D2817]">{article.nom}</span>
                          </div>
                        </td>
                        <td className="p-4 luxury-text text-[#B8860B] font-semibold">{article.prix.toLocaleString()} FCFA</td>
                        <td className="p-4 luxury-text text-[#8B6F47]">{article.type_nom || 'N/A'}</td>
                        <td className="p-4">
                          {article.indisponible === 1 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Indisponible
                            </span>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              article.disponible 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {article.disponible ? 'Disponible' : 'Caché'}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedArticle(article);
                                setShowArticleForm(true);
                              }}
                              className="bg-[#D4AF37] text-white px-4 py-1.5 rounded-lg hover:bg-[#B8860B] transition-all duration-300 text-xs font-medium"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Êtes-vous sûr de supprimer cet article ?')) {
                                  try {
                                    await deleteArticle(article.id, token!);
                                    loadData(token!);
                                    alert('Article supprimé avec succès');
                                  } catch (err) {
                                    alert('Erreur lors de la suppression');
                                  }
                                }
                              }}
                              className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-all duration-300 text-xs font-medium"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={async () => {
                                if (article.disponible) {
                                  // Cacher l'article
                                  if (confirm('Voulez-vous cacher cet article ? Il ne sera plus visible sur le site.')) {
                                    try {
                                      await toggleDisponible(article.id, false, token!);
                                      loadData(token!);
                                      alert('Article caché avec succès');
                                    } catch (err) {
                                      alert('Erreur');
                                    }
                                  }
                                } else {
                                  // Réafficher l'article
                                  if (confirm('Voulez-vous réafficher cet article sur le site ?')) {
                                    try {
                                      await toggleDisponible(article.id, true, token!);
                                      loadData(token!);
                                      alert('Article réaffiché avec succès');
                                    } catch (err) {
                                      alert('Erreur');
                                    }
                                  }
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium ${
                                article.disponible
                                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                              title={article.disponible ? "Cacher l'article (ne sera plus visible)" : "Réafficher l'article sur le site"}
                            >
                              {article.disponible ? 'Cacher' : 'Afficher'}
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await toggleIndisponible(article.id, !article.indisponible, token!);
                                  loadData(token!);
                                  alert(`Badge "${!article.indisponible ? 'indisponible' : 'disponible'}" ${!article.indisponible ? 'ajouté' : 'retiré'}`);
                                } catch (err) {
                                  alert('Erreur');
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium ${
                                article.indisponible 
                                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                                  : 'bg-orange-400 text-white hover:bg-orange-500'
                              }`}
                              title="Ajouter/retirer le badge 'Indisponible' (l'article reste visible)"
                            >
                              {article.indisponible ? 'Badge Indisponible' : 'Badge Indisponible'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {showArticleForm && (
              <ArticleForm
                article={selectedArticle}
                onClose={() => {
                  setShowArticleForm(false);
                  setSelectedArticle(null);
                }}
                onSuccess={async () => {
                  await loadData(token!);
                  setShowArticleForm(false);
                  setSelectedArticle(null);
                  alert('Article enregistré avec succès !');
                }}
                token={token!}
                onSwitchToTypes={() => {
                  setShowArticleForm(false);
                  setActiveTab('types');
                  setShowTypeForm(true);
                }}
              />
            )}
          </div>
        )}

        {/* Types */}
        {activeTab === 'types' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <h2 className="luxury-title text-3xl text-[#3D2817] mb-6">Types d'Articles ({typesArticles.length})</h2>
            <div className="mb-6 flex space-x-3">
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateType();
                  }
                }}
                placeholder="Nom du nouveau type (ex: Pagne, Sac, Accessoire...)"
                className="flex-1 px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
              />
              <button
                onClick={handleCreateType}
                className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                + Ajouter
              </button>
            </div>
            
            {typesArticles.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
                <p className="luxury-text text-xl text-[#8B6F47] mb-4">Aucun type d'article</p>
                <p className="luxury-text text-sm text-[#8B6F47]">Ajoutez votre premier type d'article</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#E8E0D5]">
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">ID</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Nom</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Statut</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Créé le</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typesArticles.map((type) => (
                      <tr key={type.id} className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0] transition-colors">
                        <td className="p-4 luxury-text text-[#8B6F47]">#{type.id}</td>
                        <td className="p-4 luxury-title text-lg text-[#3D2817]">{type.nom}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            type.actif 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {type.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="p-4 luxury-text text-sm text-[#8B6F47]">
                          {new Date(type.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  await supprimerTypeArticle(type.id, token!);
                                  alert('Type supprimé avec succès');
                                  loadData(token!);
                                } catch (err: any) {
                                  alert(err.response?.data?.error || 'Erreur lors de la suppression');
                                }
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 text-xs font-medium"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  // Toggle actif/inactif
                                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                  const response = await fetch(`${apiUrl}/types-articles/${type.id}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                      nom: type.nom,
                                      actif: !type.actif,
                                      pac_autorise: type.pac_autorise || 1
                                    })
                                  });
                                  if (response.ok) {
                                    alert(`Type ${!type.actif ? 'activé' : 'désactivé'} avec succès`);
                                    loadData(token!);
                                  } else {
                                    alert('Erreur');
                                  }
                                } catch (err) {
                                  alert('Erreur');
                                }
                              }}
                              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 text-xs font-medium"
                            >
                              {type.actif ? 'Désactiver' : 'Activer'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PAC */}
        {activeTab === 'pac' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="luxury-title text-3xl text-[#3D2817]">Gestion des Packs</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedPack(null);
                      setShowPackForm(true);
                      setPackType('boutique');
                      setNewPack({ nom: '', description: '', nombre_articles: 2, prix: '', prix_original: '', articles_selectionnes: [] as Array<{ article_id: number; quantite: number }>, actif: false });
                    }}
                    className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    + Pack Boutique
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPack(null);
                      setSelectedPackVisiteur(null);
                      setShowPackVisiteursForm(true);
                      setPackType('clients');
                      // Réinitialiser la config si on crée un nouveau pack visiteur
                      setPackVisiteursConfig({
                        nom: '',
                        mode: 'articles' as 'articles' | 'type',
                        articles_ids: [],
                        type_id: null,
                        reduction: 5,
                        nombre_articles: 3,
                        actif: true
                      });
                    }}
                    className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    + Pack Visiteur
                  </button>
                </div>
              </div>
            </div>
            
            {/* Barre de recherche pour les packs */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Rechercher un pack par ID ou nom..."
                value={searchPacks}
                onChange={(e) => setSearchPacks(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text text-[#3D2817]"
              />
            </div>

            {/* Cartes de statistiques pour les packs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 shadow-md">
                <h3 className="luxury-text text-sm font-semibold mb-2 text-indigo-700">Total Packs</h3>
                <p className="luxury-title text-3xl font-bold text-indigo-900">{stats.packs_total !== undefined ? stats.packs_total : pacs.length}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200 shadow-md">
                <h3 className="luxury-text text-sm font-semibold mb-2 text-teal-700">Packs Actifs</h3>
                <p className="luxury-title text-3xl font-bold text-teal-900">{stats.packs_actifs !== undefined ? stats.packs_actifs : pacs.filter((p: any) => p.actif === 1).length}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 shadow-md">
                <h3 className="luxury-text text-sm font-semibold mb-2 text-slate-700">Packs Inactifs</h3>
                <p className="luxury-title text-3xl font-bold text-slate-900">{stats.packs_inactifs !== undefined ? stats.packs_inactifs : pacs.filter((p: any) => p.actif === 0).length}</p>
              </div>
            </div>

            {/* Formulaire pour créer/modifier un pack visiteur - Affiche seulement quand showPackVisiteursForm est true */}
            {showPackVisiteursForm && (
              <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="luxury-title text-xl text-[#3D2817]">
                    {selectedPackVisiteur ? 'Modifier le pack visiteur' : 'Créer un nouveau pack visiteur'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowPackVisiteursForm(false);
                      setSelectedPackVisiteur(null);
                      setPackType(null);
                      setPackVisiteursConfig({
                        nom: '',
                        mode: 'articles',
                        articles_ids: [],
                        type_id: null,
                        reduction: 5,
                        nombre_articles: 3,
                        actif: true
                      });
                    }}
                    className="text-[#8B6F47] hover:text-[#5C4033] luxury-text text-sm"
                  >
                    ✕ Fermer
                  </button>
                </div>
                
                <div className="mt-4 p-4 bg-white rounded-lg border border-green-200 space-y-4">
                  <div>
                    <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                      Nom du pack visiteur *
                    </label>
                    <input
                      type="text"
                      value={packVisiteursConfig.nom}
                      onChange={(e) => setPackVisiteursConfig({ ...packVisiteursConfig, nom: e.target.value })}
                      placeholder="Ex: Pack Fidélité - Bijoux"
                      className="w-full px-3 py-2 border-2 border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                        Nombre d'articles minimum *
                      </label>
                      <input
                        type="number"
                        value={packVisiteursConfig.nombre_articles || ''}
                        onChange={(e) => {
                          const valeur = e.target.value;
                          if (valeur === '' || (!isNaN(parseInt(valeur)) && parseInt(valeur) >= 2)) {
                            setPackVisiteursConfig({ ...packVisiteursConfig, nombre_articles: valeur === '' ? 0 : parseInt(valeur) });
                          }
                        }}
                        onBlur={(e) => {
                          const valeur = parseInt(e.target.value);
                          if (!valeur || valeur < 2) {
                            setPackVisiteursConfig({ ...packVisiteursConfig, nombre_articles: 2 });
                          }
                        }}
                        min="2"
                        className="w-full px-3 py-2 border-2 border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                        Pourcentage de réduction (%) *
                      </label>
                      <input
                        type="number"
                        value={packVisiteursConfig.reduction || ''}
                        onChange={(e) => {
                          const valeur = e.target.value;
                          if (valeur === '' || (!isNaN(parseInt(valeur)) && parseInt(valeur) >= 0 && parseInt(valeur) <= 100)) {
                            setPackVisiteursConfig({ ...packVisiteursConfig, reduction: valeur === '' ? 0 : parseInt(valeur) });
                          }
                        }}
                        onBlur={(e) => {
                          const valeur = parseInt(e.target.value);
                          if (!valeur || valeur < 0) {
                            setPackVisiteursConfig({ ...packVisiteursConfig, reduction: 5 });
                          }
                        }}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border-2 border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                      Mode de sélection des articles éligibles *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="packVisiteursMode"
                          value="articles"
                          checked={packVisiteursConfig.mode === 'articles'}
                          onChange={() => setPackVisiteursConfig({ ...packVisiteursConfig, mode: 'articles', type_id: null })}
                          className="w-4 h-4 text-[#D4AF37] border-[#D4A574] focus:ring-[#D4AF37]"
                        />
                        <span className="luxury-text text-[#5C4033]">Articles spécifiques</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="packVisiteursMode"
                          value="type"
                          checked={packVisiteursConfig.mode === 'type'}
                          onChange={() => setPackVisiteursConfig({ ...packVisiteursConfig, mode: 'type', articles_ids: [] })}
                          className="w-4 h-4 text-[#D4AF37] border-[#D4A574] focus:ring-[#D4AF37]"
                        />
                        <span className="luxury-text text-[#5C4033]">Tous les articles d'un type</span>
                      </label>
                    </div>
                  </div>

                  {packVisiteursConfig.mode === 'articles' ? (
                    <div>
                      <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                        Sélectionner les articles éligibles *
                      </label>
                      <div className="max-h-60 overflow-y-auto border-2 border-[#D4A574] rounded-lg p-4 bg-white">
                        {articles.filter((a: any) => a.disponible === 1 && a.indisponible !== 1).map((article: any) => (
                          <label key={article.id} className="flex items-center space-x-2 mb-2 p-2 hover:bg-[#F5F1EB] rounded">
                            <input
                              type="checkbox"
                              checked={packVisiteursConfig.articles_ids.includes(article.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPackVisiteursConfig({
                                    ...packVisiteursConfig,
                                    articles_ids: [...packVisiteursConfig.articles_ids, article.id]
                                  });
                                } else {
                                  setPackVisiteursConfig({
                                    ...packVisiteursConfig,
                                    articles_ids: packVisiteursConfig.articles_ids.filter((id: number) => id !== article.id)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                            />
                            <span className="luxury-text text-sm text-[#5C4033]">{article.nom} - {article.prix.toLocaleString()} FCFA</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                        Sélectionner le type d'articles éligible *
                      </label>
                      <select
                        value={packVisiteursConfig.type_id || ''}
                        onChange={(e) => setPackVisiteursConfig({ ...packVisiteursConfig, type_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 border-2 border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                      >
                        <option value="">Sélectionner un type</option>
                        {typesArticles.filter((t: any) => t.actif === 1).map((type: any) => (
                          <option key={type.id} value={type.id}>{type.nom}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pack-visiteur-actif"
                      checked={packVisiteursConfig.actif}
                      onChange={(e) => setPackVisiteursConfig({ ...packVisiteursConfig, actif: e.target.checked })}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <label htmlFor="pack-visiteur-actif" className="ml-2 luxury-text text-[#5C4033]">
                      Activer ce pack visiteur (visible pour les clients)
                    </label>
                  </div>

                  <button
                    onClick={async () => {
                      if (!packVisiteursConfig.nom || !packVisiteursConfig.nom.trim()) {
                        alert('Veuillez saisir un nom pour le pack');
                        return;
                      }
                      if (!packVisiteursConfig.nombre_articles || packVisiteursConfig.nombre_articles < 2) {
                        alert('Le nombre minimum d\'articles doit être d\'au moins 2');
                        return;
                      }
                      if (packVisiteursConfig.reduction === undefined || packVisiteursConfig.reduction < 0 || packVisiteursConfig.reduction > 100) {
                        alert('Le pourcentage de réduction doit être entre 0 et 100');
                        return;
                      }
                      if (packVisiteursConfig.mode === 'articles' && packVisiteursConfig.articles_ids.length === 0) {
                        alert('Veuillez sélectionner au moins un article éligible');
                        return;
                      }
                      if (packVisiteursConfig.mode === 'type' && !packVisiteursConfig.type_id) {
                        alert('Veuillez sélectionner un type d\'articles éligible');
                        return;
                      }
                      
                      try {
                        if (selectedPackVisiteur) {
                          await updatePackVisiteur(selectedPackVisiteur.id, packVisiteursConfig, token!);
                          alert('Pack visiteur modifié avec succès !');
                        } else {
                          await creerPackVisiteur(packVisiteursConfig, token!);
                          alert('Pack visiteur créé avec succès !');
                        }
                        
                        setShowPackVisiteursForm(false);
                        setSelectedPackVisiteur(null);
                        setPackType(null);
                        setPackVisiteursConfig({
                          nom: '',
                          mode: 'articles',
                          articles_ids: [],
                          type_id: null,
                          reduction: 5,
                          nombre_articles: 3,
                          actif: true
                        });
                        loadData(token!);
                      } catch (err: any) {
                        alert(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
                      }
                    }}
                    className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-6 py-2 rounded-lg hover:from-[#059669] hover:to-[#047857] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    {selectedPackVisiteur ? 'Modifier le pack' : 'Créer le pack'}
                  </button>
                </div>
              </div>
            )}

            {showPackForm && packType === 'boutique' && (
              <div className="mb-6 p-6 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="luxury-title text-xl text-[#3D2817]">Créer un pack par la boutique</h3>
                  <button
                    onClick={() => {
                      setShowPackForm(false);
                      setPackType(null);
                      setSelectedPack(null);
                      setNewPack({ nom: '', description: '', nombre_articles: 2, prix: '', prix_original: '', articles_selectionnes: [] as Array<{ article_id: number; quantite: number }>, actif: false });
                    }}
                    className="text-[#8B6F47] hover:text-[#5C4033]"
                  >
                    ✕ Fermer
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 luxury-text text-[#5C4033]">Nom du pack *</label>
                    <input
                      type="text"
                      value={newPack.nom}
                      onChange={(e) => setNewPack({ ...newPack, nom: e.target.value })}
                      placeholder="Ex: Pack Femme Bonne Fête"
                      className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 luxury-text text-[#5C4033]">Description</label>
                    <textarea
                      value={newPack.description}
                      onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                      placeholder="Description du pack..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 luxury-text text-[#5C4033]">Nombre d'articles pour former le pack * (minimum 2)</label>
                    <input
                      type="number"
                      value={newPack.nombre_articles || ''}
                      onChange={(e) => {
                        const valeur = e.target.value;
                        // Permettre de vider complètement le champ
                        if (valeur === '' || (!isNaN(parseInt(valeur)) && parseInt(valeur) >= 2)) {
                          const num = valeur === '' ? 0 : parseInt(valeur);
                          setNewPack({ ...newPack, nombre_articles: num });
                        }
                      }}
                      onBlur={(e) => {
                        const valeur = parseInt(e.target.value);
                        if (!valeur || valeur < 2) {
                          setNewPack({ ...newPack, nombre_articles: 2 });
                        }
                      }}
                      min="2"
                      className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[#8B6F47] mb-2 font-normal">
                      💡 Un pack peut contenir plusieurs types d'articles différents (ex: Sacs + Pagnes + Accessoires). 
                      Le pack s'affichera dans toutes les catégories correspondantes.
                    </p>
                  </div>
                  {newPack.nombre_articles >= 2 && (
                    <div>
                      <label className="block mb-2 luxury-text text-[#5C4033]">
                        Sélectionner les articles pour le pack (total: {newPack.nombre_articles} articles minimum) *
                        <span className="block text-xs text-[#8B6F47] mt-1 font-normal">
                          💡 Vous pouvez ajouter plusieurs fois le même article (ex: 5 pagnes X + 1 pagne Y)
                        </span>
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto p-3 bg-white rounded-lg border border-[#E8E0D5]">
                        {/* Afficher tous les articles disponibles, sans filtre par type */}
                        {articles.filter((a: any) => a.disponible).map((article: any) => {
                          const selectedItem = newPack.articles_selectionnes.find((item: any) => item.article_id === article.id);
                          const quantite = selectedItem ? selectedItem.quantite : 0;
                          // Calculer le total une seule fois en dehors du map pour éviter les recalculs
                          // (sera calculé dans le composant parent)
                          
                          return (
                            <div key={article.id} className="flex items-center justify-between p-2 hover:bg-[#FAF7F0] rounded border border-[#E8E0D5]">
                              <div className="flex-1">
                                <span className="luxury-text text-sm text-[#3D2817] font-medium">{article.nom}</span>
                                <span className="luxury-text text-xs text-[#8B6F47] block">{article.prix.toLocaleString()} FCFA / unité</span>
                                {quantite > 0 && (
                                  <span className="luxury-text text-xs text-green-600 font-semibold">
                                    Sélectionné: {quantite} × {article.prix.toLocaleString()} = {(article.prix * quantite).toLocaleString()} FCFA
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (quantite > 0) {
                                      const newSelection = quantite === 1
                                        ? newPack.articles_selectionnes.filter((item: any) => item.article_id !== article.id)
                                        : newPack.articles_selectionnes.map((item: any) => 
                                            item.article_id === article.id ? { ...item, quantite: item.quantite - 1 } : item
                                          );
                                      setNewPack({ ...newPack, articles_selectionnes: newSelection });
                                    }
                                  }}
                                  disabled={quantite === 0}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#3D2817] font-bold"
                                >
                                  -
                                </button>
                                <span className="luxury-text text-sm text-[#3D2817] w-10 text-center font-semibold">{quantite}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Permettre d'ajouter autant qu'on veut (même si on a déjà atteint le minimum)
                                      if (quantite === 0) {
                                        setNewPack({ 
                                          ...newPack, 
                                          articles_selectionnes: [...newPack.articles_selectionnes, { article_id: article.id, quantite: 1 }] 
                                        });
                                      } else {
                                        setNewPack({ 
                                          ...newPack, 
                                          articles_selectionnes: newPack.articles_selectionnes.map((item: any) => 
                                            item.article_id === article.id ? { ...item, quantite: item.quantite + 1 } : item
                                          )
                                        });
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {(() => {
                        // Calculer le total en s'assurant que chaque quantité est bien comptée
                        const totalArticles = newPack.articles_selectionnes.reduce((sum: number, item: any) => {
                          const quantite = item.quantite || 1; // S'assurer qu'on a toujours une valeur
                          return sum + quantite;
                        }, 0);
                        return (
                          <p className={`mt-2 luxury-text text-sm font-semibold ${totalArticles >= newPack.nombre_articles ? 'text-green-600' : 'text-[#8B6F47]'}`}>
                            Total: {totalArticles} / {newPack.nombre_articles} article(s) sélectionné(s)
                            {totalArticles < newPack.nombre_articles && ` (il faut encore ${newPack.nombre_articles - totalArticles} article(s))`}
                          </p>
                        );
                      })()}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 luxury-text text-[#5C4033]">Prix original (FCFA) *</label>
                      <input
                        type="number"
                        value={newPack.prix_original || ''}
                        onChange={(e) => {
                          const valeur = e.target.value;
                          // Permettre de vider complètement le champ
                          if (valeur === '' || (!isNaN(parseFloat(valeur)) && parseFloat(valeur) >= 0)) {
                            setNewPack({ ...newPack, prix_original: valeur });
                          }
                        }}
                        placeholder="7500"
                        min="0"
                        className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
                      />
                      <p className="text-xs text-gray-500 mt-1">Somme des prix des articles (sera barré)</p>
                    </div>
                    <div>
                      <label className="block mb-2 luxury-text text-[#5C4033]">Prix du pack (FCFA) *</label>
                      <input
                        type="number"
                        value={newPack.prix || ''}
                        onChange={(e) => {
                          const valeur = e.target.value;
                          // Permettre de vider complètement le champ
                          if (valeur === '' || (!isNaN(parseFloat(valeur)) && parseFloat(valeur) >= 0)) {
                            setNewPack({ ...newPack, prix: valeur });
                          }
                        }}
                        placeholder="6000"
                        min="0"
                        className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
                      />
                      <p className="text-xs text-gray-500 mt-1">Prix final de vente du pack</p>
                    </div>
                  </div>
                  {newPack.articles_selectionnes.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="luxury-text text-sm text-[#5C4033]">
                        <strong>Total des articles sélectionnés:</strong> {
                          newPack.articles_selectionnes.reduce((sum: number, item: any) => {
                            const article = articles.find((a: any) => a.id === item.article_id);
                            return sum + (article ? article.prix * item.quantite : 0);
                          }, 0).toLocaleString()
                        } FCFA
                        {!newPack.prix_original && (
                          <button
                            type="button"
                            onClick={() => {
                              const total = newPack.articles_selectionnes.reduce((sum: number, item: any) => {
                                const article = articles.find((a: any) => a.id === item.article_id);
                                return sum + (article ? article.prix * item.quantite : 0);
                              }, 0);
                              setNewPack({ ...newPack, prix_original: total.toString() });
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                          >
                            Utiliser ce total comme prix original
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pack-actif"
                      checked={newPack.actif}
                      onChange={(e) => setNewPack({ ...newPack, actif: e.target.checked })}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <label htmlFor="pack-actif" className="ml-2 luxury-text text-[#5C4033]">
                      Activer ce pack (visible pour les clients)
                    </label>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        // Validation améliorée
                        if (!newPack.nom || newPack.nom.trim() === '') {
                          alert('Veuillez saisir un nom pour le pack');
                          return;
                        }
                        if (!newPack.prix || isNaN(parseFloat(newPack.prix)) || parseFloat(newPack.prix) <= 0) {
                          alert('Veuillez saisir un prix valide pour le pack');
                          return;
                        }
                        if (!newPack.articles_selectionnes || newPack.articles_selectionnes.length === 0) {
                          alert('Veuillez sélectionner au moins un article');
                          return;
                        }
                        
                        // Calculer le total en comptant les quantités de chaque article
                        // IMPORTANT: Chaque clic sur "+" doit compter comme 1 article, même pour le même article
                        // Exemple: 2 pagnes X + 1 pagne Y = 3 articles total
                        const totalArticles = newPack.articles_selectionnes.reduce((sum: number, item: any) => {
                          const quantite = item.quantite || 1; // S'assurer qu'on a toujours une valeur
                          return sum + quantite;
                        }, 0);
                        
                        // Vérifier que le total est au moins égal au nombre d'articles requis
                        if (totalArticles < newPack.nombre_articles) {
                          alert(`Le pack doit contenir au moins ${newPack.nombre_articles} articles au total (vous en avez ${totalArticles}).\n\nRappel: Chaque clic sur "+" compte comme 1 article. Exemple: 2 pagnes X + 1 pagne Y = 3 articles total.`);
                          return;
                        }
                        
                        // Vérifier qu'il y a au moins 2 articles au total
                        if (totalArticles < 2) {
                          alert('Le pack doit contenir au moins 2 articles au total (en comptant les quantités).');
                          return;
                        }
                        
                        try {
                          // Construire le tableau d'articles avec quantités (regrouper les articles identiques)
                          const articlesMap: { [key: number]: number } = {}; // article_id -> quantite totale
                          let prixOriginalCalculé = 0;
                          
                          // Regrouper les articles identiques (au cas où il y aurait des doublons)
                          // Normalement, chaque article_id ne devrait apparaître qu'une fois avec sa quantité totale
                          newPack.articles_selectionnes.forEach((item: any) => {
                            const articleId = item.article_id;
                              const quantite = item.quantite || 1;
                            
                            // Si l'article existe déjà, additionner les quantités (au cas où il y aurait des doublons)
                            if (articlesMap[articleId]) {
                              articlesMap[articleId] += quantite;
                            } else {
                              articlesMap[articleId] = quantite;
                            }
                          });
                          
                          // Vérifier le total après regroupement
                          const totalApresRegroupement = Object.values(articlesMap).reduce((sum: number, qty: any) => sum + qty, 0);
                          // Log de débogage (commenté pour production)
                          // console.log(`Total après regroupement: ${totalApresRegroupement}, requis: ${newPack.nombre_articles}`);
                          
                          // Construire le tableau final avec articles regroupés
                          const articlesPack: any[] = [];
                          Object.keys(articlesMap).forEach((articleIdStr) => {
                            const articleId = parseInt(articleIdStr);
                            const quantite = articlesMap[articleId];
                            const article = articles.find((a: any) => a.id === articleId);
                            
                            if (article) {
                              // Calculer le prix original
                              prixOriginalCalculé += article.prix * quantite;
                              // Ajouter l'article avec sa quantité totale
                              articlesPack.push({
                                article_id: articleId,
                                quantite: quantite
                              });
                            }
                          });
                          
                          if (articlesPack.length === 0) {
                            alert('Aucun article valide sélectionné');
                            return;
                          }
                          
                          // S'assurer que nombre_articles est défini et valide
                          const nombreArticlesFinal = newPack.nombre_articles && newPack.nombre_articles >= 2 
                            ? newPack.nombre_articles 
                            : 2;
                          
                          const packData = {
                            nom: newPack.nom.trim(),
                            description: newPack.description || '',
                            type_id: null, // Plus de type_id unique, le pack peut contenir plusieurs types
                            nombre_articles: nombreArticlesFinal, // Le nombre requis défini par l'utilisateur (ex: 5)
                            prix: parseFloat(newPack.prix),
                            prix_original: newPack.prix_original ? parseFloat(newPack.prix_original) : prixOriginalCalculé,
                            articles: articlesPack, // Les articles avec leurs quantités (ex: [{article_id: A, quantite: 3}, {article_id: B, quantite: 2}])
                            actif: newPack.actif ? 1 : 0,
                            created_by: 'boutique'
                          };
                          
                          if (selectedPack) {
                            // Modifier
                            await updatePAC(selectedPack.id, packData, token!);
                            alert('Pack modifié avec succès');
                          } else {
                            // Créer
                            await creerPAC(packData, token!);
                            alert('Pack créé avec succès');
                          }
                          
                          setShowPackForm(false);
                          setPackType(null);
                          setSelectedPack(null);
                          setNewPack({ nom: '', description: '', nombre_articles: 2, prix: '', prix_original: '', articles_selectionnes: [] as Array<{ article_id: number; quantite: number }>, actif: false });
                          loadData(token!);
                        } catch (err: any) {
                          console.error('Erreur:', err);
                          alert(err.response?.data?.error || 'Erreur lors de l\'enregistrement du pack');
                        }
                      }}
                      className="flex-1 luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md font-semibold"
                    >
                      {selectedPack ? 'Modifier le pack' : 'Créer le pack'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPackForm(false);
                        setPackType(null);
                        setSelectedPack(null);
                        setNewPack({ nom: '', description: '', nombre_articles: 2, prix: '', prix_original: '', articles_selectionnes: [] as Array<{ article_id: number; quantite: number }>, actif: false });
                      }}
                      className="px-6 py-3 border-2 border-[#D4A574]/40 rounded-lg hover:bg-[#FAF7F0] transition-all luxury-text text-[#5C4033]"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tableau unifié pour tous les packs (boutique + visiteurs) */}
            {pacs.length === 0 && packVisiteurs.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
                <p className="luxury-text text-xl text-[#8B6F47] mb-4">Aucun pack créé</p>
                <p className="luxury-text text-sm text-[#8B6F47]">Créez votre premier pack</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#E8E0D5]">
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">ID</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Type</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Nom</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Détails</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Prix/Réduction</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Statut</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Packs Boutique */}
                    {pacs
                      .filter((pac: any) => {
                        if (!searchPacks) return true;
                        const search = searchPacks.toLowerCase();
                        return (
                          pac.id.toString().includes(search) ||
                          pac.nom.toLowerCase().includes(search) ||
                          'boutique'.includes(search)
                        );
                      })
                      .map((pac: any) => (
                      <tr key={`boutique-${pac.id}`} className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0] transition-colors">
                        <td className="p-4 luxury-text text-[#8B6F47]">#{pac.id}</td>
                        <td className="p-4">
                          <span className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                            Pack Boutique
                          </span>
                        </td>
                        <td className="p-4 luxury-title text-lg text-[#3D2817]">{pac.nom}</td>
                        <td className="p-4 luxury-text text-[#8B6F47]">
                          {pac.nombre_articles || ((pac.articles || []).length)} article(s)
                        </td>
                        <td className="p-4 luxury-text text-[#3D2817] font-semibold">
                          {pac.prix_original && pac.prix_original > pac.prix ? (
                            <div>
                              <span className="line-through text-gray-400 text-sm mr-2">{pac.prix_original} FCFA</span>
                              <span>{pac.prix} FCFA</span>
                            </div>
                          ) : (
                            <span>{pac.prix} FCFA</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            pac.actif 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {pac.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  await togglePACActif(pac.id, !pac.actif, token!);
                                  loadData(token!);
                                  alert(`Pack ${!pac.actif ? 'activé' : 'désactivé'} avec succès`);
                                } catch (err) {
                                  alert('Erreur');
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium ${
                                pac.actif
                                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              {pac.actif ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPack(pac);
                                setPackType('boutique');
                                const articlesList = pac.articles || [];
                                const articlesWithQuantite: Array<{ article_id: number; quantite: number }> = [];
                                
                                // Les articles peuvent déjà avoir des quantités ou être un tableau simple
                                articlesList.forEach((article: any) => {
                                  if (article.article_id && article.quantite) {
                                    // Format avec article_id et quantite (nouveau format)
                                    articlesWithQuantite.push({
                                      article_id: article.article_id,
                                      quantite: article.quantite
                                    });
                                  } else if (article.id) {
                                    // Format simple avec juste l'ID (ancien format) - compter les occurrences
                                    const existing = articlesWithQuantite.find(item => item.article_id === article.id);
                                    if (existing) {
                                      existing.quantite += 1;
                                    } else {
                                  articlesWithQuantite.push({
                                        article_id: article.id,
                                        quantite: 1
                                  });
                                    }
                                  }
                                });
                                
                                setSelectedPack(pac);
                             setPackType('boutique');
                            setNewPack({
                            nom: pac.nom || '',
                            description: pac.description || '',
                            type_id: pac.type_id ? String(pac.type_id) : '',  // ça passe maintenant
                            nombre_articles: pac.nombre_articles || 2,
                             prix: String(pac.prix || ''),
                            prix_original: pac.prix_original ? String(pac.prix_original) : '',
    articles_selectionnes: articlesWithQuantite,
  actif: pac.actif === 1
});
setShowPackForm(true);
setShowPackVisiteursForm(false);
setSelectedPackVisiteur(null);

                              }}
                              className="bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-all duration-300 text-xs font-medium"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) {
                                  try {
                                    await deletePAC(pac.id, token!);
                                    alert('Pack supprimé avec succès');
                                    loadData(token!);
                                  } catch (err) {
                                    alert('Erreur');
                                  }
                                }
                              }}
                              className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-all duration-300 text-xs font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Packs Visiteurs */}
                    {packVisiteurs
                      .filter((pack: any) => {
                        if (!searchPacks) return true;
                        const search = searchPacks.toLowerCase();
                        return (
                          pack.id.toString().includes(search) ||
                          pack.nom.toLowerCase().includes(search) ||
                          'visiteur'.includes(search)
                        );
                      })
                      .map((pack: any) => (
                      <tr key={`visiteur-${pack.id}`} className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0] transition-colors">
                        <td className="p-4 luxury-text text-[#8B6F47]">#{pack.id}</td>
                        <td className="p-4">
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                            Pack Visiteur
                          </span>
                        </td>
                        <td className="p-4 luxury-title text-lg text-[#3D2817]">{pack.nom}</td>
                        <td className="p-4 luxury-text text-[#8B6F47]">
                          {pack.mode === 'articles' 
                            ? `${pack.articles_ids?.length || 0} article(s) spécifique(s)` 
                            : typesArticles.find((t: any) => t.id === pack.type_id)?.nom || 'Type N/A'}
                          <br />
                          <span className="text-xs">Min: {pack.nombre_articles} article(s)</span>
                        </td>
                        <td className="p-4 luxury-text text-[#3D2817] font-semibold">
                          Réduction: {pack.reduction}%
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            pack.actif 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {pack.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  await togglePackVisiteurActif(pack.id, !pack.actif, token!);
                                  loadData(token!);
                                  alert(`Pack ${!pack.actif ? 'activé' : 'désactivé'} avec succès`);
                                } catch (err) {
                                  alert('Erreur');
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium ${
                                pack.actif
                                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              {pack.actif ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPackVisiteur(pack);
                                setPackVisiteursConfig({
                                  nom: pack.nom,
                                  mode: pack.mode,
                                  articles_ids: pack.articles_ids || [],
                                  type_id: pack.type_id,
                                  reduction: pack.reduction,
                                  nombre_articles: pack.nombre_articles,
                                  actif: pack.actif === 1
                                });
                                setShowPackVisiteursForm(true);
                                setShowPackForm(false);
                                setSelectedPack(null);
                                setPackType('clients');
                              }}
                              className="bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-all duration-300 text-xs font-medium"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Êtes-vous sûr de vouloir supprimer ce pack visiteur ?')) {
                                  try {
                                    await deletePackVisiteur(pack.id, token!);
                                    alert('Pack visiteur supprimé avec succès');
                                    loadData(token!);
                                  } catch (err: any) {
                                    alert(err.response?.data?.error || 'Erreur');
                                  }
                                }
                              }}
                              className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-all duration-300 text-xs font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Commandes */}
        {activeTab === 'commandes' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <h2 className="luxury-title text-2xl sm:text-3xl text-[#3D2817] mb-4 sm:mb-6">Commandes ({commandes.length})</h2>
            
            {/* Filtres */}
            <div className="mb-6 p-6 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
              <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Filtres</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-2 luxury-text text-[#5C4033] text-sm">Période</label>
                  <select
                    value={filtreCommandes.periode}
                    onChange={(e) => setFiltreCommandes({ ...filtreCommandes, periode: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text bg-white"
                  >
                    <option value="semaine">Cette semaine (7 jours)</option>
                    <option value="aujourdhui">Aujourd'hui</option>
                    <option value="mois">Ce mois (30 jours)</option>
                    <option value="all">Tous</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 luxury-text text-[#5C4033] text-sm">Lieu de livraison</label>
                  <input
                    type="text"
                    value={filtreCommandes.lieu}
                    onChange={(e) => setFiltreCommandes({ ...filtreCommandes, lieu: e.target.value })}
                    placeholder="Rechercher par lieu..."
                    className="w-full px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 luxury-text text-[#5C4033] text-sm">Contact (Téléphone/WhatsApp)</label>
                  <input
                    type="text"
                    value={filtreCommandes.contact}
                    onChange={(e) => setFiltreCommandes({ ...filtreCommandes, contact: e.target.value })}
                    placeholder="Rechercher par contact..."
                    className="w-full px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text bg-white"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  // Filtrer les commandes localement
                  // Note: Pour un filtrage serveur, il faudrait modifier l'API
                  loadData(token!);
                }}
                className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-2 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md font-semibold"
              >
                Appliquer les filtres
              </button>
            </div>
            
            {commandes.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
                <p className="luxury-text text-xl text-[#8B6F47]">Aucune commande</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#E8E0D5]">
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">ID</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Nom complet</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Téléphone</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Lieu de livraison</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Total</th>
                      <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Date et Heure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commandes
                      .filter((commande: any) => {
                        if (filtreCommandes.lieu) {
                          const lieu = (commande.lieu_livraison || commande.commune || commande.adresse_precise || '').toLowerCase();
                          if (!lieu.includes(filtreCommandes.lieu.toLowerCase())) return false;
                        }
                        if (filtreCommandes.contact) {
                          const contact = ((commande.telephone || '') + (commande.whatsapp || '')).toLowerCase();
                          if (!contact.includes(filtreCommandes.contact.toLowerCase())) return false;
                        }
                        return true;
                      })
                      .map((commande: any) => {
                        const dateCommande = new Date(commande.created_at);
                        const dateStr = dateCommande.toLocaleDateString('fr-FR');
                        const heureStr = dateCommande.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <tr 
                            key={commande.id} 
                            className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                            onClick={() => {
                              const articles = JSON.parse(commande.articles || '[]');
                              alert(`Détails de la commande #${commande.id}:\n\nNom: ${commande.prenom} ${commande.nom}\nTéléphone: ${commande.telephone || 'N/A'}\nWhatsApp: ${commande.whatsapp || 'N/A'}\nLieu: ${commande.lieu_livraison || commande.commune || commande.adresse_precise || 'N/A'}\nTotal: ${commande.total} FCFA\nDate: ${dateStr}\nHeure: ${heureStr}\nArticles: ${articles.length} article(s)`);
                            }}
                          >
                            <td className="p-4 luxury-text text-[#8B6F47]">#{commande.id}</td>
                            <td className="p-4">
                              <div className="luxury-title text-[#3D2817]">
                                {commande.prenom} {commande.nom}
                              </div>
                            </td>
                            <td className="p-4 luxury-text text-[#8B6F47]">
                              {commande.telephone || commande.whatsapp || 'N/A'}
                            </td>
                            <td className="p-4 luxury-text text-[#8B6F47]">
                              {commande.lieu_livraison || commande.commune || commande.adresse_precise || 'N/A'}
                            </td>
                            <td className="p-4 luxury-text text-[#3D2817] font-semibold">{commande.total} FCFA</td>
                            <td className="p-4 luxury-text text-[#8B6F47]">
                              <div>{dateStr}</div>
                              <div className="text-xs">{heureStr}</div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CA Potentiel */}
        {activeTab === 'ca-potentiel' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <h2 className="luxury-title text-3xl text-[#3D2817] mb-6">CA Potentiel</h2>
            
            {/* CA Total */}
            <div className="mb-8 p-6 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl border-2 border-[#D4AF37]">
              <h3 className="luxury-text text-sm text-white/90 uppercase tracking-wider mb-2 font-medium">CA Total Potentiel</h3>
              <p className="luxury-title text-5xl text-white font-light">
                {articles
                  .filter((a: any) => a.disponible === 1)
                  .reduce((sum: number, a: any) => sum + (parseFloat(a.prix) || 0), 0)
                  .toLocaleString()} FCFA
              </p>
              <p className="luxury-text text-sm text-white/80 mt-2">Somme des prix de tous les articles disponibles</p>
            </div>
            
            {/* CA par Type */}
            <div className="mb-8">
              <h3 className="luxury-title text-2xl text-[#3D2817] mb-4">CA par Type d'Article</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typesArticles.map((type: any) => {
                  const articlesDuType = articles.filter((a: any) => a.type_id === type.id && a.disponible === 1);
                  const caType = articlesDuType.reduce((sum: number, a: any) => sum + (parseFloat(a.prix) || 0), 0);
                  return (
                    <div key={type.id} className="bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] p-6 rounded-xl border border-[#E8E0D5]">
                      <h4 className="luxury-title text-lg text-[#3D2817] mb-2">{type.nom}</h4>
                      <p className="luxury-text text-2xl text-[#D4AF37] font-semibold mb-1">{caType.toLocaleString()} FCFA</p>
                      <p className="luxury-text text-sm text-[#8B6F47]">{articlesDuType.length} article(s) disponible(s)</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* CA des Packs */}
            <div>
              <h3 className="luxury-title text-2xl text-[#3D2817] mb-4">CA des Packs</h3>
              <div className="bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] p-6 rounded-xl border border-[#E8E0D5]">
                <p className="luxury-text text-xl text-[#3D2817] mb-2">Total CA des Packs</p>
                <p className="luxury-title text-3xl text-[#D4AF37] font-semibold mb-2">
                  {pacs
                    .filter((p: any) => p.actif === 1)
                    .reduce((sum: number, p: any) => sum + (parseFloat(p.prix) || 0), 0)
                    .toLocaleString()} FCFA
                </p>
                <p className="luxury-text text-sm text-[#8B6F47]">
                  {pacs.filter((p: any) => p.actif === 1).length} pack(s) actif(s)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visites */}
        {activeTab === 'visites' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="luxury-title text-3xl text-[#3D2817]">Visites ({visiteurs.length})</h2>
            </div>
            
            {/* Filtres */}
            <div className="mb-6 p-6 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
              <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Filtres</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block mb-2 luxury-text text-[#5C4033] text-sm">Période</label>
                  <select
                    value={filtreVisiteurs.periode}
                    onChange={(e) => {
                      const newFiltre = { ...filtreVisiteurs, periode: e.target.value };
                      setFiltreVisiteurs(newFiltre);
                      if (token) {
                        getVisiteurs(token, newFiltre).then(res => setVisiteurs(res.data)).catch(console.error);
                      }
                    }}
                    className="w-full px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text bg-white"
                  >
                    <option value="semaine">Cette semaine (7 jours)</option>
                    <option value="aujourdhui">Aujourd'hui</option>
                    <option value="mois">Ce mois (30 jours)</option>
                    <option value="custom">Période personnalisée</option>
                    <option value="all">Tous</option>
                  </select>
                </div>
                
                {filtreVisiteurs.periode === 'custom' && (
                  <>
                    <div>
                      <label className="block mb-2 luxury-text text-[#5C4033] text-sm">Date début</label>
                      <input
                        type="date"
                        value={filtreVisiteurs.date_debut}
                        onChange={(e) => setFiltreVisiteurs({ ...filtreVisiteurs, date_debut: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text bg-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 luxury-text text-[#5C4033] text-sm">Date fin</label>
                      <input
                        type="date"
                        value={filtreVisiteurs.date_fin}
                        onChange={(e) => setFiltreVisiteurs({ ...filtreVisiteurs, date_fin: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text bg-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 luxury-text text-[#5C4033] text-sm">&nbsp;</label>
                      <button
                        onClick={() => {
                          if (token) {
                            getVisiteurs(token, { periode: 'custom', date_debut: filtreVisiteurs.date_debut, date_fin: filtreVisiteurs.date_fin }).then(res => setVisiteurs(res.data)).catch(console.error);
                          }
                        }}
                        className="w-full luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-4 py-2 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md font-semibold"
                      >
                        Appliquer
                      </button>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block mb-2 luxury-text text-[#5C4033] text-sm">Filtrer par heure (optionnel)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={filtreVisiteurs.heure}
                    onChange={(e) => setFiltreVisiteurs({ ...filtreVisiteurs, heure: e.target.value })}
                    placeholder="0-23"
                    className="w-full px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text bg-white"
                  />
                </div>
                
                {filtreVisiteurs.periode !== 'custom' && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        if (token) {
                          getVisiteurs(token, filtreVisiteurs).then(res => setVisiteurs(res.data)).catch(console.error);
                        }
                      }}
                      className="w-full luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-4 py-2 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md font-semibold"
                    >
                      Appliquer
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#E8E0D5]">
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Nom/Prénom</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">IP</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Localisation</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Navigateur</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Appareil</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Date et Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {visiteurs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center luxury-text text-[#8B6F47]">
                        Aucune visite trouvée pour la période sélectionnée
                      </td>
                    </tr>
                  ) : (
                    visiteurs.map((visiteur: any) => {
                      const hasCommande = visiteur.nom && visiteur.prenom;
                      // Parser le user_agent pour obtenir navigateur et appareil
                      const userAgent = visiteur.user_agent || '';
                      let navigateur = 'Inconnu';
                      let appareil = 'Inconnu';
                      
                      if (userAgent) {
                        // Détecter le navigateur
                        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) navigateur = 'Chrome';
                        else if (userAgent.includes('Firefox')) navigateur = 'Firefox';
                        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) navigateur = 'Safari';
                        else if (userAgent.includes('Edg')) navigateur = 'Edge';
                        else if (userAgent.includes('Opera') || userAgent.includes('OPR')) navigateur = 'Opera';
                        
                        // Détecter l'appareil
                        if (userAgent.includes('Mobile') || userAgent.includes('Android')) appareil = 'Mobile';
                        else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) appareil = 'Tablette';
                        else appareil = 'Desktop';
                      }
                      
                      const dateVisite = new Date(visiteur.visited_at);
                      const dateStr = dateVisite.toLocaleDateString('fr-FR');
                      const heureStr = dateVisite.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <tr 
                          key={visiteur.id} 
                          className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                          onClick={() => {
                            // Afficher les détails dans une modal ou une section détaillée
                            alert(`Détails de la visite:\n\nNom: ${hasCommande ? `${visiteur.nom} ${visiteur.prenom}` : 'Anonyme'}\nIP: ${visiteur.ip || 'N/A'}\nLocalisation: ${visiteur.localisation || 'Inconnue'}\nNavigateur: ${navigateur}\nAppareil: ${appareil}\nDate: ${dateStr}\nHeure: ${heureStr}\n\nUser Agent: ${userAgent}`);
                          }}
                        >
                          <td className="p-4 luxury-text">
                            {hasCommande ? (
                              <div>
                                <div className="text-[#3D2817] font-semibold">{visiteur.nom} {visiteur.prenom}</div>
                                <div className="text-xs text-green-600">✓ A commandé</div>
                              </div>
                            ) : (
                              <span className="text-[#8B6F47] italic">Visiteur anonyme</span>
                            )}
                          </td>
                          <td className="p-4 luxury-text text-[#3D2817]">{visiteur.ip || 'N/A'}</td>
                          <td className="p-4 luxury-text text-[#8B6F47]">{visiteur.localisation || 'Inconnue'}</td>
                          <td className="p-4 luxury-text text-[#8B6F47]">{navigateur}</td>
                          <td className="p-4 luxury-text text-[#8B6F47]">{appareil}</td>
                          <td className="p-4 luxury-text text-[#8B6F47]">
                            <div>{dateStr}</div>
                            <div className="text-xs">{heureStr}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Livraison */}
        {activeTab === 'livraison' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <h2 className="luxury-title text-3xl text-[#3D2817] mb-6">Gestion des Frais de Livraison par Commune</h2>
            
            <div className="mb-6 flex justify-between items-center">
              <p className="luxury-text text-[#8B6F47]">
                Configurez le prix de livraison pour chaque commune. Le prix s'affichera automatiquement dans le panier selon la commune sélectionnée.
              </p>
              <button
                onClick={() => {
                  setShowCommuneForm(true);
                  setNewCommune({ commune: '', prix: 1500 });
                }}
                className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                + Ajouter une commune
              </button>
            </div>

            {showCommuneForm && (
              <div className="mb-6 p-6 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Nouvelle Commune</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                      Nom de la commune <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCommune.commune}
                      onChange={(e) => setNewCommune({ ...newCommune, commune: e.target.value })}
                      placeholder="Ex: Yopougon"
                      className="w-full px-3 sm:px-4 py-2 border-2 border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text text-[#3D2817] text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                      Prix de livraison (FCFA) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={newCommune.prix}
                      onChange={(e) => {
                        const valeur = parseInt(e.target.value) || 0;
                        if (valeur >= 0) {
                          setNewCommune({ ...newCommune, prix: valeur });
                        }
                      }}
                      placeholder="1500"
                      min="0"
                      className="w-full px-4 py-2 border-2 border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text text-[#3D2817]"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!newCommune.commune.trim()) {
                        alert('Veuillez entrer le nom de la commune');
                        return;
                      }
                      if (newCommune.prix < 0) {
                        alert('Le prix doit être positif');
                        return;
                      }
                      try {
                        await creerCommuneLivraison({ commune: newCommune.commune.trim(), prix: newCommune.prix }, token!);
                        setShowCommuneForm(false);
                        setNewCommune({ commune: '', prix: 1500 });
                        await loadData(token!);
                        alert('Commune ajoutée avec succès !');
                      } catch (err: any) {
                        alert(err.response?.data?.error || 'Erreur lors de la création de la commune');
                      }
                    }}
                    className="luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-6 py-2 rounded-lg hover:from-[#059669] hover:to-[#047857] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setShowCommuneForm(false);
                      setNewCommune({ commune: '', prix: 1500 });
                    }}
                    className="luxury-text text-sm uppercase tracking-wider bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#E8E0D5]">
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Commune</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Prix (FCFA)</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Statut</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fraisLivraison.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center luxury-text text-[#8B6F47]">
                        Aucune commune configurée
                      </td>
                    </tr>
                  ) : (
                    fraisLivraison.map((item: any) => (
                      <tr key={item.id} className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0] transition-colors">
                        <td className="p-4 luxury-title text-lg text-[#3D2817]">{item.commune}</td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={prixEnEdition[item.id] !== undefined ? prixEnEdition[item.id] : (item.prix || '')}
                            onChange={(e) => {
                              const valeur = e.target.value;
                              // Permettre de vider complètement le champ ou saisir des nombres
                              if (valeur === '' || /^\d+$/.test(valeur)) {
                                setPrixEnEdition({
                                  ...prixEnEdition,
                                  [item.id]: valeur
                                });
                              }
                            }}
                            onBlur={async (e) => {
                              const valeur = e.target.value.trim();
                              const nouveauPrix = valeur === '' ? 0 : parseFloat(valeur);
                              
                              // Valider que le prix est valide
                              if (isNaN(nouveauPrix) || nouveauPrix < 0) {
                                // Remettre la valeur précédente si invalide
                                setPrixEnEdition({
                                  ...prixEnEdition,
                                  [item.id]: item.prix ? item.prix.toString() : ''
                                });
                                return;
                              }
                              
                              // Sauvegarder seulement si différent de l'ancien prix
                              if (nouveauPrix !== item.prix) {
                                try {
                                  await updatePrixLivraison(item.id, { prix: nouveauPrix, actif: item.actif === 1 }, token!);
                                  setFraisLivraison(fraisLivraison.map((f: any) => 
                                    f.id === item.id ? { ...f, prix: nouveauPrix } : f
                                  ));
                                  // Nettoyer l'état d'édition
                                  const nouveauPrixEnEdition = { ...prixEnEdition };
                                  delete nouveauPrixEnEdition[item.id];
                                  setPrixEnEdition(nouveauPrixEnEdition);
                                } catch (err: any) {
                                  alert(err.response?.data?.error || 'Erreur lors de la mise à jour');
                                  // Remettre la valeur précédente en cas d'erreur
                                  setPrixEnEdition({
                                    ...prixEnEdition,
                                    [item.id]: item.prix ? item.prix.toString() : ''
                                  });
                                }
                              } else {
                                // Nettoyer l'état d'édition si pas de changement
                                const nouveauPrixEnEdition = { ...prixEnEdition };
                                delete nouveauPrixEnEdition[item.id];
                                setPrixEnEdition(nouveauPrixEnEdition);
                              }
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur(); // Déclencher onBlur
                              }
                            }}
                            placeholder="Prix en FCFA"
                            className="w-32 px-3 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
                          />
                        </td>
                        <td className="p-4">
                          <button
                            onClick={async () => {
                              try {
                                // Inverser l'état actif : si actif === 1, mettre à 0, sinon mettre à 1
                                const nouvelEtatActif = item.actif === 1 ? false : true;
                                console.log(`Changement état commune ${item.commune}: ${item.actif} -> ${nouvelEtatActif ? 1 : 0}`);
                                await updatePrixLivraison(item.id, { prix: item.prix, actif: nouvelEtatActif }, token!);
                                await loadData(token!);
                                alert(`Commune ${nouvelEtatActif ? 'activée' : 'désactivée'} avec succès !`);
                              } catch (err: any) {
                                alert(err.response?.data?.error || 'Erreur');
                              }
                            }}
                            className={`px-4 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium ${
                              item.actif === 1
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-400 text-white hover:bg-gray-500'
                            }`}
                          >
                            {item.actif === 1 ? 'Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={async () => {
                              if (confirm(`Supprimer la commune "${item.commune}" ?`)) {
                                try {
                                  await supprimerCommuneLivraison(item.id, token!);
                                  loadData(token!);
                                  alert('Commune supprimée avec succès');
                                } catch (err: any) {
                                  alert(err.response?.data?.error || 'Erreur');
                                }
                              }
                            }}
                            className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-all duration-300 text-xs font-medium"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admins */}
        {activeTab === 'admins' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="luxury-title text-2xl md:text-3xl text-[#3D2817]">Gestion des Admins ({admins.length})</h2>
              <button
                onClick={() => {
                  setShowAdminForm(true);
                  setNewAdminUsername('');
                  setNewAdminPassword('');
                }}
                className="w-full md:w-auto luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                + Créer un admin
              </button>
            </div>

            {showAdminForm && (
              <div className="mb-6 p-4 md:p-6 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Nouvel Admin</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 luxury-text text-[#5C4033]">Nom d'utilisateur</label>
                    <input
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="Nom d'utilisateur"
                      className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 luxury-text text-[#5C4033]">Mot de passe (min. 6 caractères)</label>
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Mot de passe"
                      className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                    <button
                      onClick={async () => {
                        if (!newAdminUsername.trim() || !newAdminPassword.trim()) {
                          alert('Veuillez remplir tous les champs');
                          return;
                        }
                        if (newAdminPassword.length < 6) {
                          alert('Le mot de passe doit contenir au moins 6 caractères');
                          return;
                        }
                        try {
                          await creerAdmin({ username: newAdminUsername, password: newAdminPassword }, token!);
                          alert('Admin créé avec succès');
                          setShowAdminForm(false);
                          setNewAdminUsername('');
                          setNewAdminPassword('');
                          loadData(token!);
                        } catch (err: any) {
                          alert(err.response?.data?.error || 'Erreur lors de la création');
                        }
                      }}
                      className="flex-1 luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md font-semibold"
                    >
                      Créer
                    </button>
                    <button
                      onClick={() => {
                        setShowAdminForm(false);
                        setNewAdminUsername('');
                        setNewAdminPassword('');
                      }}
                      className="flex-1 luxury-text text-sm uppercase tracking-wider bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#E8E0D5]">
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Nom d'utilisateur</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Date de création</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Statut</th>
                    <th className="text-left p-4 luxury-text text-sm uppercase tracking-wider text-[#5C4033]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center luxury-text text-[#8B6F47]">
                        Aucun admin trouvé
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin: any) => {
                      const isBlocked = admin.blocked === true || admin.blocked === 1;
                      const canDelete = admins.length > 1;
                      const canBlock = admins.filter((a: any) => !a.blocked || a.blocked === 0).length > 1 || isBlocked;
                      const isEditingPassword = editingPasswordId === admin.id;

                      return (
                        <tr key={admin.id} className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0] transition-colors">
                          <td className="p-4 luxury-title text-lg text-[#3D2817]">{admin.username}</td>
                          <td className="p-4 luxury-text text-[#8B6F47]">
                            {new Date(admin.created_at).toLocaleDateString('fr-FR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isBlocked
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {isBlocked ? 'Bloqué' : 'Actif'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col md:flex-row gap-2">
                              {isEditingPassword ? (
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                  <input
                                    type="password"
                                    value={editingPassword}
                                    onChange={(e) => setEditingPassword(e.target.value)}
                                    placeholder="Nouveau mot de passe"
                                    className="flex-1 px-3 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm"
                                  />
                                  <button
                                    onClick={async () => {
                                      if (!editingPassword || editingPassword.length < 6) {
                                        alert('Le mot de passe doit contenir au moins 6 caractères');
                                        return;
                                      }
                                      try {
                                        await modifierPasswordAdmin(admin.id, editingPassword, token!);
                                        alert('Mot de passe modifié avec succès');
                                        setEditingPasswordId(null);
                                        setEditingPassword('');
                                      } catch (err: any) {
                                        alert(err.response?.data?.error || 'Erreur lors de la modification');
                                      }
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 text-xs font-medium whitespace-nowrap"
                                  >
                                    Valider
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingPasswordId(null);
                                      setEditingPassword('');
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 text-xs font-medium whitespace-nowrap"
                                  >
                                    Annuler
                                  </button>
                  </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingPasswordId(admin.id);
                                      setEditingPassword('');
                                    }}
                                    className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 text-xs font-medium whitespace-nowrap"
                                  >
                                    Modifier MDP
                                  </button>
                                  {canBlock && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await bloquerAdmin(admin.id, !isBlocked, token!);
                                          alert(`Admin ${!isBlocked ? 'bloqué' : 'débloqué'} avec succès`);
                                          loadData(token!);
                                        } catch (err: any) {
                                          alert(err.response?.data?.error || 'Erreur lors de l\'opération');
                                        }
                                      }}
                                      className={`px-3 md:px-4 py-2 rounded-lg transition-all duration-300 text-xs font-medium whitespace-nowrap ${
                                        isBlocked
                                          ? 'bg-green-500 text-white hover:bg-green-600'
                                          : 'bg-orange-500 text-white hover:bg-orange-600'
                                      }`}
                                    >
                                      {isBlocked ? 'Débloquer' : 'Bloquer'}
                                    </button>
                                  )}
                                  {canDelete && (
                    <button
                      onClick={async () => {
                        if (confirm(`Êtes-vous sûr de supprimer l'admin "${admin.username}" ?`)) {
                          try {
                            await supprimerAdmin(admin.id, token!);
                            alert('Admin supprimé avec succès');
                            loadData(token!);
                          } catch (err: any) {
                            alert(err.response?.data?.error || 'Erreur lors de la suppression');
                          }
                        }
                      }}
                                      className="bg-red-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 text-xs font-medium whitespace-nowrap"
                    >
                      Supprimer
                    </button>
                                  )}
                                </>
                  )}
                </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Section Logs d'activités */}
            <div className="mt-8 pt-8 border-t border-[#E8E0D5]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="luxury-title text-xl text-[#3D2817]">Logs d'activités des Admins</h3>
                <button
                  onClick={async () => {
                    try {
                      const res = await getAdminLogs(token!, { limit: 100 });
                      setAdminLogs(res.data || []);
                    } catch (err) {
                      console.error('Erreur lors du chargement des logs:', err);
                      alert('Erreur lors du chargement des logs');
                    }
                  }}
                  className="w-full md:w-auto luxury-text text-xs uppercase tracking-wider bg-[#1A1A1A] text-white px-4 py-2 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300"
                >
                  Charger les logs
                </button>
              </div>
              
              {adminLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-[#E8E0D5]">
                        <th className="text-left p-3 luxury-text text-xs uppercase tracking-wider text-[#5C4033]">Date</th>
                        <th className="text-left p-3 luxury-text text-xs uppercase tracking-wider text-[#5C4033]">Admin</th>
                        <th className="text-left p-3 luxury-text text-xs uppercase tracking-wider text-[#5C4033]">Action</th>
                        <th className="text-left p-3 luxury-text text-xs uppercase tracking-wider text-[#5C4033]">Détails</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminLogs.map((log: any) => (
                        <tr key={log.id} className="border-b border-[#E8E0D5] hover:bg-[#FAF7F0]">
                          <td className="p-3 luxury-text text-xs text-[#8B6F47]">
                            {new Date(log.created_at).toLocaleString('fr-FR')}
                          </td>
                          <td className="p-3 luxury-text text-xs text-[#3D2817]">{log.username || `Admin #${log.admin_id}`}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              log.action === 'create' ? 'bg-blue-100 text-blue-700' :
                              log.action === 'delete' ? 'bg-red-100 text-red-700' :
                              log.action === 'block' ? 'bg-orange-100 text-orange-700' :
                              log.action === 'unblock' ? 'bg-green-100 text-green-700' :
                              log.action === 'password_change' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {log.action === 'create' ? 'Création' :
                               log.action === 'delete' ? 'Suppression' :
                               log.action === 'block' ? 'Blocage' :
                               log.action === 'unblock' ? 'Déblocage' :
                               log.action === 'password_change' ? 'Changement MDP' :
                               log.action}
                            </span>
                          </td>
                          <td className="p-3 luxury-text text-xs text-[#8B6F47] break-all">
                            {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="luxury-text text-sm text-[#8B6F47] text-center py-4">
                  Aucun log chargé. Cliquez sur "Charger les logs" pour voir l'historique des activités.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contenus Légaux */}
        {activeTab === 'contenus-legaux' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
              <h2 className="luxury-title text-3xl text-[#3D2817] mb-6">Gestion des Contenus Légaux</h2>
              <p className="luxury-text text-sm text-[#8B6F47] mb-6">
                Gérez le contenu des pages légales de votre site : À propos, Mentions légales et Politique de confidentialité.
              </p>

              <div className="space-y-6">
                {/* À propos */}
                <div className="border border-[#E8E0D5] rounded-lg p-6 bg-[#FAF7F0]">
                  <h3 className="luxury-title text-xl text-[#3D2817] mb-4">À propos de nous</h3>
                  <p className="luxury-text text-xs text-[#8B6F47] mb-4">
                    Modifiez directement le contenu HTML de la page "À propos". Les modifications seront immédiatement visibles sur le site.
                  </p>
                  <ContenuEditor 
                    page="a-propos" 
                    token={token!} 
                    label="Contenu HTML de la page À propos"
                    placeholder="Le contenu actuel de la page s'affichera ici..."
                  />
                </div>

                {/* Mentions légales */}
                <div className="border border-[#E8E0D5] rounded-lg p-6 bg-[#FAF7F0]">
                  <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Mentions légales</h3>
                  <p className="luxury-text text-xs text-[#8B6F47] mb-4">
                    Modifiez directement le contenu HTML de la page "Mentions légales". Les modifications seront immédiatement visibles sur le site.
                  </p>
                  <ContenuEditor 
                    page="mentions-legales" 
                    token={token!} 
                    label="Contenu HTML de la page Mentions légales"
                    placeholder="Le contenu actuel de la page s'affichera ici..."
                  />
                </div>

                {/* Politique de confidentialité */}
                <div className="border border-[#E8E0D5] rounded-lg p-6 bg-[#FAF7F0]">
                  <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Politique de confidentialité</h3>
                  <p className="luxury-text text-xs text-[#8B6F47] mb-4">
                    Modifiez directement le contenu HTML de la page "Politique de confidentialité". Les modifications seront immédiatement visibles sur le site.
                  </p>
                  <ContenuEditor 
                    page="politique-confidentialite" 
                    token={token!} 
                    label="Contenu HTML de la page Politique de confidentialité"
                    placeholder="Le contenu actuel de la page s'affichera ici..."
                  />
                </div>

                {/* Page d'accueil - Titre */}
                <div className="border border-[#E8E0D5] rounded-lg p-6 bg-[#FAF7F0]">
                  <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Page d'accueil - Titre</h3>
                  <p className="luxury-text text-xs text-[#8B6F47] mb-4">
                    Modifiez le titre affiché sur la page d'accueil. Les modifications seront immédiatement visibles sur le site.
                  </p>
                  <ContenuEditorSimple 
                    page="accueil-titre" 
                    token={token!} 
                    label="Titre de la page d'accueil"
                    placeholder="Collection Exclusive"
                    type="text"
                  />
                </div>

                {/* Page d'accueil - Description */}
                <div className="border border-[#E8E0D5] rounded-lg p-6 bg-[#FAF7F0]">
                  <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Page d'accueil - Description</h3>
                  <p className="luxury-text text-xs text-[#8B6F47] mb-4">
                    Modifiez la description affichée sur la page d'accueil. Les modifications seront immédiatement visibles sur le site.
                  </p>
                  <ContenuEditorSimple 
                    page="accueil-description" 
                    token={token!} 
                    label="Description de la page d'accueil"
                    placeholder="Boutique féminine de qualité : découvrez une sélection élégante d'articles luxueux, modernes et traditionnels. Sacs, montres, chaussures et bien plus encore pour tous les goûts et tous les budgets."
                    type="textarea"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coordonnées de contact */}
        {activeTab === 'coordonnees' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <h2 className="luxury-title text-2xl sm:text-3xl text-[#3D2817] mb-4 sm:mb-6">Coordonnées de Contact</h2>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!token) return;
                
                try {
                  const paramsToUpdate = [
                    ['contact_adresse', parametres.contact_adresse || ''],
                    ['contact_telephone', parametres.contact_telephone || ''],
                    ['contact_horaires_jour', parametres.contact_horaires_jour || ''],
                    ['contact_horaires_heure', parametres.contact_horaires_heure || ''],
                    ['boutiques_texte', parametres.boutiques_texte || ''],
                    ['boutiques_url', parametres.boutiques_url || ''],
                    ['boutiques_adresses', parametres.boutiques_adresses || ''],
                  ];

                  await updateParametres(paramsToUpdate, token);
                  alert('Coordonnées mises à jour avec succès ! Les modifications seront visibles sur la page d\'accueil dans quelques secondes.');
                  await loadData(token);
                } catch (err: any) {
                  if (err.response?.status === 401) {
                    alert('Votre session a expiré. Veuillez vous reconnecter.');
                    setAuthenticated(false);
                    localStorage.removeItem('admin_token');
                    setToken(null);
                  } else {
                    alert(err.response?.data?.error || 'Erreur lors de la mise à jour');
                  }
                }
              }}
            >
              <div className="mb-6">
                <label className="block mb-2 luxury-text text-[#5C4033] font-medium">Adresse</label>
                <input
                  type="text"
                  value={parametres.contact_adresse || ''}
                  onChange={(e) => setParametres({ ...parametres, contact_adresse: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm sm:text-base"
                  placeholder="Adresse de la boutique"
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 luxury-text text-[#5C4033] font-medium">Téléphone</label>
                <input
                  type="text"
                  value={parametres.contact_telephone || ''}
                  onChange={(e) => setParametres({ ...parametres, contact_telephone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm sm:text-base"
                  placeholder="+225 0505616042"
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 luxury-text text-[#5C4033] font-medium">Horaires - Jours</label>
                <input
                  type="text"
                  value={parametres.contact_horaires_jour || ''}
                  onChange={(e) => setParametres({ ...parametres, contact_horaires_jour: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm sm:text-base"
                  placeholder="Lundi - Dimanche"
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 luxury-text text-[#5C4033] font-medium">Horaires - Heures</label>
                <input
                  type="text"
                  value={parametres.contact_horaires_heure || ''}
                  onChange={(e) => setParametres({ ...parametres, contact_horaires_heure: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm sm:text-base"
                  placeholder="9h - 18h"
                />
              </div>
              
              <div className="border-t-2 border-[#E8E0D5] pt-6 mt-6">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Boutiques</h3>
                
                <div className="mb-6">
                  <label className="block mb-2 luxury-text text-[#5C4033] font-medium">Texte des boutiques (affiché dans le footer)</label>
                  <input
                    type="text"
                    value={parametres.boutiques_texte || ''}
                    onChange={(e) => setParametres({ ...parametres, boutiques_texte: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm sm:text-base"
                    placeholder="Vos boutiques bientôt disponibles"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block mb-2 luxury-text text-[#5C4033] font-medium">URL Google Maps (optionnel - pour une seule boutique)</label>
                  <input
                    type="url"
                    value={parametres.boutiques_url || ''}
                    onChange={(e) => setParametres({ ...parametres, boutiques_url: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm sm:text-base"
                    placeholder="https://maps.google.com/..."
                  />
                  <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                    Si rempli, le texte des boutiques dans le footer sera cliquable et redirigera vers cette URL
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block mb-2 luxury-text text-[#5C4033] font-medium">Adresses des boutiques (JSON - pour plusieurs boutiques)</label>
                  <textarea
                    value={parametres.boutiques_adresses || ''}
                    onChange={(e) => setParametres({ ...parametres, boutiques_adresses: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text font-mono text-sm"
                    rows={8}
                    placeholder='[{"nom": "Boutique Centre-Ville", "adresse": "123 Rue Principale, Abidjan", "maps_url": "https://maps.google.com/..."}, {"nom": "Boutique Cocody", "adresse": "456 Avenue de la République, Cocody", "maps_url": "https://maps.google.com/..."}]'
                  />
                  <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                    Format JSON : tableau d'objets avec "nom", "adresse" et "maps_url". Si rempli, cette liste sera affichée sur la page /boutiques au lieu de l'URL unique.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto luxury-text text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                Enregistrer les coordonnées
              </button>
            </form>
          </div>
        )}
        
        {/* Coordonnées de contact - Ancien code (à supprimer si nécessaire) */}
        {false && activeTab === 'coordonnees-old' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="luxury-title text-3xl text-[#3D2817] mb-2">Coordonnées de Contact</h2>
                <p className="luxury-text text-sm text-[#8B6F47]">
              Gérez les coordonnées affichées sur la page "Contactez-nous" du site.
            </p>
              </div>
              <a
                href="/contactez-nous"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-[#E8E0D5] text-[#3D2817] rounded-lg hover:bg-[#D4C5B5] transition-colors luxury-text text-sm uppercase tracking-wider font-medium inline-flex items-center gap-2"
              >
                👁️ Voir la page
              </a>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!token) return;
              
              try {
                const paramsToUpdate = [
                  ['contact_adresse', parametres.contact_adresse || ''],
                  ['contact_telephone', parametres.contact_telephone || ''],
                  ['contact_horaires_jour', parametres.contact_horaires_jour || ''],
                  ['contact_horaires_heure', parametres.contact_horaires_heure || ''],
                  ['boutiques_texte', parametres.boutiques_texte || ''],
                  ['boutiques_url', parametres.boutiques_url || ''],
                  ['boutiques_adresses', parametres.boutiques_adresses || ''],
                ];

                await updateParametres(paramsToUpdate, token);
                alert('Coordonnées mises à jour avec succès !');
                await loadData(token);
              } catch (err: any) {
                if (err.response?.status === 401) {
                  alert('Votre session a expiré. Veuillez vous reconnecter.');
                  setAuthenticated(false);
                  localStorage.removeItem('admin_token');
                  setToken(null);
                } else {
                  alert(err.response?.data?.error || 'Erreur lors de la mise à jour');
                }
              }
            }}>
              <div className="space-y-6">
                <div>
                  <label className="block luxury-text text-sm text-[#5C4033] mb-2">Adresse complète</label>
                  <textarea
                    value={parametres.contact_adresse || ''}
                    onChange={(e) => setParametres({ ...parametres, contact_adresse: e.target.value })}
                    placeholder="Cocody Angré 8ᵉ tranche, Abidjan, Côte d'Ivoire"
                    rows={3}
                    className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] luxury-text text-sm text-[#3D2817]"
                  />
                </div>

                <div>
                  <label className="block luxury-text text-sm text-[#5C4033] mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={parametres.contact_telephone || ''}
                    onChange={(e) => setParametres({ ...parametres, contact_telephone: e.target.value })}
                    placeholder="+225 0505616042"
                    className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] luxury-text text-sm text-[#3D2817]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block luxury-text text-sm text-[#5C4033] mb-2">Jours d'ouverture</label>
                    <input
                      type="text"
                      value={parametres.contact_horaires_jour || ''}
                      onChange={(e) => setParametres({ ...parametres, contact_horaires_jour: e.target.value })}
                      placeholder="Lundi - Dimanche"
                      className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] luxury-text text-sm text-[#3D2817]"
                    />
                  </div>

                  <div>
                    <label className="block luxury-text text-sm text-[#5C4033] mb-2">Heures d'ouverture</label>
                    <input
                      type="text"
                      value={parametres.contact_horaires_heure || ''}
                      onChange={(e) => setParametres({ ...parametres, contact_horaires_heure: e.target.value })}
                      placeholder="9h - 18h"
                      className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] luxury-text text-sm text-[#3D2817]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-8 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                Enregistrer les coordonnées
              </button>
            </form>
          </div>
        )}

        {/* Paramètres */}
        {activeTab === 'parametres' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E8E0D5] p-4 sm:p-6 md:p-8">
            <h2 className="luxury-title text-3xl text-[#3D2817] mb-6">Paramètres</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  // Fonction pour normaliser les valeurs booléennes
                  const normalizeBool = (val: any): boolean => {
                    if (val === '1' || val === 1 || val === true) return true;
                    if (val === '0' || val === 0 || val === false) return false;
                    return false;
                  };
                  
                  const normalizeString = (val: any): string => {
                    return val !== undefined && val !== null ? String(val) : '';
                  };
                  
                  // Préparer les valeurs normalisées
                  const currentValues: any = {
                    whatsapp_number: normalizeString(parametres.whatsapp_number),
                    wave_account: normalizeString(parametres.wave_account),
                    wave_merchant_code: normalizeString(parametres.wave_merchant_code),
                    wave_active: normalizeBool(parametres.wave_active !== undefined && parametres.wave_active !== null ? parametres.wave_active : false),
                    pack_active: normalizeBool(parametres.pack_active),
                    frais_livraison_active: normalizeBool(parametres.frais_livraison_active),
                    frais_livraison_montant: normalizeString(parametres.frais_livraison_montant || '1500'),
                    tiktok_url: normalizeString(parametres.tiktok_url),
                    instagram_url: normalizeString(parametres.instagram_url),
                    whatsapp_url: normalizeString(parametres.whatsapp_url),
                    gmail_url: normalizeString(parametres.gmail_url),
                    tiktok_active: normalizeBool(parametres.tiktok_active !== undefined && parametres.tiktok_active !== null ? parametres.tiktok_active : false),
                    instagram_active: normalizeBool(parametres.instagram_active !== undefined && parametres.instagram_active !== null ? parametres.instagram_active : false),
                    whatsapp_active: normalizeBool(parametres.whatsapp_active !== undefined && parametres.whatsapp_active !== null ? parametres.whatsapp_active : false),
                    gmail_active: normalizeBool(parametres.gmail_active !== undefined && parametres.gmail_active !== null ? parametres.gmail_active : false),
                    boutiques_texte: normalizeString(parametres.boutiques_texte || 'Vos boutiques bientôt disponibles'),
                    alerte_fetes_active: normalizeBool(parametres.alerte_fetes_active !== undefined && parametres.alerte_fetes_active !== null ? parametres.alerte_fetes_active : false),
                    alerte_fetes_texte: normalizeString(parametres.alerte_fetes_texte),
                    alerte_fetes_reduction: normalizeString(parametres.alerte_fetes_reduction || '0'),
                    maintenance_active: normalizeBool(parametres.maintenance_active !== undefined && parametres.maintenance_active !== null ? parametres.maintenance_active : false),
                    maintenance_message: normalizeString(parametres.maintenance_message),
                  };
                  
                  // Comparer avec les valeurs initiales pour détecter les changements
                  const hasChanges = (): boolean => {
                    const keysToCheck = Object.keys(currentValues);
                    for (const key of keysToCheck) {
                      const current = currentValues[key];
                      const initial = parametresInitiaux[key];
                      
                      // Normaliser les valeurs initiales pour comparaison
                      let normalizedInitial: any = initial;
                      if (key.includes('_active') || key === 'wave_active' || key === 'pack_active' || key === 'frais_livraison_active') {
                        normalizedInitial = normalizeBool(initial);
                        const normalizedCurrent = normalizeBool(current);
                        if (normalizedCurrent !== normalizedInitial) {
                          console.log(`Changement détecté pour ${key}:`, normalizedInitial, '->', normalizedCurrent);
                          return true;
                        }
                      } else if (typeof current === 'string') {
                        normalizedInitial = normalizeString(initial);
                        if (current.trim() !== normalizedInitial.trim()) {
                          console.log(`Changement détecté pour ${key}:`, normalizedInitial, '->', current);
                          return true;
                        }
                      } else {
                        if (String(current) !== String(normalizedInitial)) {
                          console.log(`Changement détecté pour ${key}:`, normalizedInitial, '->', current);
                          return true;
                        }
                      }
                    }
                    console.log('Aucun changement détecté');
                    return false;
                  };
                  
                  if (!hasChanges()) {
                    alert('Aucune modification détectée. Veuillez modifier au moins un paramètre avant de sauvegarder.');
                    return;
                  }
                  
                  // Convertir les booléens en '1' ou '0' pour l'API avec normalisation stricte
                  const paramsToUpdate: any = {
                    // Toujours inclure tous les paramètres réseaux sociaux, même vides
                    tiktok_url: currentValues.tiktok_url || '',
                    instagram_url: currentValues.instagram_url || '',
                    whatsapp_url: currentValues.whatsapp_url || '',
                    gmail_url: currentValues.gmail_url || '',
                    // Normalisation stricte: utiliser normalizeBool pour garantir '1' ou '0'
                    tiktok_active: normalizeBool(currentValues.tiktok_active) ? '1' : '0',
                    instagram_active: normalizeBool(currentValues.instagram_active) ? '1' : '0',
                    whatsapp_active: normalizeBool(currentValues.whatsapp_active) ? '1' : '0',
                    gmail_active: normalizeBool(currentValues.gmail_active) ? '1' : '0',
                    boutiques_texte: currentValues.boutiques_texte || '',
                    alerte_fetes_active: normalizeBool(currentValues.alerte_fetes_active) ? '1' : '0',
                    alerte_fetes_texte: currentValues.alerte_fetes_texte || '',
                    alerte_fetes_reduction: currentValues.alerte_fetes_reduction || '0',
                    maintenance_active: normalizeBool(currentValues.maintenance_active) ? '1' : '0',
                    maintenance_message: currentValues.maintenance_message || '',
                    // Paramètres Wave - explicitement inclus
                    wave_account: currentValues.wave_account || '',
                    wave_merchant_code: currentValues.wave_merchant_code || '',
                    wave_active: normalizeBool(currentValues.wave_active) ? '1' : '0',
                  };
                  
                  // Ajouter les autres paramètres existants
                  Object.keys(currentValues).forEach(key => {
                    if (!paramsToUpdate.hasOwnProperty(key)) {
                      const value = currentValues[key];
                      if (key.includes('_active') || key === 'wave_active' || key === 'pack_active' || key === 'frais_livraison_active') {
                        paramsToUpdate[key] = value ? '1' : '0';
                      } else {
                        paramsToUpdate[key] = value || '';
                      }
                    }
                  });
                  
                  console.log('Modifications détectées, envoi de la mise à jour des paramètres:', paramsToUpdate);
                  
                  const response = await updateParametres(paramsToUpdate, token!);
                  console.log('Réponse de la mise à jour:', response.data);
                  
                  // Mettre à jour les paramètres localement AVANT le rechargement pour éviter le décochage
                  // Cela préserve les valeurs que l'utilisateur vient de modifier
                  const updatedParametres = { ...parametres };
                  Object.keys(paramsToUpdate).forEach(key => {
                    if (key.includes('_active') || key === 'wave_active') {
                      updatedParametres[key] = paramsToUpdate[key];
                    } else {
                      updatedParametres[key] = paramsToUpdate[key];
                    }
                  });
                  setParametres(updatedParametres);
                  setParametresInitiaux(JSON.parse(JSON.stringify(updatedParametres)));
                  
                  alert('Paramètres mis à jour avec succès !');
                  // Recharger les paramètres après mise à jour
                  // Mais préserver les valeurs des cases à cocher pour éviter qu'elles se décochent
                  const savedActiveValues = {
                    tiktok_active: paramsToUpdate.tiktok_active,
                    instagram_active: paramsToUpdate.instagram_active,
                    whatsapp_active: paramsToUpdate.whatsapp_active,
                    gmail_active: paramsToUpdate.gmail_active,
                    wave_active: paramsToUpdate.wave_active,
                    maintenance_active: paramsToUpdate.maintenance_active,
                    alerte_fetes_active: paramsToUpdate.alerte_fetes_active,
                    frais_livraison_active: paramsToUpdate.frais_livraison_active,
                    pack_active: paramsToUpdate.pack_active
                  };
                  await loadData(token!);
                  // Restaurer les valeurs des cases à cocher après le rechargement
                  setParametres(prev => {
                    const updated = { ...prev };
                    Object.keys(savedActiveValues).forEach(key => {
                      if (savedActiveValues[key as keyof typeof savedActiveValues] !== undefined) {
                        updated[key] = savedActiveValues[key as keyof typeof savedActiveValues];
                      }
                    });
                    return updated;
                  });
                  // Mettre à jour aussi les paramètres initiaux pour éviter les faux positifs de détection de changement
setParametresInitiaux((prev: Record<string, any>) => {
  const updated = { ...prev };
  Object.keys(savedActiveValues).forEach(key => {
    if (savedActiveValues[key as keyof typeof savedActiveValues] !== undefined) {
      updated[key] = savedActiveValues[key as keyof typeof savedActiveValues];
    }
  });
  return updated;
});

                } catch (err: any) {
                  console.error('Erreur complète lors de la mise à jour des paramètres:', err);
                  console.error('Détails de l\'erreur:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                  });
                  const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la mise à jour des paramètres';
                  alert(`Erreur: ${errorMessage}`);
                }
              }}
            >
              <div className="mb-4">
                <label className="block mb-2">Numéro WhatsApp</label>
                <input
                  type="text"
                  value={parametres.whatsapp_number || ''}
                  onChange={(e) => setParametres({ ...parametres, whatsapp_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Compte WAVE</label>
                <input
                  type="text"
                  value={parametres.wave_account || ''}
                  onChange={(e) => setParametres({ ...parametres, wave_account: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Code Marchand WAVE</label>
                <input
                  type="text"
                  value={parametres.wave_merchant_code || ''}
                  onChange={(e) => setParametres({ ...parametres, wave_merchant_code: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={parametres.wave_active === '1'}
                    onChange={(e) => {
                      const newValue = e.target.checked ? '1' : '0';
                      console.log('Wave checkbox changé:', e.target.checked, '-> valeur:', newValue);
                      setParametres({ ...parametres, wave_active: newValue });
                    }}
                    className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                  />
                  <span className="luxury-text text-[#5C4033]">Activer le paiement par WAVE</span>
                </label>
                <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                  Si désactivé, seuls les paiements via WhatsApp seront disponibles
                </p>
              </div>
              
              <div className="border-t-2 border-[#E8E0D5] pt-6 mt-6">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Réseaux sociaux et Contacts</h3>
                
                {/* TikTok */}
                <div className="mb-6 p-4 bg-[#FAF7F0] rounded-lg border border-[#E8E0D5]">
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={parametres.tiktok_active === '1'}
                      onChange={(e) => {
                        const newValue = e.target.checked ? '1' : '0';
                        console.log('TikTok checkbox changé:', e.target.checked, '-> valeur:', newValue);
                        setParametres({ ...parametres, tiktok_active: newValue });
                      }}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <span className="luxury-text text-[#5C4033] font-medium">Afficher TikTok</span>
                  </label>
                  <input
                    type="text"
                    value={parametres.tiktok_url || ''}
                    onChange={(e) => setParametres({ ...parametres, tiktok_url: e.target.value })}
                    placeholder="https://www.tiktok.com/@votrecompte"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                    Lien complet vers votre compte TikTok
                  </p>
                </div>

                {/* Instagram */}
                <div className="mb-6 p-4 bg-[#FAF7F0] rounded-lg border border-[#E8E0D5]">
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={parametres.instagram_active === '1'}
                      onChange={(e) => {
                        const newValue = e.target.checked ? '1' : '0';
                        console.log('Instagram checkbox changé:', e.target.checked, '-> valeur:', newValue);
                        setParametres({ ...parametres, instagram_active: newValue });
                      }}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <span className="luxury-text text-[#5C4033] font-medium">Afficher Instagram</span>
                  </label>
                  <input
                    type="text"
                    value={parametres.instagram_url || ''}
                    onChange={(e) => setParametres({ ...parametres, instagram_url: e.target.value })}
                    placeholder="https://www.instagram.com/votrecompte"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                    Lien complet vers votre compte Instagram
                  </p>
                </div>

                {/* WhatsApp */}
                <div className="mb-6 p-4 bg-[#FAF7F0] rounded-lg border border-[#E8E0D5]">
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={parametres.whatsapp_active === '1'}
                      onChange={(e) => {
                        const newValue = e.target.checked ? '1' : '0';
                        console.log('WhatsApp checkbox changé:', e.target.checked, '-> valeur:', newValue);
                        setParametres({ ...parametres, whatsapp_active: newValue });
                      }}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <span className="luxury-text text-[#5C4033] font-medium">Afficher WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={parametres.whatsapp_url || parametres.whatsapp_number || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setParametres({ 
                        ...parametres, 
                        whatsapp_url: value,
                        whatsapp_number: value.replace(/\D/g, '')
                      });
                    }}
                    placeholder="https://wa.me/2250123456789 ou 2250123456789"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                    URL complète WhatsApp ou numéro de téléphone
                  </p>
                </div>

                {/* Gmail */}
                <div className="mb-6 p-4 bg-[#FAF7F0] rounded-lg border border-[#E8E0D5]">
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={parametres.gmail_active === '1'}
                      onChange={(e) => {
                        const newValue = e.target.checked ? '1' : '0';
                        console.log('Gmail checkbox changé:', e.target.checked, '-> valeur:', newValue);
                        setParametres({ ...parametres, gmail_active: newValue });
                      }}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <span className="luxury-text text-[#5C4033] font-medium">Afficher Gmail</span>
                  </label>
                  <input
                    type="text"
                    value={parametres.gmail_url || ''}
                    onChange={(e) => setParametres({ ...parametres, gmail_url: e.target.value })}
                    placeholder="mailto:contact@safiyaboutique.com"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                    Adresse email complète (mailto:email@example.com)
                  </p>
                </div>
              </div>

              {/* Section Boutiques */}
              <div className="border-t-2 border-[#E8E0D5] pt-6 mt-6">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Boutiques de vente</h3>
                <div className="mb-4">
                  <label className="block mb-2 luxury-text text-[#5C4033]">Message boutiques</label>
                  <input
                    type="text"
                    value={parametres.boutiques_texte || 'Vos boutiques bientôt disponibles'}
                    onChange={(e) => setParametres({ ...parametres, boutiques_texte: e.target.value })}
                    placeholder="Vos boutiques bientôt disponibles"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                    Texte affiché dans la section Informations du footer
                  </p>
                </div>
              </div>

              {/* Section Alertes de fêtes */}
              <div className="border-t-2 border-[#E8E0D5] pt-6 mt-6">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Alertes de réductions pour les fêtes</h3>
                <div className="mb-4">
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={parametres.alerte_fetes_active === '1' || parametres.alerte_fetes_active === 1}
                      onChange={(e) => {
                        const newValue = e.target.checked ? '1' : '0';
                        console.log('Alerte fêtes checkbox changé:', e.target.checked, '-> valeur:', newValue);
                        setParametres({ ...parametres, alerte_fetes_active: newValue });
                      }}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <span className="luxury-text text-[#5C4033]">Activer l'alerte de fêtes</span>
                  </label>
                  <div className="mb-4">
                    <label className="block mb-2 luxury-text text-[#5C4033]">Texte de l'alerte</label>
                    <textarea
                      value={parametres.alerte_fetes_texte || ''}
                      onChange={(e) => setParametres({ ...parametres, alerte_fetes_texte: e.target.value })}
                      placeholder="Bientôt la fête ! Profitez de nos réductions exceptionnelles"
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 luxury-text text-[#5C4033]">Pourcentage de réduction (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={parametres.alerte_fetes_reduction || '0'}
                      onChange={(e) => setParametres({ ...parametres, alerte_fetes_reduction: e.target.value })}
                      placeholder="10"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Section Maintenance */}
              <div className="border-t-2 border-[#E8E0D5] pt-6 mt-6">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Mode Maintenance</h3>
                <div className="mb-4">
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={parametres.maintenance_active === '1' || parametres.maintenance_active === 1}
                      onChange={(e) => {
                        const newValue = e.target.checked ? '1' : '0';
                        console.log('Maintenance changé à:', newValue);
                        setParametres({ ...parametres, maintenance_active: newValue });
                      }}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <span className="luxury-text text-[#5C4033]">Activer le mode maintenance</span>
                  </label>
                  <div className="mb-4">
                    <label className="block mb-2 luxury-text text-[#5C4033]">Message de maintenance</label>
                    <textarea
                      value={parametres.maintenance_message || ''}
                      onChange={(e) => setParametres({ ...parametres, maintenance_message: e.target.value })}
                      placeholder="Le site est actuellement en maintenance. Nous serons de retour très bientôt !"
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                    <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                      Message affiché aux visiteurs lorsque le mode maintenance est activé
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-[#E8E0D5] pt-6 mt-6">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Frais de livraison</h3>
                <div className="mb-4">
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={parametres.frais_livraison_active === '1' || parametres.frais_livraison_active === 1}
                      onChange={(e) => setParametres({ ...parametres, frais_livraison_active: e.target.checked ? '1' : '0' })}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4A574] rounded focus:ring-[#D4AF37]"
                    />
                    <span className="luxury-text text-[#5C4033]">Activer les frais de livraison</span>
                  </label>
                  <div>
                    <label className="block mb-2 luxury-text text-[#5C4033]">Montant des frais de livraison (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      value={parametres.frais_livraison_montant || '1500'}
                      onChange={(e) => setParametres({ ...parametres, frais_livraison_montant: e.target.value })}
                      placeholder="1500"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                      Montant fixe des frais de livraison à ajouter à chaque commande (par défaut: 1500 FCFA)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t-2 border-[#E8E0D5] pt-6 mt-6">
                <h3 className="luxury-title text-xl text-[#3D2817] mb-4">Réinitialisation du Site</h3>
                <p className="luxury-text text-[#8B6F47] mb-4">
                  Cette action supprimera <strong>TOUS</strong> les articles du site. Cette action est irréversible.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!token) {
                      alert('Vous devez être connecté pour effectuer cette action. Veuillez vous reconnecter.');
                      setAuthenticated(false);
                      localStorage.removeItem('admin_token');
                      return;
                    }
                    
                    if (confirm('ATTENTION : Vous êtes sur le point de supprimer TOUS les articles et types. Cette action est irréversible. Êtes-vous sûr ?')) {
                      if (confirm('Dernière confirmation : Supprimer tous les articles et types ?')) {
                        try {
                          const response = await reinitialiserSite(token);
                          alert(response.data.message || 'Site réinitialisé avec succès');
                          // Recharger les données après réinitialisation
                          await loadData(token);
                        } catch (err: any) {
                          if (err.response?.status === 401) {
                            alert('Votre session a expiré. Veuillez vous reconnecter.');
                            setAuthenticated(false);
                            localStorage.removeItem('admin_token');
                            localStorage.removeItem('admin_username');
                            setToken(null);
                            setCurrentAdmin(null);
                          } else {
                            alert(err.response?.data?.error || 'Erreur lors de la réinitialisation');
                          }
                        }
                      }
                    }
                  }}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md font-medium luxury-text text-sm uppercase tracking-wider"
                >
                  Réinitialiser le site (Supprimer tous les articles et types)
                </button>
              </div>

              <button
                type="submit"
                className="mt-6 luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-8 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                Enregistrer les paramètres
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer Admin Professionnel */}
      <footer className="border-t border-[#E5E5E5] bg-white/95 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/logo/LOGO.png"
                alt="SAFIYA BOUTIQUE"
                className="h-8 w-auto object-contain opacity-70"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div>
                <p className="luxury-text text-xs text-[#8B7355]">SAFIYA BOUTIQUE</p>
                <p className="luxury-text text-xs text-[#8B7355]/70">Panel d'administration</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 luxury-text text-xs text-[#8B7355] hover:text-[#1A1A1A] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Voir le site
              </a>
              <div className="h-4 w-px bg-[#E5E5E5]"></div>
              <p className="luxury-text text-xs text-[#8B7355]/70">
                © {new Date().getFullYear()} SAFIYA BOUTIQUE. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Composant pour éditer un contenu simple (texte ou textarea, sans HTML)
function ContenuEditorSimple({ page, token, label, placeholder, type = 'text' }: { page: string; token: string; label: string; placeholder: string; type?: 'text' | 'textarea' }) {
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialContent, setInitialContent] = useState('');

  useEffect(() => {
    loadContenu();
  }, [page, token]);

  const loadContenu = async () => {
    setLoading(true);
    setMessage(null);
    setHasChanges(false);
    try {
      const res = await getContenusLegaux(token);
      if (res.data && typeof res.data === 'object') {
        const contenus = res.data;
        if (contenus[page] !== undefined) {
          const contenuExistant = contenus[page]?.contenu || '';
          setContenu(contenuExistant);
          setInitialContent(contenuExistant);
        } else {
          setContenu('');
          setInitialContent('');
        }
      } else {
        setContenu('');
        setInitialContent('');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement du contenu:', err);
      setContenu('');
      setInitialContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContenu(value);
    setHasChanges(value !== initialContent);
  };

  const handleSave = async () => {
    if (!hasChanges && contenu === initialContent) {
      setMessage({ type: 'info', text: 'Aucune modification à sauvegarder.' });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await updateContenuLegal(page, contenu, token);
      await loadContenu();
      setMessage({ type: 'success', text: 'Contenu sauvegardé avec succès ! La page a été mise à jour.' });
      setTimeout(() => setMessage(null), 5000);
      setHasChanges(false);
    } catch (err: any) {
      console.error('❌ Erreur lors de la sauvegarde:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la sauvegarde';
      setMessage({ type: 'error', text: `Erreur: ${errorMsg}` });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Voulez-vous vraiment réinitialiser ce contenu ? Le contenu actuel sera supprimé.')) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await deleteContenuLegal(page, token);
      await loadContenu();
      setMessage({ type: 'success', text: 'Contenu réinitialisé avec succès !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Erreur lors de la réinitialisation:', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la réinitialisation' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B7355]"></div>
        <p className="luxury-text text-sm text-[#8B6F47] mt-4">Chargement du contenu...</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block luxury-text text-sm text-[#5C4033] mb-2 font-semibold">{label}</label>
      <p className="luxury-text text-xs text-[#8B6F47] mb-4">
        Éditez le texte. Vos modifications seront immédiatement visibles sur le site après sauvegarde.
      </p>
      
      {type === 'textarea' ? (
        <textarea
          value={contenu}
          onChange={handleChange}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm sm:text-base"
        />
      ) : (
        <input
          type="text"
          value={contenu}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border-2 border-[#D4A574]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all luxury-text text-sm sm:text-base"
        />
      )}

      {hasChanges && (
        <div className="mb-3 mt-3 p-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs luxury-text">
          ⚠️ Vous avez des modifications non sauvegardées
        </div>
      )}

      {message && (
        <div className={`mt-3 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : message.type === 'info'
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-3 mt-4 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving || (!hasChanges && contenu === initialContent)}
          className="px-6 py-2 bg-gradient-to-r from-[#8B7355] to-[#D4A574] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed luxury-text text-sm uppercase tracking-wider font-medium"
        >
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 luxury-text text-sm uppercase tracking-wider font-medium"
        >
          🔄 Réinitialiser
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-[#E8E0D5] text-[#3D2817] rounded-lg hover:bg-[#D4C5B5] transition-colors luxury-text text-sm uppercase tracking-wider font-medium inline-flex items-center"
        >
          👁️ Voir la page
        </a>
        <button
          onClick={loadContenu}
          disabled={loading || saving}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 luxury-text text-sm uppercase tracking-wider font-medium"
        >
          🔃 Recharger
        </button>
      </div>
    </div>
  );
}

// Composant pour éditer un contenu légal
function ContenuEditor({ page, token, label, placeholder }: { page: string; token: string; label: string; placeholder: string }) {
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialContent, setInitialContent] = useState('');

  useEffect(() => {
    loadContenu();
  }, [page, token]);

  const loadContenu = async () => {
    setLoading(true);
    setMessage(null);
    setHasChanges(false);
    try {
      // Charger depuis l'API admin (contenu éditable)
      const res = await getContenusLegaux(token);
      console.log('✅ Contenus chargés:', res.data);
      
      if (res.data && typeof res.data === 'object') {
        const contenus = res.data;
        console.log('📄 Page recherchée:', page);
        console.log('📋 Contenu trouvé:', contenus[page]);
        
        // La route retourne toujours les pages attendues, même si elles n'existent pas encore
        if (contenus[page] !== undefined) {
          // Le contenu existe dans la réponse (même si vide ou null)
          const contenuExistant = contenus[page]?.contenu || '';
          console.log('✅ Contenu chargé:', contenuExistant.length, 'caractères');
          setContenu(contenuExistant);
          setInitialContent(contenuExistant);
        } else {
          console.log('⚠️ Page non trouvée dans la réponse');
          // La page n'est pas dans la réponse, on laisse le champ vide
          setContenu('');
          setInitialContent('');
        }
      } else {
        console.log('⚠️ Format de réponse inattendu');
        setContenu('');
        setInitialContent('');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement du contenu:', err);
      console.error('Détails:', err.response?.data);
      // En cas d'erreur réseau ou serveur, on laisse le champ vide
      const errorMsg = err.response?.data?.error || err.message || 'Erreur lors du chargement';
      // On ne montre l'erreur que si c'est vraiment un problème serveur
      if (err.response?.status !== 404) {
        setMessage({ type: 'error', text: errorMsg });
      }
      setContenu('');
      setInitialContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setContenu(value);
    setHasChanges(value !== initialContent);
  };

  const handleSave = async () => {
    if (!hasChanges && contenu === initialContent) {
      setMessage({ type: 'info', text: 'Aucune modification à sauvegarder.' });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      console.log('💾 Sauvegarde du contenu pour la page:', page);
      console.log('📝 Taille du contenu:', contenu.length, 'caractères');
      
      const response = await updateContenuLegal(page, contenu, token);
      console.log('✅ Réponse de sauvegarde:', response.data);
      
      // Recharger le contenu pour vérifier que ça a bien été sauvegardé
      await loadContenu();
      
      setMessage({ type: 'success', text: 'Contenu sauvegardé avec succès ! La page a été mise à jour.' });
      setTimeout(() => setMessage(null), 5000);
      setHasChanges(false);
    } catch (err: any) {
      console.error('❌ Erreur lors de la sauvegarde:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la sauvegarde';
      setMessage({ type: 'error', text: `Erreur: ${errorMsg}` });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Voulez-vous vraiment réinitialiser ce contenu ? Le contenu actuel sera supprimé.')) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await deleteContenuLegal(page, token);
      await loadContenu(); // Recharger après réinitialisation
      setMessage({ type: 'success', text: 'Contenu réinitialisé avec succès !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Erreur lors de la réinitialisation:', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la réinitialisation' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B7355]"></div>
        <p className="luxury-text text-sm text-[#8B6F47] mt-4">Chargement du contenu...</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block luxury-text text-sm text-[#5C4033] mb-2 font-semibold">{label}</label>
      <p className="luxury-text text-xs text-[#8B6F47] mb-4">
        Éditez le contenu visuellement avec la barre d'outils. Vos modifications seront immédiatement visibles sur le site après sauvegarde.
      </p>
      
      {/* Éditeur React Quill */}
      <div className="mb-4">
        <QuillEditor
          value={contenu}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </div>

      {hasChanges && (
        <div className="mb-3 p-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs luxury-text">
          ⚠️ Vous avez des modifications non sauvegardées
        </div>
      )}

      {message && (
        <div className={`mt-3 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : message.type === 'info'
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-3 mt-4 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving || (!hasChanges && contenu === initialContent)}
          className="px-6 py-2 bg-gradient-to-r from-[#8B7355] to-[#D4A574] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed luxury-text text-sm uppercase tracking-wider font-medium"
        >
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 luxury-text text-sm uppercase tracking-wider font-medium"
        >
          🔄 Réinitialiser
        </button>
        <a
          href={`/${page === 'a-propos' ? 'a-propos' : page === 'mentions-legales' ? 'mentions-legales' : 'politique-de-confidentialite'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-[#E8E0D5] text-[#3D2817] rounded-lg hover:bg-[#D4C5B5] transition-colors luxury-text text-sm uppercase tracking-wider font-medium inline-flex items-center"
        >
          👁️ Voir la page
        </a>
        <button
          onClick={loadContenu}
          disabled={loading || saving}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 luxury-text text-sm uppercase tracking-wider font-medium"
        >
          🔃 Recharger
        </button>
      </div>
    </div>
  );
}

