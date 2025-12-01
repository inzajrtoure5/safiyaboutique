'use client';

import { useState, useEffect } from 'react';
import { getContenuLegalPublic } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PolitiqueConfidentialitePage() {
  const [contenuPersonnalise, setContenuPersonnalise] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger le contenu depuis la base de données
    getContenuLegalPublic('politique-confidentialite')
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
              Politique de Confidentialité
            </h1>
            <p className="text-base md:text-lg text-center text-white/90 max-w-2xl mx-auto px-4">
              Protection et traitement de vos données personnelles
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
      <div className="bg-gradient-to-br from-[#8B7355] to-[#D4A574] text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="luxury-title text-4xl md:text-5xl font-light mb-4 text-center tracking-wide">
            Politique de Confidentialité
          </h1>
          <p className="luxury-text text-lg text-center text-white/90 max-w-2xl mx-auto font-light">
            Protection et traitement de vos données personnelles
          </p>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-6 py-12 max-w-4xl flex-1">
        {/* Introduction */}
        <section className="mb-12">
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              Protection et traitement de vos données personnelles
            </p>
            <p className="mb-0">
              <strong>Dernière mise à jour :</strong> 26 novembre 2025
            </p>
          </div>
        </section>

        {/* Responsable du traitement */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">1. RESPONSABLE DU TRAITEMENT</h2>
          <div className="bg-[#F5F5F5] rounded-lg p-6">
            <p className="mb-2"><strong>Raison sociale :</strong> SAFIYA BOUTIQUE</p>
            <p className="mb-2"><strong>Statut juridique :</strong> Auto-entrepreneur (Côte d'Ivoire)</p>
            <p className="mb-2"><strong>Siège social :</strong> Cocody Angré 8ᵉ tranche, Abidjan, Côte d'Ivoire</p>
            <p className="mb-2"><strong>Éditeur et responsable du traitement :</strong> Kamate Mansonna</p>
            <p className="mb-2"><strong>Email :</strong> contact-safiyaboutique@gmail.com</p>
            <p className="mb-0"><strong>Téléphone :</strong> +225 0505616042</p>
          </div>
        </section>

        {/* Données collectées */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">2. DONNÉES COLLECTÉES</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <h3 className="text-xl font-light text-[#1A1A1A] mb-3 mt-6">2.1. Données collectées directement via le formulaire de livraison</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Nom et prénom</li>
              <li>Numéro de téléphone</li>
              <li>Commune / adresse de livraison</li>
              <li>Détails de la commande</li>
            </ul>

            <h3 className="text-xl font-light text-[#1A1A1A] mb-3 mt-6">2.2. Données collectées automatiquement</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site et à la navigation</li>
              <li><strong>Données techniques limitées :</strong> type de navigateur, adresse IP (pour sécuriser le site)</li>
            </ul>
            <p className="mb-4">
              <strong>Aucune donnée bancaire n'est collectée sur le site.</strong> Les paiements se font directement via Wave ou par redirection WhatsApp pour finaliser la commande.
            </p>
          </div>
        </section>

        {/* Finalités du traitement */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">3. FINALITÉS DU TRAITEMENT</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">Vos données personnelles sont utilisées uniquement pour :</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Traiter et organiser votre commande</li>
              <li>Livrer vos produits à l'adresse indiquée</li>
              <li>Communiquer avec vous concernant votre commande</li>
              <li>Prévenir la fraude et sécuriser les transactions</li>
            </ul>
            <p>
              <strong>Aucune donnée n'est utilisée à des fins marketing ou commerciale sans votre consentement explicite.</strong>
            </p>
          </div>
        </section>

        {/* Conservation des données */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">4. DURÉE DE CONSERVATION</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Données de commande et de contact :</strong> 3 ans après la dernière transaction ou interaction</li>
              <li><strong>Cookies :</strong> maximum 13 mois</li>
            </ul>
            <p>
              Passé ces durées, les données sont supprimées ou anonymisées de manière sécurisée.
            </p>
          </div>
        </section>

        {/* Destinataires des données */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">5. DESTINATAIRES DES DONNÉES</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">Vos données peuvent être communiquées uniquement à :</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Le personnel autorisé de SAFIYA BOUTIQUE</li>
              <li>Les prestataires impliqués dans la livraison ou le paiement (Wave, transporteur)</li>
              <li>Les autorités compétentes si requis par la loi</li>
            </ul>
          </div>
        </section>

        {/* Sécurité des données */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">6. SÉCURITÉ DES DONNÉES</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              SAFIYA BOUTIQUE met en œuvre des mesures pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Accès sécurisé aux informations</li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance et contrôle de l'accès aux données</li>
            </ul>
          </div>
        </section>

        {/* Vos droits */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">7. VOS DROITS</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">Vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Accéder à vos données et les rectifier</li>
              <li>Demander leur suppression</li>
              <li>Limiter leur traitement</li>
              <li>Vous opposer au traitement</li>
            </ul>
            <p className="mb-4">
              Pour exercer vos droits : <strong>contact-safiyaboutique@gmail.com</strong>
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">8. COOKIES</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              Le site utilise uniquement des cookies essentiels pour assurer le fonctionnement correct du formulaire et de la navigation.
            </p>
            <p>
              Vous pouvez les refuser, mais certaines fonctionnalités du site pourraient ne plus fonctionner correctement.
            </p>
          </div>
        </section>

        {/* Modifications */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">9. MODIFICATIONS DE LA POLITIQUE</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              SAFIYA BOUTIQUE se réserve le droit de modifier cette politique à tout moment.
            </p>
            <p className="mb-4">
              La dernière mise à jour est indiquée en haut de la page.
            </p>
            <p>
              Nous vous recommandons de consulter régulièrement cette page pour rester informé.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

