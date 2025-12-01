'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pack, Article } from '../app/type';



interface PackModalProps {
  pack: Pack | null;
  onClose: () => void;
  onAcheter: (pack: Pack) => void;
}

export default function PackModal({ pack, onClose, onAcheter }: PackModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!pack) return null;

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

  // Réinitialiser l'index quand le pack change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [pack.id]);

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8E0D5] animate-slide-up">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E8E0D5] p-6 flex justify-between items-center z-10">
          <h2 className="luxury-title text-3xl text-[#3D2817]">{pack.nom}</h2>
          <button
            onClick={onClose}
            className="text-[#8B6F47] hover:text-[#5C4033] text-3xl transition-all duration-300 hover:rotate-90 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F1EB]"
          >
            ×
          </button>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="relative w-full h-96 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-[#E8E0D5] shadow-lg">
                {images.length > 0 ? (
                  <Image
                    src={images[currentImageIndex]}
                    alt={pack.nom}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="luxury-text text-[#8B6F47]/40 text-lg">Pas d'image</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-24 h-24 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all duration-300 ${
                        currentImageIndex === index ? 'border-[#D4AF37] shadow-lg scale-105' : 'border-[#E8E0D5] hover:border-[#D4A574]'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${pack.nom} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                {pack.prix_original && parseFloat(String(pack.prix_original)) > parseFloat(String(pack.prix)) ? (
                  <div>
                    <p className="text-lg text-[#8B7355] line-through luxury-text font-semibold mb-1">{parseFloat(String(pack.prix_original)).toLocaleString()} FCFA</p>
                    <p className="luxury-title text-4xl font-bold text-[#1A1A1A] mb-2">{pack.prix.toLocaleString()} FCFA</p>
                  </div>
                ) : (
                  <p className="luxury-title text-4xl font-bold text-[#1A1A1A] mb-2">{pack.prix.toLocaleString()} FCFA</p>
                )}
              </div>
              
              {pack.description && (
                <div className="border-t border-b border-[#E8E0D5] py-6">
                  <h3 className="luxury-title text-xl text-[#3D2817] mb-3">Description</h3>
                  <p className="luxury-text text-[#5C4033] leading-relaxed">{pack.description}</p>
                </div>
              )}

              <div>
                <h3 className="luxury-title text-xl text-[#3D2817] mb-3">Contenu du pack ({pack.nombre_articles} articles)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {pack.articles.map((article: any, index: number) => {
                    const quantite = article.quantite || 1;
                    return (
                      <div key={`${article.id || index}-${quantite}`} className="bg-[#FAF7F0] rounded-lg p-4 border border-[#E8E0D5] relative">
                        <span className="absolute top-2 right-2 bg-[#1A1A1A] text-white text-xs font-medium px-2 py-1 rounded-full z-10">
                          ×{quantite}
                        </span>
                        {article.image_principale && (
                          <div className="relative w-full h-24 mb-2 rounded overflow-hidden">
                            <Image
                              src={article.image_principale}
                              alt={article.nom}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <p className="luxury-text text-sm text-[#3D2817] font-semibold pr-12">{article.nom}</p>
                        <p className="luxury-text text-xs text-[#8B6F47]">
                          {article.prix?.toLocaleString()} FCFA / unité
                          {quantite > 1 && (
                            <span className="block mt-1 text-[#1A1A1A] font-medium">
                              Total: {quantite} × {article.prix?.toLocaleString()} = {(article.prix * quantite).toLocaleString()} FCFA
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  onAcheter(pack);
                  onClose();
                }}
                className="w-full luxury-text text-sm uppercase tracking-wider bg-[#1A1A1A] text-white py-4 px-8 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

