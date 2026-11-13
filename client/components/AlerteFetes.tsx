'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/config';

export default function AlerteFetes() {
  const [isActive, setIsActive] = useState(false);
  const [texte, setTexte] = useState('');
  const [reduction, setReduction] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadAlerte = async () => {
      try {
        const response = await axios.get(`${API_URL}/parametres/public`);
        console.log('Alerte fêtes check response:', response.data);
        
        // Vérification STRICTE : seulement '1' signifie actif, tout le reste est inactif
        const activeValue = response.data.alerte_fetes_active;
        const active = activeValue === '1' || activeValue === 1;
        const texte = response.data.alerte_fetes_texte || '';
        const reduction = parseInt(response.data.alerte_fetes_reduction || '0');
        
        console.log('Alerte fêtes - activeValue:', activeValue, 'active:', active, 'texte:', texte, 'reduction:', reduction);
        
        setIsActive(active);
        setTexte(texte);
        setReduction(reduction);
        
        // NOUVELLE LOGIQUE : Vérifier si le texte a changé depuis la dernière fois que l'utilisateur a fermé l'alerte
        const texteVu = sessionStorage.getItem('alerte_fetes_texte_vu');
        const texteActuel = texte.trim();
        
        // Si le texte actuel est différent du texte vu précédemment, réinitialiser le flag
        if (texteVu && texteActuel !== '' && texteActuel !== texteVu) {
          console.log('Texte de l\'alerte a changé, réinitialisation du flag');
          sessionStorage.removeItem('alerte_fetes_vue');
          sessionStorage.removeItem('alerte_fetes_texte_vu');
        }
        
        // Afficher l'alerte UNIQUEMENT si active est strictement true, texte non vide, et pas encore vue dans cette session
        // OU si le texte a changé (dans ce cas, le flag a été réinitialisé ci-dessus)
        if (active === true && texteActuel !== '' && !sessionStorage.getItem('alerte_fetes_vue')) {
          setIsVisible(true);
        } else {
          // Si l'alerte est désactivée, s'assurer qu'elle n'est pas visible
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'alerte:', error);
        setIsActive(false);
        setIsVisible(false);
      }
    };

    loadAlerte();
    // Vérifier toutes les 10 secondes pour réactivité
    const interval = setInterval(loadAlerte, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Enregistrer que l'alerte a été vue ET stocker le texte actuel pour détecter les changements futurs
    sessionStorage.setItem('alerte_fetes_vue', 'true');
    sessionStorage.setItem('alerte_fetes_texte_vu', texte.trim());
    console.log('Alerte fermée, texte enregistré:', texte.trim());
  };

  // Ne pas afficher si l'alerte n'est pas active, pas visible, ou si le texte est vide
  // Vérification stricte pour éviter l'affichage non désiré
  if (isActive !== true || !isVisible || !texte || texte.trim() === '') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <div className="bg-black text-white rounded-xl shadow-2xl p-6 border border-white/20">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">🎉 Promotion Spéciale</h3>
            <p className="text-sm leading-relaxed">
              {texte}
              {reduction > 0 && (
                <span className="block mt-2 font-bold text-lg">
                  {reduction}% de réduction
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

