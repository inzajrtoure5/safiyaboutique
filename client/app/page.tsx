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
import { getArticles, enregistrerVisiteur, getPACs, getContenuLegalPublic } from '@/lib/api';
import { usePanier } from '@/contexts/PanierContext';
import { Article, Pack } from '../app/type'; // adapte le chemin selon l’emplacement de types.ts


export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

    Promise.all([getPACs(), loadAccueilParams()])
      .then(([packsRes]) => {
        setPacks((packsRes.data || []).filter((p: Pack) => Number(p.actif) === 1 && p.created_by === 'boutique'));
      })
      .catch((err) => {
        console.error("Erreur lors du chargement:", err);
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

    const ARTICLES_PAGE_SIZE = 12;
    const params: any = {};
    if (selectedType && selectedType !== -1) params.type_id = selectedType;
    if (searchTerm) params.search = searchTerm;
    params.page = 1;
    params.limit = ARTICLES_PAGE_SIZE;

    setLoading(true);
    setPage(1);

    getArticles(params)
      .then((res) => {
        const data = res.data;
        const items: Article[] = Array.isArray(data) ? data : (data?.items || []);
        setArticles(items);
        setTotalPages(Array.isArray(data) ? 1 : Number(data?.totalPages || 1));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedType, searchTerm]);

  const fetchPage = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(totalPages || 1, nextPage));

    const ARTICLES_PAGE_SIZE = 12;
    const params: any = {};
    if (selectedType && selectedType !== -1) params.type_id = selectedType;
    if (searchTerm) params.search = searchTerm;
    params.page = safePage;
    params.limit = ARTICLES_PAGE_SIZE;

    setLoading(true);
    getArticles(params)
      .then((res) => {
        const data = res.data;
        const items: Article[] = Array.isArray(data) ? data : (data?.items || []);
        setArticles(items);
        setTotalPages(Array.isArray(data) ? 1 : Number(data?.totalPages || 1));
        setPage(safePage);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} onAcheter={handleAcheter} onDetail={handleDetail} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 mt-10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchPage(page - 1)}
                        disabled={page <= 1 || loading}
                        className="border border-[#E5E5E5] text-[#1A1A1A] px-4 py-2 rounded-sm hover:bg-[#FAFAFA] transition-all duration-300 text-xs uppercase tracking-wider disabled:opacity-50"
                      >
                        Précédent
                      </button>

                      {(() => {
                        const maxButtons = 5;
                        const safeTotal = Math.max(1, totalPages);
                        const start = Math.max(1, Math.min(page - 2, safeTotal - maxButtons + 1));
                        const end = Math.min(safeTotal, start + maxButtons - 1);

                        const pagesToShow: number[] = [];
                        for (let p = start; p <= end; p += 1) pagesToShow.push(p);

                        return pagesToShow.map((p) => (
                          <button
                            key={p}
                            onClick={() => fetchPage(p)}
                            disabled={loading}
                            className={
                              p === page
                                ? 'bg-[#1A1A1A] text-white w-10 h-10 rounded-sm font-semibold text-sm'
                                : 'border border-[#E5E5E5] text-[#1A1A1A] w-10 h-10 rounded-sm hover:bg-[#FAFAFA] transition-all duration-300 text-sm'
                            }
                          >
                            {p}
                          </button>
                        ));
                      })()}

                      <button
                        onClick={() => fetchPage(page + 1)}
                        disabled={page >= totalPages || loading}
                        className="border border-[#E5E5E5] text-[#1A1A1A] px-4 py-2 rounded-sm hover:bg-[#FAFAFA] transition-all duration-300 text-xs uppercase tracking-wider disabled:opacity-50"
                      >
                        Suivant
                      </button>
                    </div>

                    <div className="text-xs text-[#8B7355] luxury-text">
                      Page {page} / {totalPages}
                    </div>
                  </div>
                )}
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
