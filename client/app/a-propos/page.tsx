'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getContenuLegalPublic } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AProposPage() {
  const [contenuPersonnalise, setContenuPersonnalise] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger le contenu depuis la base de données
    getContenuLegalPublic('a-propos')
      .then((res) => {
        if (res.data && res.data.contenu && res.data.contenu.trim() !== '') {
          setContenuPersonnalise(res.data.contenu);
        }
        // Si le contenu est vide, on laisse contenuPersonnalise à null pour afficher le contenu par défaut
      })
      .catch((err) => {
        console.error('Erreur lors du chargement du contenu:', err);
        // En cas d'erreur, on utilise le contenu par défaut
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Si un contenu existe dans la DB, l'afficher
  if (!loading && contenuPersonnalise) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header onSearch={() => {}} onTypeChange={() => {}} />
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#3D2817] text-white py-8 md:py-12 lg:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-3 md:mb-4 text-center">
              À Propos de Nous
            </h1>
            <p className="text-base md:text-lg text-center text-white/90 max-w-2xl mx-auto px-4">
              Découvrez l'histoire et les valeurs de SAFIYA BOUTIQUE
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
          <div 
            className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contenuPersonnalise }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // Pendant le chargement ou si le contenu n'existe pas, afficher le contenu par défaut
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B7355]"></div>
          <p className="mt-4 text-[#8B7355]">Chargement...</p>
        </div>
      </div>
    );
  }

  // Contenu par défaut (fallback)
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onSearch={() => {}} onTypeChange={() => {}} />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#3D2817] text-white py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="luxury-title text-3xl sm:text-4xl md:text-5xl font-light mb-3 md:mb-4 text-center tracking-wide">
            À Propos de Nous
          </h1>
          <p className="luxury-text text-base md:text-lg text-center text-white/90 max-w-2xl mx-auto px-4 font-light">
            Découvrez l'histoire et les valeurs de SAFIYA BOUTIQUE
          </p>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-6 py-12 max-w-4xl flex-1">
        {/* Section Histoire */}
        <section className="mb-12">
          <h2 className="luxury-title text-3xl font-light text-[#1A1A1A] mb-6 tracking-wide">Notre Histoire</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              SAFIYA BOUTIQUE est née d'une idée simple : rendre l'élégance accessible à toutes les femmes.
            </p>
            <p className="mb-4">
              Fraîchement lancée, notre boutique est le résultat d'une passion pour la mode féminine, les belles pièces et le souci du détail. Dès le début, nous avons voulu créer un espace où chaque femme peut trouver des articles modernes, tendance et de qualité, sans compromis sur son budget.
            </p>
            <p className="mb-4">
              Notre aventure a commencé avec la volonté d'apporter un style unique mêlant modernité, authenticité et raffinement. Aujourd'hui, même si SAFIYA BOUTIQUE est jeune, notre ambition est grande : devenir une référence en matière d'élégance féminine.
            </p>
          </div>
        </section>

        {/* Section Mission */}
        <section className="mb-12">
          <h2 className="luxury-title text-3xl font-light text-[#1A1A1A] mb-6 tracking-wide">Notre Mission</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              Nous nous engageons à offrir une expérience shopping exceptionnelle :
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Une sélection rigoureuse d'articles féminins tendance</li>
              <li>Des produits qui allient modernité, élégance et durabilité</li>
              <li>Un service client chaleureux, disponible et à l'écoute</li>
              <li>Des prix accessibles pour que chaque femme puisse se faire plaisir</li>
              <li>Une livraison rapide, fiable et sécurisée</li>
            </ul>
            <p>
              Notre différence ? Un esprit familial, une passion authentique pour la mode, et l'envie sincère d'apporter des articles qui valorisent la femme, quel que soit son style.
            </p>
          </div>
        </section>

        {/* Section Produits */}
        <section className="mb-12">
          <h2 className="luxury-title text-3xl font-light text-[#1A1A1A] mb-6 tracking-wide">Nos Produits</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              Chez SAFIYA BOUTIQUE, nous proposons une sélection soignée d'articles féminins :
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Sacs</strong> : modèles modernes, élégants et intemporels</li>
              <li><strong>Montres</strong> : collections raffinées pour sublimer chaque tenue</li>
              <li><strong>Chaussures</strong> : confort, style et finition de qualité</li>
              <li><strong>Accessoires</strong> : pièces uniques pour apporter la touche finale à votre look</li>
            </ul>
            <p>
              Chaque produit est choisi avec soin afin de vous garantir le meilleur rapport qualité-prix.
            </p>
          </div>
        </section>

        {/* Section Engagement */}
        <section className="mb-12">
          <h2 className="luxury-title text-3xl font-light text-[#1A1A1A] mb-6 tracking-wide">Notre Engagement</h2>
          <div className="bg-[#F5F5F5] rounded-lg p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-[#8B7355] mr-3">✓</span>
                <span className="text-[#1A1A1A]">
                  <strong>Qualité garantie</strong> : des articles soigneusement sélectionnés
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#8B7355] mr-3">✓</span>
                <span className="text-[#1A1A1A]">
                  <strong>Prix transparents</strong> : pas de frais cachés, juste le bon prix
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#8B7355] mr-3">✓</span>
                <span className="text-[#1A1A1A]">
                  <strong>Livraison sécurisée</strong> : vos commandes sont préparées avec soin
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#8B7355] mr-3">✓</span>
                <span className="text-[#1A1A1A]">
                  <strong>Support client réactif</strong> : une équipe à votre écoute pour vous accompagner
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section Contact */}
        <section className="text-center py-8 border-t border-[#E5E5E5]">
          <h3 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">Contactez-nous</h3>
          <p className="luxury-text text-[#8B7355] mb-6 font-light">
            Une question ? N'hésitez pas à nous contacter, nous serons ravis de vous aider.
          </p>
          <Link 
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#3D2817] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Voir nos produits
          </Link>
        </section>
      </div>
      <Footer />
    </div>
  );
}

