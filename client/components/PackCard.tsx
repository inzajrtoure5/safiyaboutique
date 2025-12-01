'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pack, Article } from '../app/type'; // adapte le chemin selon ton projet


type PackCardProps = {
  pack: Pack;
  onAcheter: (pack: Pack) => void;
  onDetail: (pack: Pack) => void;
};


export default function PackCard({ pack, onAcheter, onDetail }: PackCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Collecter toutes les images des articles du pack
  const images: string[] = [];
  if (pack.articles && Array.isArray(pack.articles)) {
    pack.articles.forEach((article: any) => {
      if (article && article.image_principale) {
        images.push(article.image_principale);
      }
      if (article && article.images && Array.isArray(article.images)) {
        article.images.forEach((img: string) => {
          if (img && !images.includes(img)) images.push(img);
        });
      }
    });
  }

  // Carrousel automatique
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change toutes les 3 secondes

    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-[#E5E5E5]">
      {/* Carrousel de photos */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 bg-[#FAFAFA] overflow-hidden">
        {/* Badge Pack Boutique - Doré */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-wider rounded shadow-lg">
          Pack
        </div>
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={`${pack.nom} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover transition-opacity duration-500"
              priority
            />
            {/* Boutons de navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-all z-10"
                  aria-label="Image précédente"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-all z-10"
                  aria-label="Image suivante"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Indicateurs */}
                <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white w-6 sm:w-8' : 'bg-white/50 w-1.5 sm:w-2'
                      }`}
                      aria-label={`Aller à l'image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <span className="text-[#8B7355]/40 luxury-text text-lg">Pas d'image</span>
        )}
      </div>
      
      {/* Infos avec boutons */}
      <div className="p-3 sm:p-4 md:p-5 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="luxury-title text-sm sm:text-base md:text-lg text-[#1A1A1A] line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] flex-1 font-semibold">{pack.nom}</h3>
        </div>
        {/* Badge nombre d'articles */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-[#1A1A1A] text-white">
            {pack.nombre_articles} {pack.nombre_articles > 1 ? 'articles' : 'article'}
          </span>
        </div>
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
        </div>
        <div className="flex space-x-2 sm:space-x-3 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAcheter(pack);
            }}
            className="flex-1 bg-[#1A1A1A] text-white py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-sm hover:bg-[#2A2A2A] transition-all duration-300 font-medium text-[10px] sm:text-xs uppercase tracking-wider"
          >
            Ajouter au panier
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetail(pack);
            }}
            className="flex-1 bg-white border border-[#E5E5E5] text-[#1A1A1A] py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-sm hover:bg-[#FAFAFA] hover:border-[#8B7355] transition-all duration-300 font-medium text-[10px] sm:text-xs uppercase tracking-wider"
          >
            Détails
          </button>
        </div>
      </div>
    </div>
  );
}

