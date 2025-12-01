'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Maintenance() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState('Le site est actuellement en maintenance. Nous serons de retour très bientôt !');

  useEffect(() => {
    // Ne jamais afficher la maintenance sur la page admin
    const isAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    
    if (isAdminPage) {
      setIsMaintenance(false);
      return; // Arrêter complètement si on est sur l'admin
    }

    // Vérifier le statut de maintenance
    const checkMaintenance = async () => {
      // Vérifier à nouveau si on est sur la page admin - si oui, arrêter
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      if (isAdmin) {
        setIsMaintenance(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/parametres/public', {
          // Ajouter un cache-busting pour éviter les problèmes de cache
          params: { _t: Date.now() }
        });
        console.log('Maintenance check response:', response.data);
        // Vérifier explicitement que la valeur est '1' ou 1 ou true
        const maintenanceValue = response.data.maintenance_active;
        const maintenanceActive = maintenanceValue === '1' || maintenanceValue === 1 || maintenanceValue === true;
        console.log('Maintenance valeur brute:', maintenanceValue, 'Maintenance active:', maintenanceActive);
        
        // Double vérification pour s'assurer qu'on n'est pas sur l'admin
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          setIsMaintenance(false);
          return;
        }
        
        setIsMaintenance(maintenanceActive);
        if (response.data.maintenance_message && response.data.maintenance_message.trim() !== '') {
          setMessage(response.data.maintenance_message);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la maintenance:', error);
        setIsMaintenance(false);
      }
    };

    checkMaintenance();
    // Vérifier toutes les 10 secondes pour réactivité, mais seulement si on n'est pas sur l'admin
    const interval = setInterval(() => {
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      if (!isAdmin) {
        checkMaintenance();
      } else {
        setIsMaintenance(false);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Vérifier aussi lors des changements de route
  useEffect(() => {
    const checkAdmin = () => {
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      if (isAdmin) {
        setIsMaintenance(false);
      }
    };

    // Vérifier au chargement
    checkAdmin();
    
    // Écouter les changements de route Next.js
    const handleRouteChange = () => {
      checkAdmin();
    };
    
    // Écouter les changements de route du navigateur
    window.addEventListener('popstate', handleRouteChange);
    
    // Écouter les changements de route Next.js (via pathname)
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(checkAdmin, 0);
    };
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
    };
  }, []);

  if (!isMaintenance) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          {/* Logo en haut */}
          <div className="mb-6 flex justify-center">
            <img
              src="/logo/LOGO.png"
              alt="SAFIYA BOUTIQUE"
              className="object-contain h-auto max-h-20 w-auto"
              style={{ maxWidth: '200px' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'http://localhost:5000/logo/LOGO.png';
                target.onerror = () => {
                  console.error('Logo non trouvé');
                  target.style.display = 'none';
                };
              }}
            />
          </div>
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-[#1A1A1A] mb-4 luxury-title">Maintenance en cours</h1>
          <p className="text-[#8B7355] luxury-text leading-relaxed mb-6">{message}</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
      {/* Empêcher le scroll et l'interaction avec le reste de la page */}
      <style jsx global>{`
        body {
          overflow: hidden !important;
        }
      `}</style>
    </>
  );
}

