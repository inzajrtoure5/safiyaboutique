'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Article {
  id: number;
  nom: string;
  prix: number;
  image_principale?: string;
  quantite?: number;
}

interface PanierContextType {
  panier: Article[];
  ajouterAuPanier: (article: Article) => void;
  retirerDuPanier: (articleId: number) => void;
  modifierQuantite: (articleId: number, quantite: number) => void;
  viderPanier: () => void;
  total: number;
}

const PanierContext = createContext<PanierContextType | undefined>(undefined);

export function PanierProvider({ children }: { children: ReactNode }) {
  const [panier, setPanier] = useState<Article[]>([]);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    try {
      const savedPanier = localStorage.getItem('panier');
      if (savedPanier) {
        const parsedPanier = JSON.parse(savedPanier);
        // S'assurer que c'est un tableau valide
        if (Array.isArray(parsedPanier) && parsedPanier.length > 0) {
          setPanier(parsedPanier);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier depuis localStorage:', error);
      // En cas d'erreur, nettoyer le localStorage corrompu
      localStorage.removeItem('panier');
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    try {
      if (panier.length > 0) {
        localStorage.setItem('panier', JSON.stringify(panier));
      } else {
        // Si le panier est vide, ne pas le sauvegarder (ou le laisser vide)
        localStorage.setItem('panier', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier dans localStorage:', error);
    }
  }, [panier]);

  const ajouterAuPanier = (article: Article) => {
    setPanier((prev) => {
      // Pour les packs, utiliser l'ID + isPack pour éviter les conflits
      const existingIndex = prev.findIndex((a: any) => {
        if ((article as any).isPack && (a as any).isPack) {
          return a.id === article.id;
        }
        return a.id === article.id && !(a as any).isPack && !(article as any).isPack;
      });
      if (existingIndex >= 0) {
        const newPanier = [...prev];
        // Préserver toutes les propriétés de l'article, y compris prix_original pour les packs
        newPanier[existingIndex] = {
          ...newPanier[existingIndex],
          ...article, // Mettre à jour toutes les propriétés au cas où elles changent
          quantite: (newPanier[existingIndex].quantite || 1) + 1,
        };
        return newPanier;
      }
      // Préserver toutes les propriétés de l'article, y compris prix_original pour les packs
      return [...prev, { ...article, quantite: 1 }];
    });
  };

  const retirerDuPanier = (articleId: number) => {
    setPanier((prev) => prev.filter((a) => a.id !== articleId));
  };

  const modifierQuantite = (articleId: number, quantite: number) => {
    // Ne pas permettre de descendre en dessous de 1
    if (quantite < 1) {
      return; // Ne rien faire si on essaie de descendre en dessous de 1
    }
    setPanier((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, quantite } : a))
    );
  };

  const viderPanier = () => {
    setPanier([]);
  };

  const total = panier.reduce(
    (sum, article) => sum + article.prix * (article.quantite || 1),
    0
  );

  return (
    <PanierContext.Provider
      value={{
        panier,
        ajouterAuPanier,
        retirerDuPanier,
        modifierQuantite,
        viderPanier,
        total,
      }}
    >
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier() {
  const context = useContext(PanierContext);
  if (context === undefined) {
    throw new Error('usePanier must be used within a PanierProvider');
  }
  return context;
}

