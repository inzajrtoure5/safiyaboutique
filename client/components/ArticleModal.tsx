'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getArticle, getPackVisiteursPublic } from '../lib/api';

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

  // ✅ FONCTION getImageUrl - À PLACER ICI
  const getImageUrl = (img: string | null): string | null => {
    if (!img) return null;
    
    // Si c'est déjà une URL complète
    if (img.startsWith('http')) return img;
    
    // Construire à partir de l'URL de base SANS /api
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://safiyaboutique-utvv.onrender.com';
    
    // Nettoyer le chemin
    const cleanPath = img.startsWith('/') ? img : `/${img}`;
    
    return `${baseUrl}${cleanPath}`;
  };

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

  // ✅ CONSTRUIRE LES IMAGES AVEC getImageUrl
  const images = article?.images && article.images.length > 0 
    ? article.images.map((img: string) => getImageUrl(img)).filter(Boolean)
    : article?.image_principale 
    ? [getImageUrl(article.image_principale)].filter(Boolean)
    : [];

  const mainImage = images[currentImageIndex] || null;

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
                {/* SECTION IMAGE */}
                <div className="flex flex-col gap-4">
                  {mainImage ? (
                    <div className="relative w-full aspect-square bg-[#FAFAFA] rounded-lg overflow-hidden border border-[#E8E0D5]">
                      <Image
                        src={mainImage}
                        alt={article.nom}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.error('Modal image failed to load:', mainImage);
                          target.style.opacity = '0.5';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square bg-[#FAFAFA] rounded-lg overflow-hidden border border-[#E8E0D5] flex items-center justify-center">
                      <span className="text-[#8B7355]/40 luxury-text">Pas d'image</span>
                    </div>
                  )}

                  {/* Carrousel d'images */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-[#D4AF37]'
                              : 'border-[#E8E0D5] hover:border-[#8B6F47]'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${article.nom} - ${index}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION DÉTAILS */}
                <div className="flex flex-col gap-6">
                  {/* Prix */}
                  <div>
                    {article.prix_original && parseFloat(String(article.prix_original)) > parseFloat(String(article.prix)) ? (
                      <div>
                        <p className="text-sm text-[#8B7355] line-through luxury-text font-semibold mb-2">
                          {parseFloat(String(article.prix_original)).toLocaleString()} FCFA
                        </p>
                        <p className="text-3xl font-bold text-[#1A1A1A] luxury-title">
                          {parseFloat(String(article.prix)).toLocaleString()} FCFA
                        </p>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-[#1A1A1A] luxury-title">
                        {parseFloat(String(article.prix)).toLocaleString()} FCFA
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {article.description && (
                    <div>
                      <h3 className="font-semibold text-[#3D2817] mb-2">Description</h3>
                      <p className="text-[#555] leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: article.description }} />
                    </div>
                  )}

                  {/* Statut indisponible */}
                  {article.indisponible === 1 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 font-semibold">⚠️ Article actuellement indisponible</p>
                    </div>
                  )}

                  {/* Info Pack */}
                  {isEligible && packConfig && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-700 font-semibold mb-2">✅ Eligible au pack</p>
                      <p className="text-green-600 text-sm">
                        Réduction de {packConfig.reduction}% à partir de {packConfig.nombre_articles} articles
                      </p>
                    </div>
                  )}

                  {/* Bouton Ajouter au panier */}
                  <button
                    onClick={() => onAcheter(article)}
                    disabled={article.indisponible === 1}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg uppercase tracking-wider transition-all duration-300 ${
                      article.indisponible === 1
                        ? 'bg-[#E5E5E5] text-[#8B7355] cursor-not-allowed opacity-60'
                        : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] active:scale-95'
                    }`}
                  >
                    {article.indisponible === 1 ? 'Indisponible' : 'Ajouter au panier'}
                  </button>

                  {/* Info supplémentaire */}
                  <div className="text-xs text-[#8B7355] text-center">
                    {article.indisponible !== 1 && '✨ Livraison rapide disponible'}
                  </div>
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