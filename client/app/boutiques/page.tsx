'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';



export default function BoutiquesPage() {
  const [boutiquesData, setBoutiquesData] = useState({
    texte: 'Nos boutiques',
    url: '',
    adresses: [] as Array<{ nom: string; adresse: string; maps_url: string }>
  });

  useEffect(() => {
    const loadBoutiques = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${apiUrl}/parametres/public?_t=${Date.now()}`);
        const data = response.data;
        
        setBoutiquesData({
          texte: data.boutiques_texte || 'Nos boutiques',
          url: data.boutiques_url || '',
          adresses: data.boutiques_adresses ? JSON.parse(data.boutiques_adresses) : []
        });
      } catch (error) {
        console.error('Erreur lors du chargement des boutiques:', error);
      }
    };
    
    loadBoutiques();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="luxury-title text-3xl md:text-4xl text-[#1A1A1A] mb-6 text-center">
            {boutiquesData.texte}
          </h1>
          
          {boutiquesData.adresses.length > 0 ? (
            <div className="space-y-6">
              {boutiquesData.adresses.map((boutique, index) => (
                <div key={index} className="bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl p-6 border border-[#E8E0D5]">
                  <h2 className="luxury-title text-2xl text-[#3D2817] mb-3">{boutique.nom}</h2>
                  <p className="luxury-text text-[#8B6F47] mb-4">{boutique.adresse}</p>
                  {boutique.maps_url && (
                    <a
                      href={boutique.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Voir sur Google Maps
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-xl border border-[#E8E0D5]">
              <p className="luxury-text text-xl text-[#8B6F47] mb-4">{boutiquesData.texte}</p>
              {boutiquesData.url && (
                <a
                  href={boutiquesData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Voir sur Google Maps
                </a>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

