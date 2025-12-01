'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

export default function ContactezNousPage() {
  const [socialLinks, setSocialLinks] = useState({
    whatsapp_url: '',
    gmail_url: '',
    whatsapp_active: false,
    gmail_active: false,
  });
  const [coordonnees, setCoordonnees] = useState({
    adresse: 'Cocody Angré 8ᵉ tranche, Abidjan, Côte d\'Ivoire',
    telephone: '+225 0505616042',
    horaires_jour: 'Lundi - Dimanche',
    horaires_heure: '9h - 18h',
  });

  useEffect(() => {
    const loadContact = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${apiUrl}/parametres/public?_t=${Date.now()}`);
        const data = response.data;
        const whatsappUrl = data.whatsapp_url || (data.whatsapp_number ? `https://wa.me/${data.whatsapp_number.replace(/\D/g, '')}` : '');
        
        setSocialLinks({
          whatsapp_url: whatsappUrl,
          gmail_url: data.gmail_url || 'mailto:contact-safiyaboutique@gmail.com',
          whatsapp_active: data.whatsapp_active === '1' || data.whatsapp_active === 1,
          gmail_active: data.gmail_active === '1' || data.gmail_active === 1,
        });

        // Charger les coordonnées
        setCoordonnees({
          adresse: data.contact_adresse || 'Cocody Angré 8ᵉ tranche, Abidjan, Côte d\'Ivoire',
          telephone: data.contact_telephone || '+225 0505616042',
          horaires_jour: data.contact_horaires_jour || 'Lundi - Dimanche',
          horaires_heure: data.contact_horaires_heure || '9h - 18h',
        });
      } catch (error) {
        console.error('Erreur lors du chargement des informations de contact:', error);
      }
    };

    loadContact();
    const interval = setInterval(loadContact, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onSearch={() => {}} onTypeChange={() => {}} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#3D2817] text-white py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="luxury-title text-3xl sm:text-4xl md:text-5xl font-light mb-3 md:mb-4 text-center tracking-wide">
            Contactez-nous
          </h1>
          <p className="luxury-text text-base md:text-lg text-center text-white/90 max-w-2xl mx-auto px-4 font-light">
            Une question ? Besoin d'aide ? Nous sommes là pour vous !
          </p>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl flex-1">
        {/* Informations de contact */}
        <section className="mb-8 md:mb-12">
          <h2 className="luxury-title text-2xl md:text-3xl font-light text-[#1A1A1A] mb-4 md:mb-6 tracking-wide">Nos Coordonnées</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Email */}
            {socialLinks.gmail_active && (
              <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#E8E0D5] hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-[#8B7355]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="luxury-title text-lg font-semibold text-[#1A1A1A] mb-2">Email</h3>
                    <a 
                      href={socialLinks.gmail_url}
                      className="luxury-text text-[#8B7355] hover:text-[#1A1A1A] transition-colors break-all"
                    >
                      {socialLinks.gmail_url.replace('mailto:', '')}
                    </a>
                    <p className="luxury-text text-sm text-[#8B7355] mt-2 font-light">
                      Réponse sous 24h
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp */}
            {socialLinks.whatsapp_active && (
              <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#E8E0D5] hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-[#8B7355]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="luxury-title text-lg font-semibold text-[#1A1A1A] mb-2">WhatsApp</h3>
                    <a 
                      href={socialLinks.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="luxury-text text-[#8B7355] hover:text-[#1A1A1A] transition-colors"
                    >
                      Cliquez pour nous écrire
                    </a>
                    <p className="luxury-text text-sm text-[#8B7355] mt-2 font-light">
                      Réponse rapide
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Adresse */}
          <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#E8E0D5]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="luxury-title text-lg font-semibold text-[#1A1A1A] mb-2">Adresse</h3>
                <p className="luxury-text text-[#1A1A1A] whitespace-pre-line">
                  {coordonnees.adresse}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Horaires */}
        <section className="mb-12">
          <h2 className="luxury-title text-3xl font-light text-[#1A1A1A] mb-6 tracking-wide">Horaires d'ouverture</h2>
          <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#E8E0D5]">
            <div className="space-y-3 luxury-text text-[#1A1A1A]">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{coordonnees.horaires_jour}</span>
                <span>{coordonnees.horaires_heure}</span>
              </div>
              <p className="text-sm text-[#8B7355] pt-2 border-t border-[#E8E0D5]">
                Notre service client est disponible tous les jours pour répondre à vos questions et traiter vos commandes.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="luxury-title text-3xl font-light text-[#1A1A1A] mb-6 tracking-wide">Questions fréquentes</h2>
          <div className="space-y-4">
            <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#E8E0D5]">
              <h3 className="luxury-title text-lg font-semibold text-[#1A1A1A] mb-2">Comment passer une commande ?</h3>
              <p className="luxury-text text-[#1A1A1A]">
                C'est très simple ! Consultez notre page <Link href="/comment-commander" className="text-[#8B7355] hover:underline">Comment commander</Link> pour un guide détaillé.
              </p>
            </div>
            
            <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#E8E0D5]">
              <h3 className="luxury-title text-lg font-semibold text-[#1A1A1A] mb-2">Quels sont les délais de livraison ?</h3>
              <p className="luxury-text text-[#1A1A1A]">
                Les délais varient selon votre localisation. Nous vous contacterons après votre commande pour vous donner un délai précis.
              </p>
            </div>

            <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#E8E0D5]">
              <h3 className="luxury-title text-lg font-semibold text-[#1A1A1A] mb-2">Puis-je modifier ou annuler ma commande ?</h3>
              <p className="luxury-text text-[#1A1A1A]">
                Contactez-nous rapidement après votre commande pour toute modification ou annulation. Nous ferons notre maximum pour répondre à votre demande.
              </p>
            </div>
          </div>
        </section>

        {/* Contact rapide */}
        <section className="text-center py-8 border-t border-[#E5E5E5]">
          <h3 className="luxury-title text-2xl font-light text-[#1A1A1A] mb-4 tracking-wide">Besoin d'aide immédiate ?</h3>
          <p className="luxury-text text-[#8B7355] mb-6 font-light">
            N'hésitez pas à nous contacter, nous serons ravis de vous aider.
          </p>
          {socialLinks.whatsapp_active && (
            <a
              href={socialLinks.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors luxury-text uppercase tracking-wider font-medium mb-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Nous écrire sur WhatsApp
            </a>
          )}
        </section>
      </div>
      
      <Footer />
    </div>
  );
}

