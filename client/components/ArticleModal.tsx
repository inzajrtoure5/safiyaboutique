'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getArticle, getPackVisiteursPublic } from '@/lib/api';
import { Pack, Article } from '../app/type';

interface ArticleModalProps {
  articleId: number | null;
  onClose: () => void;
  onAcheter: (article: any) => void;
}

export default function ArticleModal({ articleId, onClose, onAcheter }: ArticleModalProps) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [packConfig, setPackConfig] = useState<any>(null);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    if (articleId) {
      setLoading(true);
      Promise.all([
        getArticle(articleId),
        getPackVisiteursPublic()
      ])
        .then(([articleRes, packsRes]) => {
          const articleData = articleRes.data;
          setArticle(articleData);
          
          // Vérifier l'éligibilité au pack parmi tous les packs actifs
          const packsActifs = packsRes.data || [];
          if (packsActifs.length > 0) {
            // Prendre le premier pack actif pour l'affichage (on pourrait améliorer pour prendre le meilleur pack)
            const premierPack = packsActifs[0];
            setPackConfig(premierPack);
            
            // Vérifier si l'article est éligible à au moins un pack
            let eligible = false;
            for (const pack of packsActifs) {
              if (pack.mode === 'articles') {
                if (pack.articles_ids && pack.articles_ids.includes(articleData.id)) {
                  eligible = true;
                  setPackConfig(pack); // Utiliser ce pack pour l'affichage
                  break;
                }
              } else if (pack.mode === 'type') {
                if (pack.type_id && articleData.type_id === pack.type_id) {
                  eligible = true;
                  setPackConfig(pack); // Utiliser ce pack pour l'affichage
                  break;
                }
              }
            }
            
            setIsEligible(eligible);
          } else {
            setPackConfig(null);
            setIsEligible(false);
          }
          
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [articleId]);

  if (!articleId) return null;

  const images = article?.images && article.images.length > 0 
    ? article.images 
    : article?.image_principale 
    ? [article.image_principale] 
    : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8E0D5] animate-slide-up">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            <p className="luxury-text text-[#8B6F47] mt-4">Chargement...</p>
          </div>
        ) : article ? (
          <>
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E8E0D5] p-6 flex justify-between items-center z-10">
              <h2 className="luxury-title text-3xl text-[#3D2817]">{article.nom}</h2>
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
                        alt={article.nom}
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
                            alt={`${article.nom} ${index + 1}`}
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
                    <p className="luxury-title text-4xl font-bold text-[#1A1A1A] mb-2">{article.prix.toLocaleString()} FCFA</p>
                  </div>
                  {isEligible && packConfig && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                      <p className="luxury-text text-sm font-semibold text-green-800">
                        ✅ Éligible à un pack pour bénéficier d'un rabais de {packConfig.reduction}%
                      </p>
                      <p className="luxury-text text-xs text-green-700 mt-1">
                        Ajoutez {packConfig.nombre_articles} articles éligibles dans votre panier pour créer un pack avec réduction !
                      </p>
                    </div>
                  )}
                  {article.description && (
                    <div className="border-t border-b border-[#E8E0D5] py-6">
                      <h3 className="luxury-title text-xl text-[#3D2817] mb-3">Description</h3>
                      <p className="luxury-text text-[#5C4033] leading-relaxed">{article.description}</p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      onAcheter(article);
                      onClose();
                    }}
                    className="w-full luxury-text text-sm uppercase tracking-wider bg-[#1A1A1A] text-white py-4 px-8 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">Article non trouvé</div>
        )}
      </div>
    </div>
  );
}

