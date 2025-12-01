'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getArticle } from '@/lib/api';

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = parseInt(params.id as string);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (articleId) {
      getArticle(articleId)
        .then((res) => {
          setArticle(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [articleId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center">Article non trouvé</div>;
  }

  const images = article.images && article.images.length > 0 
    ? article.images 
    : article.image_principale 
    ? [article.image_principale] 
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 lg:p-8">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Images */}
            <div>
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {images.length > 0 ? (
                  <Image
                    src={images[currentImageIndex]}
                    alt={article.nom}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <span className="text-gray-400">Pas d'image</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded border-2 ${
                        currentImageIndex === index ? 'border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${article.nom} ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{article.nom}</h1>
              <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-4 md:mb-6">{article.prix} FCFA</p>
              
              {article.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-700">{article.description}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="flex-1 bg-blue-600 text-white py-3 px-4 md:px-6 rounded hover:bg-blue-700 transition text-sm md:text-base">
                  Ajouter au panier
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 md:px-6 rounded hover:bg-gray-300 transition text-sm md:text-base">
                  Acheter maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

