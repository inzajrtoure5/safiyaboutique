'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Pack } from '../app/type';

type PackCardProps = {
  pack: Pack;
  onAcheter: (pack: Pack) => void;
  onDetail: (pack: Pack) => void;
};

export default function PackCard({ pack, onAcheter, onDetail }: PackCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // ✅ Fonction pour construire les URLs d'images
  const getImageUrl = (img: string | null): string | null => {
    if (!img) return null;
    
    if (img.startsWith('http')) return img;
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://safiyaboutique-utvv.onrender.com';
    const cleanPath = img.startsWith('/') ? img : `/${img}`;
    
    return `${baseUrl}${cleanPath}`;
  };
  
  // Collecter toutes les images des articles du pack
  const images: string[] = [];
  if (pack.articles && Array.isArray(pack.articles)) {
    pack.articles.forEach((article: any) => {
      if (article && article.image_principale) {
        const imgUrl = getImageUrl(article.image_principale);
        if (imgUrl && !images.includes(imgUrl)) images.push(imgUrl);
      }
      if (article && article.images && Array.isArray(article.images)) {
        article.images.forEach((img: string) => {
          const imgUrl = getImageUrl(img);
          if (imgUrl && !images.includes(imgUrl)) images.push(imgUrl);
        });
      }
    });
  }

  // Carrousel automatique
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-[#E5E5E5]">
      <div className="relative w-full h-48 sm:h-64 md:h-80 bg-[#FAFAFA] flex items-center justify-center overflow-hidden">
        {images.length > 0 ? (
          <Image
            src={images[currentImageIndex]}
            alt={pack.nom}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('Pack image failed to load:', images[currentImageIndex]);
              target.style.opacity = '0.5';
            }}
          />
        ) : (
          <span className="text-[#8B7355]/40 luxury-text text-lg">Pas d'image</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Indicateur carrousel */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 md:p-5 space-y-1">
        <h3 className="luxury-title text-sm sm:text-base md:text-lg text-[#1A1A1A] line-clamp-2 min-h-[2.5rem] font-semibold">{pack.nom}</h3>
        
        <div className="flex items-baseline justify-between">
          <div>
            {pack.prix_original && parseFloat(String(pack.prix_original)) > parseFloat(String(pack.prix)) ? (
              <div>
                <p className="text-xs sm:text-sm md:text-base text-[#8B7355] line-through luxury-text font-semibold">{parseFloat(String(pack.prix_original)).toLocaleString()} FCFA</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-[#1A1A1A] luxury-text">{pack.prix.toLocaleString()} FCFA</p>
              </div>
            ) : (
              <p className="text-base sm:text-lg md:text-xl font-bold text-[#1A1A1A] luxury-text">{pack.prix.toLocaleString()} FCFA</p>
            )}
          </div>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">
            Pack
          </span>
        </div>
        
        <div className="flex space-x-2 sm:space-x-3 pt-2">
          <button
            onClick={() => onAcheter(pack)}
            className="flex-1 py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-sm transition-all duration-300 font-medium text-[10px] sm:text-xs uppercase tracking-wider bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]"
          >
            Ajouter au panier
          </button>
          <button
            onClick={() => onDetail(pack)}
            className="flex-1 bg-white border border-[#E5E5E5] text-[#1A1A1A] py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-sm hover:bg-[#FAFAFA] hover:border-[#8B7355] transition-all duration-300 font-medium text-[10px] sm:text-xs uppercase tracking-wider"
          >
            Détails
          </button>
        </div>
      </div>
    </div>
  );
}