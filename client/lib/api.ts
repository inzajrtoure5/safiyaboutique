import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Articles
export const getArticles = (params?: { type_id?: number; search?: string }) => {
  return api.get('/articles', { params });
};

// Récupérer tous les articles (admin - inclut les indisponibles)
export const getArticlesAdmin = (token: string) => {
  return api.get('/admin/articles', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getArticle = (id: number) => {
  return api.get(`/articles/${id}`);
};

// Types d'articles
export const getTypesArticles = () => {
  return api.get('/types-articles');
};

// Panier
export const calculerTotal = (articles: any[]) => {
  return api.post('/panier/calculer-total', { articles });
};

// Commandes
export const creerCommande = (data: any) => {
  return api.post('/commandes', data);
};

// Pack
export const getPACs = () => {
  return api.get('/pack');
};

export const getPACsAdmin = (token: string) => {
  return api.get('/pack/admin', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const calculerPrixPackClient = (articles: any[], reduction: number, nombre_articles?: number) => {
  return api.post('/pack/calculer-prix-client', { articles, reduction, nombre_articles });
};

export const getParametresPack = () => {
  // Ajouter un cache-busting pour éviter les problèmes de cache (comme pour maintenance)
  return api.get('/pack/parametres', { params: { _t: Date.now() } });
};

// Packs Visiteurs
export const getPackVisiteurs = (token: string) => {
  return api.get('/pack-visiteurs', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPackVisiteursPublic = () => {
  return api.get('/pack-visiteurs/public');
};

export const creerPackVisiteur = (data: any, token: string) => {
  return api.post('/pack-visiteurs', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updatePackVisiteur = (id: number, data: any, token: string) => {
  return api.put(`/pack-visiteurs/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deletePackVisiteur = (id: number, token: string) => {
  return api.delete(`/pack-visiteurs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const togglePackVisiteurActif = (id: number, actif: boolean, token: string) => {
  return api.patch(`/pack-visiteurs/${id}/actif`, { actif }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Récupérer le numéro WhatsApp (public)
export const getWhatsAppNumber = () => {
  return api.get('/admin/whatsapp-number');
};

// Admin
export const login = (username: string, password: string) => {
  return api.post('/auth/login', { username, password });
};

export const getStats = (token: string) => {
  return api.get('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getParametres = (token: string) => {
  return api.get('/admin/parametres', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateParametres = (data: any, token: string) => {
  return api.put('/admin/parametres', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const reinitialiserSite = (token: string) => {
  return api.post('/admin/reinitialiser', {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const reinitialiserStats = (token: string) => {
  return api.post('/admin/reinitialiser-stats', {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Gestion des admins
export const getAdmins = (token: string) => {
  return api.get('/admin/admins', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const creerAdmin = (data: { username: string; password: string }, token: string) => {
  return api.post('/admin/admins', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const supprimerAdmin = (id: number, token: string) => {
  return api.delete(`/admin/admins/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const modifierPasswordAdmin = (id: number, password: string, token: string) => {
  return api.put(`/admin/admins/${id}/password`, { password }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const bloquerAdmin = (id: number, blocked: boolean, token: string) => {
  return api.put(`/admin/admins/${id}/block`, { blocked }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAdminLogs = (token: string, params?: { admin_id?: number; action?: string; limit?: number }) => {
  return api.get('/admin/admin-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: params || {}
  });
};

export const getVisiteurs = (token: string, filters?: { periode?: string; date_debut?: string; date_fin?: string; heure?: string }) => {
  return api.get('/visiteurs', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
};

export const getCommandes = (token: string) => {
  return api.get('/commandes', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const creerArticle = (data: FormData, token: string) => {
  return api.post('/articles', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateArticle = (id: number, data: FormData, token: string) => {
  return api.put(`/articles/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteArticle = (id: number, token: string) => {
  return api.delete(`/articles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const toggleDisponible = (id: number, disponible: boolean, token: string) => {
  return api.patch(`/articles/${id}/disponible`, { disponible }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const toggleIndisponible = (id: number, indisponible: boolean, token: string) => {
  return api.patch(`/articles/${id}/indisponible`, { indisponible }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const creerTypeArticle = (nom: string, token: string) => {
  return api.post('/types-articles', { nom }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const supprimerTypeArticle = (id: number, token: string) => {
  return api.delete(`/types-articles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTypesArticlesAdmin = (token: string) => {
  return api.get('/admin/types-articles', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const creerPAC = (data: any, token: string) => {
  return api.post('/pack', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updatePAC = (id: number, data: any, token: string) => {
  return api.put(`/pack/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const togglePACActif = (id: number, actif: boolean, token: string) => {
  return api.patch(`/pack/${id}/actif`, { actif }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deletePAC = (id: number, token: string) => {
  return api.delete(`/pack/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Visiteurs
export const enregistrerVisiteur = (data: any) => {
  return api.post('/visiteurs', data);
};

// Livraison
export const getFraisLivraison = (token: string) => {
  return api.get('/livraison', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getFraisLivraisonPublic = () => {
  // Ajouter un cache-busting pour forcer le rechargement des communes actives
  return api.get('/livraison/public', { params: { _t: Date.now() } });
};

export const getPrixLivraisonCommune = (commune: string) => {
  return api.get(`/livraison/commune/${encodeURIComponent(commune)}`);
};

export const updatePrixLivraison = (id: number, data: { prix: number; actif?: boolean }, token: string) => {
  return api.put(`/livraison/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const creerCommuneLivraison = (data: { commune: string; prix: number }, token: string) => {
  return api.post('/livraison', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const supprimerCommuneLivraison = (id: number, token: string) => {
  return api.delete(`/livraison/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Contenus légaux
export const getContenusLegaux = (token: string) => {
  return api.get('/admin/contenus-legaux', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getContenuLegal = (page: string, token: string) => {
  return api.get(`/admin/contenus-legaux/${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateContenuLegal = (page: string, contenu: string, token: string) => {
  return api.put(`/admin/contenus-legaux/${page}`, { contenu }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteContenuLegal = (page: string, token: string) => {
  return api.delete(`/admin/contenus-legaux/${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Récupérer un contenu légal public (sans authentification)
export const getContenuLegalPublic = (page: string) => {
  return api.get(`/parametres/contenu-legal/${page}`);
};

export default api;

