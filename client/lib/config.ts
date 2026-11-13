/**
 * Configuration centralisée des URLs du backend.
 * - API_URL  : base des appels REST (inclut /api)
 * - BASE_URL : racine du serveur, pour les assets /uploads, /logo, etc.
 */
export const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/** Supprime le segment "/api" final pour obtenir l'URL racine du serveur. */
export const BASE_URL: string = API_URL.replace(/\/api\/?$/, '');

