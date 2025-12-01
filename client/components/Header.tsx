'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePanier } from '@/contexts/PanierContext';
import { getTypesArticles } from '@/lib/api';

interface HeaderProps {
  onSearch?: (term: string) => void;
  onTypeChange?: (typeId: number | null) => void;
}

export default function Header({ onSearch, onTypeChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { panier } = usePanier();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [typesArticles, setTypesArticles] = useState<any[]>([]);

  useEffect(() => {
    getTypesArticles().then((res) => setTypesArticles(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (onTypeChange) {
      onTypeChange(selectedType === -1 ? -1 : selectedType);
    }
  }, [selectedType, onTypeChange]);

  const totalItems = panier.reduce((sum, a) => sum + (a.quantite || 1), 0);

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
      <div className="container mx-auto px-3 md:px-4">
        {/* Barre principale */}
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Menu Hamburger - Toujours visible */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col justify-center items-center w-9 h-9 sm:w-10 sm:h-10 space-y-1.5 focus:outline-none group z-10"
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-5 sm:w-6 bg-[#1A1A1A] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block h-0.5 w-5 sm:w-6 bg-[#1A1A1A] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 w-5 sm:w-6 bg-[#1A1A1A] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Logo - Centré absolument */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 z-10 flex items-center justify-center">
            <div className="relative h-10 w-auto sm:h-12 md:h-14 lg:h-16 flex items-center justify-center">
              <img
                src="/logo/LOGO.png"
                alt="SAFIYA BOUTIQUE"
                className="object-contain h-full w-auto max-h-10 sm:max-h-12 md:max-h-14 lg:max-h-16 transition-opacity duration-300 hover:opacity-80"
                style={{ maxWidth: '110px', height: 'auto' }}
                onError={(e) => {
                  console.error('Erreur de chargement du logo dans le header');
                  const target = e.target as HTMLImageElement;
                  // Essayer avec un chemin alternatif
                  target.src = '/logo/LOGO.png';
                }}
              />
            </div>
          </Link>

          {/* Actions droite - Recherche et Panier */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 ml-auto z-10">
            {/* Bouton Recherche */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300"
              aria-label="Rechercher"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Panier - Design moderne et minimaliste */}
            <Link 
              href="/panier" 
              className="relative p-1.5 sm:p-2 text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300"
              aria-label="Panier"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-[#1A1A1A] text-white text-[9px] sm:text-[10px] font-medium rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Barre de recherche élégante */}
        {searchOpen && (
          <div className="py-3 md:py-4 border-t border-[#E5E5E5]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm text-[#1A1A1A] bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#8B7355] transition-colors placeholder:text-[#8B7355]/50"
                  autoFocus
                />
              </div>
              <select
                value={selectedType === -1 ? 'pack' : (selectedType || '')}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'pack') {
                    setSelectedType(-1);
                  } else {
                    setSelectedType(value ? parseInt(value) : null);
                  }
                }}
                className="px-3 md:px-4 py-2 md:py-3 text-sm text-[#1A1A1A] bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#8B7355] transition-colors"
              >
                {typesArticles.length > 0 ? (
                  <>
                    <option value="">Tous les types</option>
                    {typesArticles.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nom}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="">Tout</option>
                    <option value="pack">Pack</option>
                  </>
                )}
              </select>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 text-[#8B7355] hover:text-[#1A1A1A] transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu latéral hamburger */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu */}
          <nav className="fixed top-16 md:top-20 left-0 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-72 md:w-80 bg-white border-r border-[#E5E5E5] z-50 overflow-y-auto">
            <div className="p-6 space-y-1">
              <Link 
                href="/a-propos" 
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors uppercase tracking-wide"
              >
                À propos de nous
              </Link>
              <Link 
                href="/contactez-nous" 
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors uppercase tracking-wide"
              >
                Contactez-nous
              </Link>
              <Link 
                href="/comment-commander" 
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors uppercase tracking-wide"
              >
                Comment commander
              </Link>
              <div className="pt-4 mt-4 border-t border-[#E5E5E5]">
                <p className="px-4 py-2 text-xs text-[#8B7355] uppercase tracking-wider font-medium">Catégories</p>
                <Link 
                  href="/?type=" 
                  onClick={() => { setMenuOpen(false); setSelectedType(null); }}
                  className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
                >
                  Tous les articles
                </Link>
                <Link 
                  href="/?type=pack" 
                  onClick={() => { setMenuOpen(false); setSelectedType(-1); }}
                  className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
                >
                  Packs
                </Link>
                {typesArticles.map((type) => (
                  <Link 
                    key={type.id}
                    href={`/?type=${type.id}`}
                    onClick={() => { setMenuOpen(false); setSelectedType(type.id); }}
                    className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
                  >
                    {type.nom}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
