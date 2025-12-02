'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState({
    tiktok_url: 'https://www.tiktok.com/@safiyaboutique',
    instagram_url: 'https://www.instagram.com/safiyaboutique',
    whatsapp_url: 'https://wa.me/2250505616042',
    gmail_url: 'mailto:contact.safiyaboutique@gmail.com',
    tiktok_active: false,
    instagram_active: false,
    whatsapp_active: true,
    gmail_active: true,
  });
  const [boutiquesTexte, setBoutiquesTexte] = useState('Vos boutiques bientôt disponibles');
  const [boutiquesUrl, setBoutiquesUrl] = useState<string | null>(null);

  useEffect(() => {
    // Charger les paramètres publics des réseaux sociaux
    const loadSocialLinks = async () => {
      try {
        // Cache-busting pour obtenir les dernières valeurs
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://safiyaboutique-utvv.onrender.com/api/';
        const response = await axios.get(`${apiUrl}/parametres/public?_t=${Date.now()}`);
        const data = response.data;
        const whatsappUrl = data.whatsapp_url || (data.whatsapp_number ? `https://wa.me/${data.whatsapp_number.replace(/\D/g, '')}` : 'https://wa.me/2250000000000');
        
        // Utiliser les valeurs de la DB strictement (comme maintenance_active)
        setSocialLinks({
          tiktok_url: data.tiktok_url && data.tiktok_url.trim() !== '' ? data.tiktok_url : 'https://www.tiktok.com/@safiyaboutique',
          instagram_url: data.instagram_url && data.instagram_url.trim() !== '' ? data.instagram_url : 'https://www.instagram.com/safiyaboutique',
          whatsapp_url: whatsappUrl && whatsappUrl.trim() !== '' ? whatsappUrl : 'https://wa.me/2250000000000',
          gmail_url: data.gmail_url && data.gmail_url.trim() !== '' ? data.gmail_url : 'mailto:contact@safiyaboutique.com',
          // Vérification stricte: seulement '1' ou 1 = actif (comme maintenance_active)
          tiktok_active: data.tiktok_active === '1' || data.tiktok_active === 1,
          instagram_active: data.instagram_active === '1' || data.instagram_active === 1,
          whatsapp_active: data.whatsapp_active === '1' || data.whatsapp_active === 1,
          gmail_active: data.gmail_active === '1' || data.gmail_active === 1,
        });
        
        if (data.boutiques_texte) {
          setBoutiquesTexte(data.boutiques_texte);
        }
        if (data.boutiques_url) {
          setBoutiquesUrl(data.boutiques_url);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        // Garder les liens par défaut en cas d'erreur
      }
    };
    
    loadSocialLinks();
    
    // Vérification périodique des paramètres (comme pour maintenance)
    const checkSocialLinks = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${apiUrl}/parametres/public?_t=${Date.now()}`);
        const data = response.data;
        const whatsappUrl = data.whatsapp_url || (data.whatsapp_number ? `https://wa.me/${data.whatsapp_number.replace(/\D/g, '')}` : 'https://wa.me/2250000000000');
        
        setSocialLinks({
          tiktok_url: data.tiktok_url && data.tiktok_url.trim() !== '' ? data.tiktok_url : 'https://www.tiktok.com/@safiyaboutique',
          instagram_url: data.instagram_url && data.instagram_url.trim() !== '' ? data.instagram_url : 'https://www.instagram.com/safiyaboutique',
          whatsapp_url: whatsappUrl && whatsappUrl.trim() !== '' ? whatsappUrl : 'https://wa.me/2250505616042',
          gmail_url: data.gmail_url && data.gmail_url.trim() !== '' ? data.gmail_url : 'mailto:contact.safiyaboutique@gmail.com',
          tiktok_active: data.tiktok_active === '1' || data.tiktok_active === 1,
          instagram_active: data.instagram_active === '1' || data.instagram_active === 1,
          whatsapp_active: data.whatsapp_active === '1' || data.whatsapp_active === 1,
          gmail_active: data.gmail_active === '1' || data.gmail_active === 1,
        });
      } catch (error) {
        console.error('Erreur lors de la vérification périodique des réseaux sociaux:', error);
      }
    };
    
    // Vérifier toutes les 10 secondes
    const socialInterval = setInterval(checkSocialLinks, 10000);
    
    return () => clearInterval(socialInterval);
  }, []);

  return (
    <footer className="w-full bg-[#1A1A1A] text-white mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Logo et Description */}
          <div className="lg:col-span-1 flex flex-col items-center sm:items-start">
            <div className="mb-4 flex justify-center sm:justify-start w-full">
              <img
                src="/logo/LOGO.png"
                alt="SAFIYA BOUTIQUE"
                className="object-contain h-auto max-h-20 w-auto mx-auto sm:mx-0"
                style={{ maxWidth: '120px', height: 'auto', maxHeight: '60px', display: 'block' }}
                onError={(e) => {
                  console.error('Erreur de chargement du logo dans le footer, essai avec chemin serveur...');
                  const target = e.target as HTMLImageElement;
                  target.src = 'http://localhost:5000/logo/LOGO.png';
                  target.onerror = () => {
                    console.error('Échec du chargement du logo');
                    target.style.display = 'none';
                  };
                }}
                onLoad={() => {
                  console.log('✅ Logo chargé avec succès dans le footer');
                }}
              />
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-4 text-center sm:text-left">
              SAFIYA BOUTIQUE - Boutique féminine de qualité : articles luxueux, modernes et traditionnels. 
              Sacs, montres, chaussures et accessoires élégants pour toutes les occasions et tous les budgets.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white text-center sm:text-left w-full">Navigation</h3>
            <ul className="space-y-2 text-center sm:text-left">
              <li>
                <Link href="/a-propos" className="text-sm text-white/70 hover:text-white transition-colors">
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link href="/comment-commander" className="text-sm text-white/70 hover:text-white transition-colors">
                  Comment commander
                </Link>
              </li>
              <li>
                <Link href="/contactez-nous" className="text-sm text-white/70 hover:text-white transition-colors">
                  Contactez-nous
                </Link>
              </li>
              <li>
                <Link href="/panier" className="text-sm text-white/70 hover:text-white transition-colors">
                  Mon panier
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-sm text-white/70 hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-de-confidentialite" className="text-sm text-white/70 hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white text-center sm:text-left w-full">Informations</h3>
            <ul className="space-y-2 text-center sm:text-left">
              <li>
                <p className="text-sm text-white/70">Livraison disponible</p>
              </li>
              <li>
                <p className="text-sm text-white/70">Paiement sécurisé</p>
              </li>
              <li>
                <p className="text-sm text-white/70">Support client</p>
              </li>
              <li>
                <p className="text-sm text-white/70">Boutique de vente</p>
              </li>
              <li>
                {boutiquesUrl ? (
                  <Link href="/boutiques" className="text-sm text-[#D4A574] italic hover:text-[#D4AF37] transition-colors underline">
                    {boutiquesTexte}
                  </Link>
                ) : (
                  <p className="text-sm text-[#D4A574] italic">{boutiquesTexte}</p>
                )}
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white text-center sm:text-left w-full">Contact</h3>
            <ul className="space-y-2 text-center sm:text-left">
              {socialLinks.whatsapp_active && (
                <li>
                  <a 
                    href={socialLinks.whatsapp_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </a>
                </li>
              )}
              {socialLinks.gmail_active && (
                <li>
                  <a 
                    href={socialLinks.gmail_url}
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                    Gmail
                  </a>
                </li>
              )}
              <li>
                <p className="text-sm text-white/70">Côte d'Ivoire</p>
              </li>
              <li>
                <p className="text-sm text-white/70">Lun - Dim: 9h - 18h</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Suivez-nous</h3>
            <div className="flex items-center gap-6">
              {/* TikTok - Affiché si actif */}
              {socialLinks.tiktok_active && (
                <a
                  href={socialLinks.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
              )}
              {/* Instagram - Affiché si actif */}
              {socialLinks.instagram_active && (
                <a
                  href={socialLinks.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {/* WhatsApp - Affiché si actif */}
              {socialLinks.whatsapp_active && (
                <a
                  href={socialLinks.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/50 text-center md:text-left">
              © {new Date().getFullYear()} SAFIYA BOUTIQUE. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/mentions-legales" className="text-xs text-white/50 hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link href="/politique-de-confidentialite" className="text-xs text-white/50 hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/a-propos" className="text-xs text-white/50 hover:text-white transition-colors">
                À propos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

