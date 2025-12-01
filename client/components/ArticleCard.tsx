'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Pack, Article } from '../app/type';


type ArticleCardProps = {
  article: Article;
  onAcheter: (article: Article) => void;
  onDetail: (article: Article) => void;
};


export default function ArticleCard({ article, onAcheter, onDetail }: ArticleCardProps) {
  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-[#E5E5E5]">
      <div className="relative w-full h-48 sm:h-64 md:h-80 bg-[#FAFAFA] flex items-center justify-center overflow-hidden">
        {article.image_principale ? (
          <Image
            src={article.image_principale}
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
        <div className="flex items-start justify-between gap-2">
          <h3 className="luxury-title text-sm sm:text-base md:text-lg text-[#1A1A1A] line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] flex-1 font-semibold">{article.nom}</h3>
          {article.indisponible === 1 && (
            <span className="bg-[#8B7355] text-white text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
              Indisponible
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            {article.prix_original && parseFloat(String(article.prix_original)) > parseFloat(String(article.prix)) ? (
              <div>
                <p className="text-xs sm:text-sm md:text-base text-[#8B7355] line-through luxury-text font-semibold">{parseFloat(String(article.prix_original)).toLocaleString()} FCFA</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-[#1A1A1A] luxury-text">{article.prix.toLocaleString()} FCFA</p>
              </div>
            ) : (
              <p className="text-base sm:text-lg md:text-xl font-bold text-[#1A1A1A] luxury-text">{article.prix.toLocaleString()} FCFA</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2 sm:space-x-3 pt-2">
          <button
            onClick={() => onAcheter(article)}
            disabled={article.indisponible === 1}
            className={`flex-1 py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-sm transition-all duration-300 font-medium text-[10px] sm:text-xs uppercase tracking-wider ${
              article.indisponible === 1
                ? 'bg-[#E5E5E5] text-[#8B7355] cursor-not-allowed opacity-60'
                : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
            }`}
          >
            Ajouter au panier
          </button>
          <button
            onClick={() => onDetail(article)}
            className="flex-1 bg-white border border-[#E5E5E5] text-[#1A1A1A] py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-sm hover:bg-[#FAFAFA] hover:border-[#8B7355] transition-all duration-300 font-medium text-[10px] sm:text-xs uppercase tracking-wider"
          >
            Détails
          </button>
        </div>
      </div>
    </div>
  );
}

