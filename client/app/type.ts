// app/types.ts
export type Article = {
  id: number;
  type_id: number;
  nom: string;
  prix: number;          // number obligatoire
  prix_original?: number; 
  description?: string;
  image_principale?: string;
  images?: string[];
  disponible?: number;
  indisponible?: number;
  created_at?: string;
  type_nom?: string;
  quantite?: number;
};

export type Pack = {
  id: number;
  nom: string;
  description?: string;
  type_id?: number;
  prix: number;          // number obligatoire
  prix_original?: number;
  nombre_articles: number;
  articles?: { article_id: number; quantite: number }[];
  actif: number;
  created_by?: string;
  created_at?: string;
};
