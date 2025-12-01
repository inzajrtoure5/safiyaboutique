'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import ArticleModal from '@/components/ArticleModal';
import PackCard from '@/components/PackCard';
import PackModal from '@/components/PackModal';
import Maintenance from '@/components/Maintenance';
import AlerteFetes from '@/components/AlerteFetes';
import { getArticles, getTypesArticles, enregistrerVisiteur, getPACs, getContenuLegalPublic } from '@/lib/api';
import { usePanier } from '@/contexts/PanierContext';
import { Article, Pack } from '../app/type'; // adapte le chemin selon l’emplacement de types.ts


export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
 const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const { ajouterAuPanier } = usePanier();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [accueilTitre, setAccueilTitre] = useState('Collection Exclusive');
  const [accueilDescription, setAccueilDescription] = useState(
    "Boutique féminine de qualité : découvrez une sélection élégante d'articles luxueux, modernes et traditionnels. Sacs, montres, chaussures et bien plus encore pour tous les goûts et tous les budgets."
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadAccueilParams = async () => {
      try {
        const [titreRes, descriptionRes] = await Promise.all([
          getContenuLegalPublic('accueil-titre'),
          getContenuLegalPublic('accueil-description'),
        ]);

        if (titreRes.data?.contenu?.trim()) setAccueilTitre(titreRes.data.contenu);
        if (descriptionRes.data?.contenu?.trim()) setAccueilDescription(descriptionRes.data.contenu);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres d'accueil:", error);
      }
    };

    enregistrerVisiteur({
      ip: '',
      localisation: 'Inconnue',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }).catch((err) => console.error("Erreur visiteur:", err));

    Promise.all([getArticles(), getPACs(), loadAccueilParams()])
      .then(([articlesRes, packsRes]) => {
        setArticles(articlesRes.data || []);
        setPacks((packsRes.data || []).filter((p: Pack) => Number(p.actif) === 1 && p.created_by === 'boutique'));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement:", err);
        setLoading(false);
      });

    const interval = setInterval(loadAccueilParams, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedType === -1) {
      setArticles([]);
      setLoading(false);
      return;
    }

    const params: any = {};
    if (selectedType && selectedType !== -1) params.type_id = selectedType;
    if (searchTerm) params.search = searchTerm;

    setLoading(true);
    getArticles(params)
      .then((res) => {
        setArticles(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedType, searchTerm]);

const handleAcheter = (article: Article) => {
  ajouterAuPanier({
    ...article,
    prix: Number(article.prix) // conversion en number
  });
};
type PanierItem = Article | (Pack & { isPack: true });

  const handleDetail = (article: Article) => setSelectedArticle(article.id);
 const handleAcheterPack = (pack: Pack) => {
  ajouterAuPanier({
    ...pack,
    isPack: true
  } as any); // ou créer un type PanierItem
};
  const handleDetailPack = (pack: Pack) => setSelectedPack(pack);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Maintenance />
      <AlerteFetes />
      <Header onSearch={setSearchTerm} onTypeChange={setSelectedType} />

      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex-1">
        <div className="text-center mb-8 md:mb-16 py-4 md:py-8">
          <h1 className="luxury-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-4 font-light tracking-wide">
            {accueilTitre}
          </h1>
          <p className="luxury-text text-sm sm:text-base md:text-lg text-[#8B7355] max-w-2xl mx-auto px-4 font-light tracking-wide">
            {accueilDescription}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A1A1A]"></div>
            <p className="luxury-text text-[#8B7355] mt-4 font-light">Chargement...</p>
          </div>
        ) : selectedType === -1 ? (
          packs.length > 0 ? (
            <div>
              <h2 className="luxury-title text-2xl md:text-3xl text-[#1A1A1A] mb-4 md:mb-6 font-light px-4 md:px-0">
                Packs Disponibles
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {packs.map((pack) => (
                  <PackCard key={pack.id} pack={pack} onAcheter={handleAcheterPack} onDetail={handleDetailPack} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="luxury-text text-xl text-[#8B7355] font-light">Aucun pack disponible</p>
            </div>
          )
        ) : (
          <>
            {!selectedType && packs.length > 0 && (
              <div className="mb-12">
                <h2 className="luxury-title text-2xl md:text-3xl text-[#1A1A1A] mb-6 font-light px-4 md:px-0">
                  Packs Disponibles
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {packs.map((pack) => (
                    <PackCard key={pack.id} pack={pack} onAcheter={handleAcheterPack} onDetail={handleDetailPack} />
                  ))}
                </div>
              </div>
            )}

            {articles.length > 0 ? (
              <div>
                <h2 className="luxury-title text-2xl md:text-3xl text-[#1A1A1A] mb-6 font-light px-4 md:px-0">
                  Articles Disponibles
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} onAcheter={handleAcheter} onDetail={handleDetail} />
                  ))}
                </div>
              </div>
            ) : selectedType ? (
              <div className="text-center py-20">
                <p className="luxury-text text-xl text-[#8B7355] font-light">
                  Aucun article trouvé pour cette catégorie
                </p>
              </div>
            ) : null}
          </>
        )}
      </main>

      <ArticleModal articleId={selectedArticle} onClose={() => setSelectedArticle(null)} onAcheter={handleAcheter} />

      {selectedPack && (
        <PackModal pack={selectedPack} onClose={() => setSelectedPack(null)} onAcheter={handleAcheterPack} />
      )}

      <Footer />
    </div>
  );
}
