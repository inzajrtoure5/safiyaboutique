'use client';

import { useState, useEffect } from 'react';
import { creerArticle, updateArticle, getTypesArticlesAdmin } from '@/lib/api';

interface ArticleFormProps {
  article?: any;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  onSwitchToTypes?: () => void;
}

export default function ArticleForm({ article, onClose, onSuccess, token, onSwitchToTypes }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    prix_original: '',
    description: '',
    type_id: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [typesArticles, setTypesArticles] = useState<any[]>([]);

  useEffect(() => {
    getTypesArticlesAdmin(token).then((res) => setTypesArticles(res.data)).catch(console.error);
    if (article) {
      setFormData({
        nom: article.nom || '',
        prix: article.prix || '',
        prix_original: article.prix_original || '',
        description: article.description || '',
        type_id: article.type_id || '',
      });
      // Charger les images existantes
      const allImages: string[] = [];
      if (article.image_principale) {
        allImages.push(article.image_principale);
      }
      if (article.images) {
        try {
          const parsedImages = typeof article.images === 'string' ? JSON.parse(article.images) : article.images;
          if (Array.isArray(parsedImages)) {
            parsedImages.forEach((img: string) => {
              if (img && !allImages.includes(img)) {
                allImages.push(img);
              }
            });
          }
        } catch (e) {
          console.error('Erreur lors du parsing des images:', e);
        }
      }
      setExistingImages(allImages);
    } else {
      setExistingImages([]);
      setImagesToDelete([]);
    }
  }, [article, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier qu'un type est sélectionné
    if (!formData.type_id) {
      alert('Veuillez sélectionner un type d\'article. Si aucun type n\'existe, veuillez d\'abord en créer un dans l\'onglet "Types".');
      return;
    }

    // Vérifier qu'il y a au moins un type disponible
    if (typesArticles.length === 0) {
      alert('Aucun type d\'article disponible. Veuillez d\'abord créer un type d\'article dans l\'onglet "Types" avant d\'ajouter un article.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('nom', formData.nom);
    formDataToSend.append('prix', formData.prix);
    if (formData.prix_original) {
      formDataToSend.append('prix_original', formData.prix_original);
    }
    formDataToSend.append('description', formData.description);
    formDataToSend.append('type_id', formData.type_id);
    images.forEach((img) => formDataToSend.append('images', img));
    // Envoyer la liste des images à supprimer
    if (article && imagesToDelete.length > 0) {
      formDataToSend.append('images_to_delete', JSON.stringify(imagesToDelete));
    }

    try {
      if (article) {
        await updateArticle(article.id, formDataToSend, token);
      } else {
        await creerArticle(formDataToSend, token);
      }
      alert(article ? 'Article modifié avec succès !' : 'Article créé avec succès !');
      // Réinitialiser les images
      setImages([]);
      setImagePreviews([]);
      setExistingImages([]);
      setImagesToDelete([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
      console.error('Erreur:', err);
    }
  };

  // Scroll vers le haut quand le formulaire s'ouvre
  useEffect(() => {
    // Scroller vers le haut du modal quand il s'ouvre
    const modal = document.querySelector('[data-article-form]');
    if (modal) {
      modal.scrollTop = 0;
    }
    // Scroller la page vers le haut aussi
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto" style={{ paddingTop: '1rem' }}>
      <div data-article-form className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto mt-4 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">{article ? 'Modifier' : 'Ajouter'} un article</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">
              Type d'article <span className="text-red-500">*</span>
              {typesArticles.length === 0 && onSwitchToTypes && (
                <span className="ml-2 text-red-500 text-sm">
                  (Aucun type disponible - <button type="button" className="underline" onClick={(e) => { e.preventDefault(); onSwitchToTypes(); }}>Créer un type</button>)
                </span>
              )}
            </label>
            {typesArticles.length === 0 ? (
              <div className="w-full px-3 py-2 border border-red-300 rounded bg-red-50 text-red-700">
                Aucun type d'article disponible. Veuillez d'abord créer un type dans l'onglet "Types".
              </div>
            ) : (
              <select
                value={formData.type_id}
                onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">-- Sélectionner un type (obligatoire) --</option>
                {typesArticles.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nom}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">
                Prix original (FCFA)
                <span className="text-gray-500 text-xs font-normal ml-1">(optionnel)</span>
              </label>
              <input
                type="number"
                value={formData.prix_original}
                onChange={(e) => setFormData({ ...formData, prix_original: e.target.value })}
                placeholder="Ex: 5000"
                className="w-full px-3 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Prix barré affiché si supérieur au prix de vente</p>
            </div>
            <div>
              <label className="block mb-2">
                Prix de vente (FCFA)
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">
              Images
              {article && existingImages.length > 0 && (
                <span className="text-gray-500 text-sm font-normal ml-2">
                  ({existingImages.length - imagesToDelete.length} image(s) actuelle(s))
                </span>
              )}
            </label>
            
            {/* Afficher les images existantes avec possibilité de suppression */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Images actuelles :</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  {existingImages.map((imgUrl, index) => {
                    if (imagesToDelete.includes(imgUrl)) return null;
                    const fullUrl = imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`;
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={fullUrl}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('localhost:5000') && !target.src.startsWith('http')) {
                              target.src = `http://localhost:5000${imgUrl}`;
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagesToDelete([...imagesToDelete, imgUrl]);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Supprimer cette image"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Principale
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {imagesToDelete.length > 0 && (
                  <p className="text-sm text-orange-600 mb-2">
                    {imagesToDelete.length} image(s) seront supprimée(s) lors de l'enregistrement
                  </p>
                )}
              </div>
            )}

            {/* Input pour ajouter de nouvelles images */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImages([...images, ...files]);
                // Créer des prévisualisations pour les nouvelles images
                const newPreviews = files.map(file => URL.createObjectURL(file));
                setImagePreviews([...imagePreviews, ...newPreviews]);
              }}
              className="w-full px-3 py-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sélectionnez une ou plusieurs images pour ajouter/modifier les photos de l'article
            </p>

            {/* Afficher les prévisualisations des nouvelles images */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Nouvelles images à ajouter :</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Nouvelle image ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = images.filter((_, i) => i !== index);
                          const newPreviews = imagePreviews.filter((_, i) => i !== index);
                          setImages(newImages);
                          setImagePreviews(newPreviews);
                          // Libérer l'URL de l'objet
                          URL.revokeObjectURL(preview);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2.5 sm:py-2 px-4 rounded hover:bg-blue-700 text-sm sm:text-base"
            >
              {article ? 'Modifier' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2.5 sm:py-2 px-4 rounded hover:bg-gray-300 text-sm sm:text-base"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

