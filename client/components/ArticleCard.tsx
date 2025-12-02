'use client';

import Image from 'next/image';
import { Article } from '../app/type';

type ArticleCardProps = {
  article: Article;
  onAcheter: (article: Article) => void;
  onDetail: (article: Article) => void;
};

export default function ArticleCard({ article, onAcheter, onDetail }: ArticleCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safiyaboutique-utvv.onrender.com/api';
  const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL || 'https://safiyaboutique-utvv.onrender.com';

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (img: string | null) => {
    if (!img) return null;

    // Si l'image commence par /uploads → on doit utiliser la ROOT URL
    if (img.startsWith('/uploads')) {
      return `${ROOT_URL}${img}`;
    }

    // Si c'est une URL complète → laisser tel quel
    return img;
  };

  const mainImage = getImageUrl(article.image_principale);
  const otherImages = (article.images || []).map(getImageUrl);

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-[#E5E5E5]">
      <div className="relative w-full h-48 sm:h-64 md:h-80 bg-[#FAFAFA] flex items-center justify-center overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={article.nom}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="text-[#8B7355]/40 luxury-text text-lg">Pas d'image</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-3 sm:p-4 md:p-5 space-y-1">
        {/* ... reste du composant */}
      </div>
    </div>
  );
}
