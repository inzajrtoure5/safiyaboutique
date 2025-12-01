'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function CommentCommanderPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onSearch={() => {}} onTypeChange={() => {}} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#3D2817] text-white py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="luxury-title text-3xl sm:text-4xl md:text-5xl font-light mb-3 md:mb-4 text-center tracking-wide">
            Comment Commander
          </h1>
          <p className="luxury-text text-base md:text-lg text-center text-white/90 max-w-2xl mx-auto px-4 font-light">
            Guide simple pour passer votre commande sur SAFIYA BOUTIQUE
          </p>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl flex-1">
        {/* Étape 1 */}
        <section className="mb-8 md:mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#8B7355] to-[#D4A574] text-white rounded-full flex items-center justify-center luxury-title text-xl font-light">
              1
            </div>
            <div className="flex-1">
              <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-3 tracking-wide">Parcourez notre catalogue</h2>
              <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
                <p className="mb-4">
                  Explorez notre sélection d'articles féminins : sacs, montres, chaussures et accessoires. 
                  Utilisez les filtres par catégorie ou la barre de recherche pour trouver rapidement ce qui vous plaît.
                </p>
                <p>
                  Cliquez sur "Détails" pour voir plus d'informations sur un article, ou directement sur "Ajouter au panier" si vous êtes sûr de votre choix.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Étape 2 */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#8B7355] to-[#D4A574] text-white rounded-full flex items-center justify-center luxury-title text-xl font-light">
              2
            </div>
            <div className="flex-1">
              <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-3 tracking-wide">Ajoutez vos articles au panier</h2>
              <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
                <p className="mb-4">
                  Une fois que vous avez trouvé les articles qui vous plaisent, cliquez sur "Ajouter au panier". 
                  Vous pouvez ajouter plusieurs articles et ajuster les quantités directement dans le panier.
                </p>
                <p>
                  Profitez également de nos <strong>packs spéciaux</strong> qui vous offrent des réductions avantageuses sur plusieurs articles !
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Étape 3 */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#8B7355] to-[#D4A574] text-white rounded-full flex items-center justify-center luxury-title text-xl font-light">
              3
            </div>
            <div className="flex-1">
              <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-3 tracking-wide">Remplissez vos informations de livraison</h2>
              <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
                <p className="mb-4">
                  Cliquez sur l'icône panier en haut à droite, puis sur "Passer la commande". 
                  Remplissez le formulaire avec vos informations :
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Nom et prénom</strong></li>
                  <li><strong>Numéro de téléphone</strong> (pour vous contacter)</li>
                  <li><strong>Commune</strong> et <strong>adresse précise</strong> de livraison</li>
                </ul>
                <p>
                  Vérifiez bien votre adresse pour que la livraison se passe sans problème.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Étape 4 */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#8B7355] to-[#D4A574] text-white rounded-full flex items-center justify-center luxury-title text-xl font-light">
              4
            </div>
            <div className="flex-1">
              <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-3 tracking-wide">Choisissez votre mode de paiement</h2>
              <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
                <p className="mb-4">
                  Deux options s'offrent à vous :
                </p>
                <div className="space-y-4 mb-4">
                  <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E8E0D5]">
                    <h3 className="luxury-title text-lg font-semibold text-[#1A1A1A] mb-2">Paiement par WAVE</h3>
                    <p className="luxury-text text-sm text-[#1A1A1A]">
                      Si le paiement WAVE est activé, vous pourrez payer directement via l'application WAVE. 
                      Scannez le QR code ou cliquez sur le lien de paiement pour finaliser votre commande en toute sécurité.
                    </p>
                  </div>
                  <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E8E0D5]">
                    <h3 className="luxury-title text-lg font-semibold text-[#1A1A1A] mb-2">Commande via WhatsApp</h3>
                    <p className="luxury-text text-sm text-[#1A1A1A]">
                      Vous pouvez également commander directement via WhatsApp. 
                      Un message sera automatiquement préparé avec le détail de votre commande que vous pourrez envoyer à notre service client.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Étape 5 */}
        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#8B7355] to-[#D4A574] text-white rounded-full flex items-center justify-center luxury-title text-xl font-light">
              5
            </div>
            <div className="flex-1">
              <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-3 tracking-wide">Confirmation et suivi</h2>
              <div className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed luxury-text">
                <p className="mb-4">
                  Une fois votre commande passée, vous recevrez une confirmation. 
                  Notre équipe vous contactera rapidement pour confirmer les détails et organiser la livraison.
                </p>
                <p>
                  Vous serez informé(e) de l'avancement de votre commande et de la date prévue de livraison.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conseils */}
        <section className="mb-12 bg-[#F5F5F5] rounded-lg p-6 border border-[#E8E0D5]">
          <h2 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">💡 Conseils pratiques</h2>
          <ul className="space-y-3 luxury-text text-[#1A1A1A]">
            <li className="flex items-start">
              <span className="text-[#8B7355] mr-3">•</span>
              <span>Vérifiez toujours votre adresse de livraison avant de valider la commande</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#8B7355] mr-3">•</span>
              <span>Gardez votre téléphone à portée de main pour recevoir les notifications concernant votre commande</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#8B7355] mr-3">•</span>
              <span>N'hésitez pas à nous contacter si vous avez des questions avant ou après votre commande</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#8B7355] mr-3">•</span>
              <span>Profitez des packs pour économiser sur plusieurs articles</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center py-8 border-t border-[#E5E5E5]">
          <h3 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">Prêt(e) à commander ?</h3>
          <p className="luxury-text text-[#8B7355] mb-6 font-light">
            Découvrez notre sélection et trouvez les articles parfaits pour vous.
          </p>
          <Link 
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#8B7355] to-[#D4A574] text-white rounded-lg hover:opacity-90 transition-opacity luxury-text uppercase tracking-wider font-medium"
          >
            Voir les articles
          </Link>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}

