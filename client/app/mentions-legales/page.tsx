'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getContenuLegalPublic } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MentionsLegalesPage() {
  const [contenuPersonnalise, setContenuPersonnalise] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger le contenu depuis la base de données
    getContenuLegalPublic('mentions-legales')
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
              Mentions Légales
            </h1>
            <p className="text-base md:text-lg text-center text-white/90 max-w-2xl mx-auto px-4">
              Informations légales et réglementaires
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
            Mentions Légales
          </h1>
          <p className="luxury-text text-lg text-center text-white/90 max-w-2xl mx-auto font-light">
            Informations légales et réglementaires
          </p>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-6 py-12 max-w-4xl flex-1">
        {/* Éditeur du site */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">1. Éditeur du Site</h2>
          <div className="bg-[#F5F5F5] rounded-lg p-6">
            <p className="mb-2"><strong>Raison sociale :</strong> SAFIYA BOUTIQUE</p>
            <p className="mb-2"><strong>Statut juridique :</strong> Auto-entrepreneur</p>
            <p className="mb-2"><strong>RCCM :</strong> En cours d'immatriculation</p>
            <p className="mb-2"><strong>IFU :</strong> Non encore attribué</p>
            <p className="mb-2"><strong>Siège social :</strong> Cocody Angré 8ᵉ tranche, Abidjan, Côte d'Ivoire</p>
            <p className="mb-2"><strong>Éditeur et responsable de publication :</strong> Kamate Mansonna</p>
            <p className="mb-2"><strong>Email :</strong> contact-safiyaboutique@gmail.com</p>
            <p className="mb-0"><strong>Téléphone :</strong> +225 0505616042</p>
          </div>
        </section>

        {/* Hébergement */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">2. Hébergement du site</h2>
          <div className="bg-[#F5F5F5] rounded-lg p-6">
            <p className="mb-0"><strong>Hébergeur :</strong> [À compléter]</p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">3. Propriété Intellectuelle</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              Tous les contenus présents sur ce site (textes, images, logos, vidéos, design, produits) sont protégés par la législation ivoirienne sur la propriété intellectuelle.
            </p>
            <p className="mb-4">
              Toute reproduction, diffusion ou exploitation, totale ou partielle, est interdite sans autorisation écrite de SAFIYA BOUTIQUE.
            </p>
            <p>
              Les marques, logos et signes distinctifs sont la propriété exclusive de SAFIYA BOUTIQUE.
            </p>
          </div>
        </section>

        {/* Collecte et traitement des données */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">4. Collecte et Traitement des Données</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              Conformément à la réglementation en vigueur, nous vous informons que les données 
              personnelles collectées sur ce site sont nécessaires pour le traitement de vos 
              commandes et la gestion de la relation client.
            </p>
            <p className="mb-4">
              Pour plus d'informations sur la collecte, l'utilisation et la protection de vos 
              données personnelles, veuillez consulter notre{' '}
              <Link href="/politique-de-confidentialite" className="text-[#8B7355] hover:underline">
                Politique de Confidentialité
              </Link>.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">5. Cookies</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              Le site peut utiliser des cookies pour :
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Améliorer la navigation</li>
              <li>Personnaliser les services proposés</li>
            </ul>
            <p>
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient être limitées.
            </p>
          </div>
        </section>

        {/* Responsabilité */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">6. Limitation de Responsabilité</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              SAFIYA BOUTIQUE s'efforce de fournir des informations exactes et à jour sur ce site.
            </p>
            <p className="mb-4">
              Cependant, l'éditeur ne peut garantir l'exactitude totale des informations.
            </p>
            <p className="mb-4">
              L'utilisation du site se fait sous la seule responsabilité de l'utilisateur.
            </p>
            <p>
              SAFIYA BOUTIQUE décline toute responsabilité pour tout dommage direct ou indirect lié à l'usage du site ou à l'interruption du service.
            </p>
          </div>
        </section>

        {/* Droit applicable */}
        <section className="mb-12">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">7. Droit Applicable</h2>
          <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
            <p className="mb-4">
              Ces mentions légales sont régies par la loi ivoirienne.
            </p>
            <p>
              Tout litige relatif à l'utilisation du site relève de la compétence exclusive des tribunaux d'Abidjan, Côte d'Ivoire.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center py-8 border-t border-[#E5E5E5]">
          <p className="text-[#8B7355] mb-4">
            Pour toute question concernant les mentions légales, vous pouvez nous contacter.
          </p>
          <p className="text-sm text-[#1A1A1A]">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
}

