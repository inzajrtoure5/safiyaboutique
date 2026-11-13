'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculerPrixPackClient, creerCommande, getParametresPack, getWhatsAppNumber, getFraisLivraisonPublic, getPrixLivraisonCommune, getPackVisiteursPublic } from '@/lib/api';
import { usePanier } from '@/contexts/PanierContext';
import Footer from '@/components/Footer';


// Composant pour afficher un carrousel d'images dans le panier
function PackImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Pack image ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1 z-20">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'bg-white w-2' 
                  : 'bg-white/50 w-1'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PanierPage() {
  const router = useRouter();
  const { panier, total, modifierQuantite, retirerDuPanier, viderPanier } = usePanier();
  const [packMode, setPackMode] = useState(false);
  const [packPrix, setPackPrix] = useState(0);
  const [packInfo, setPackInfo] = useState<any>(null); // Pour stocker les infos du pack (nombre de packs, articles dans packs, etc.)
  const [packConfig, setPackConfig] = useState({ active: false, nombre_articles: 3, reduction: 5, config: null as any });
  const [packVisiteurs, setPackVisiteurs] = useState<any[]>([]);
  const [fraisLivraison, setFraisLivraison] = useState({ active: false, montant: 0 });
  const [waveActive, setWaveActive] = useState(false);
  const [communes, setCommunes] = useState<Array<{ commune: string; prix: number }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    whatsapp: '',
    commune: '',
    adresse_precise: ''
  });
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    // Récupérer les packs visiteurs actifs et les paramètres
    Promise.all([
      getPackVisiteursPublic(),
      getParametresPack()
    ]).then(([packVisiteursRes, parametresRes]) => {
      // Charger les packs visiteurs actifs
      const packsActifs = packVisiteursRes.data || [];
      setPackVisiteurs(packsActifs);
      
      // Pour la compatibilité, utiliser le premier pack actif s'il y en a
      const premierPackActif = packsActifs.length > 0 ? packsActifs[0] : null;
      const packActive = premierPackActif !== null;
      
      if (premierPackActif) {
        setPackConfig({
          active: true,
          nombre_articles: premierPackActif.nombre_articles || 3,
          reduction: premierPackActif.reduction || 5,
          config: {
            mode: premierPackActif.mode,
            articles_ids: premierPackActif.articles_ids || [],
            type_id: premierPackActif.type_id
          }
        });
      } else {
        setPackConfig({
          active: false,
          nombre_articles: 3,
          reduction: 5,
          config: null
        });
      }

      // Récupérer les autres paramètres
      const parametres = parametresRes.data || {};
      // Les frais de livraison ne seront affichés que quand une commune est sélectionnée
      setFraisLivraison({
        active: false,
        montant: 0
      });
      
      // Vérifier si Wave est actif (normalisé strictement comme maintenance_active)
      // IMPORTANT: SEULEMENT '1' est considéré comme actif
      const waveActiveValue = parametres.wave_active;
      // Vérification STRICTE: uniquement '1' ou 1 = actif
      const waveActiveStatus = (waveActiveValue === '1' || waveActiveValue === 1);
      console.log('Wave check initial - valeur brute:', waveActiveValue, 'type:', typeof waveActiveValue, '-> actif:', waveActiveStatus);
      // S'assurer que c'est bien false si ce n'est pas explicitement '1' ou 1
      setWaveActive(waveActiveStatus === true);
    }).catch((err) => {
      console.error('Erreur lors de la récupération des données:', err);
      setWaveActive(false);
    });

    // Vérifier périodiquement le statut Wave (comme maintenance) avec cache-busting
    const checkWaveStatus = async () => {
      try {
        const response = await getParametresPack();
        const parametres = response.data || {};
        const waveActiveValue = parametres.wave_active;
        // Vérification STRICTE: SEULEMENT '1' ou 1 = actif, tout le reste = false
        const waveActiveStatus = (waveActiveValue === '1' || waveActiveValue === 1);
        console.log('Wave check périodique - valeur:', waveActiveValue, 'type:', typeof waveActiveValue, '-> actif:', waveActiveStatus);
        // Forcer à false si ce n'est pas explicitement '1' ou 1
        setWaveActive(waveActiveStatus === true);
      } catch (err) {
        console.error('Erreur lors de la vérification périodique de Wave:', err);
        setWaveActive(false);
      }
    };

    // Vérifier toutes les 10 secondes (comme maintenance)
    const waveInterval = setInterval(checkWaveStatus, 10000);
    
    // Récupérer TOUTES les communes avec leurs prix de livraison (actives uniquement)
    getFraisLivraisonPublic().then((res) => {
      console.log('Communes chargées:', res.data);
      setCommunes(res.data || []);
    }).catch((err) => {
      console.error('Erreur lors de la récupération des communes:', err);
      setCommunes([]);
    });
    
    // Récupérer le numéro WhatsApp depuis les paramètres
    getWhatsAppNumber().then((res) => {
      if (res.data.whatsapp_number) {
        setWhatsappNumber(res.data.whatsapp_number);
      } else {
        setWhatsappNumber('+2250000000000'); // Valeur par défaut si non configuré
      }
    }).catch(() => {
      setWhatsappNumber('+2250000000000'); // Valeur par défaut en cas d'erreur
    });
    
    return () => clearInterval(waveInterval);
  }, []);

  // Fonction helper pour calculer le sous-total correctement
  const calculerSousTotal = () => {
    if (!packMode) {
      return total; // Si pas de pack, utiliser le total normal
    }
    
    // Séparer les articles éligibles, non éligibles et packs boutique
    const articlesEligibles = panier.filter((article) => {
      const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
      if (isPack) return false;
      if (packConfig.active && packConfig.config) {
        const config = packConfig.config;
        if (config.mode === 'articles') {
          return config.articles_ids && config.articles_ids.includes(article.id);
        } else if (config.mode === 'type') {
          return config.type_id && (article as any).type_id === config.type_id;
        }
      }
      return false;
    });
    
    const articlesNonEligibles = panier.filter((article) => {
      const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
      if (isPack) return false;
      if (packConfig.active && packConfig.config) {
        const config = packConfig.config;
        if (config.mode === 'articles') {
          return !config.articles_ids || !config.articles_ids.includes(article.id);
        } else if (config.mode === 'type') {
          return !config.type_id || (article as any).type_id !== config.type_id;
        }
      }
      return true;
    });
    
    const packsBoutique = panier.filter((article) => {
      const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
      return isPack;
    });
    
    // Calculer les prix
    const prixArticlesNonEligibles = articlesNonEligibles.reduce(
      (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
      0
    );
    
    const prixPacksBoutique = packsBoutique.reduce(
      (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
      0
    );
    
    // packPrix contient déjà les articles éligibles avec réduction appliquée
    return packPrix + prixArticlesNonEligibles + prixPacksBoutique;
  };

  const handlePack = async () => {
    // Filtrer uniquement les articles éligibles
    const articlesEligibles = panier.filter((article) => {
      const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
      if (isPack) return false;
      if (packConfig.active && packConfig.config) {
        const config = packConfig.config;
        if (config.mode === 'articles') {
          return config.articles_ids && config.articles_ids.includes(article.id);
        } else if (config.mode === 'type') {
          return config.type_id && (article as any).type_id === config.type_id;
        }
      }
      return false;
    });

    const totalArticlesEligibles = articlesEligibles.reduce((sum, a) => sum + (a.quantite || 1), 0);
    if (totalArticlesEligibles < packConfig.nombre_articles) {
      alert(`Un Pack nécessite au moins ${packConfig.nombre_articles} articles éligibles. Vous avez ${totalArticlesEligibles} article(s) éligible(s).`);
      return;
    }

    // Si des articles non éligibles sont présents, demander confirmation
    const articlesNonEligibles = panier.filter((article) => {
      const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
      if (isPack) return true; // Les packs boutique sont toujours affichés
      if (packConfig.active && packConfig.config) {
        const config = packConfig.config;
        if (config.mode === 'articles') {
          return !config.articles_ids || !config.articles_ids.includes(article.id);
        } else if (config.mode === 'type') {
          return !config.type_id || (article as any).type_id !== config.type_id;
        }
      }
      return false;
    });

    if (articlesNonEligibles.length > 0) {
      const confirmation = confirm(
        `Certains articles de votre panier ne sont pas éligibles au pack. Seuls les articles éligibles bénéficieront de la réduction. Voulez-vous continuer ?`
      );
      if (!confirmation) return;
    }

    try {
      const res = await calculerPrixPackClient(articlesEligibles, packConfig.reduction, packConfig.nombre_articles);
      setPackPrix(res.data.prix_final);
      setPackInfo(res.data); // Stocker les infos du pack (nombre de packs, etc.)
      setPackMode(true);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du calcul du pack');
    }
  };

  const handlePayerWave = async () => {
    // Double sécurité: vérifier que Wave est vraiment actif (comme maintenance)
    if (!waveActive) {
      alert('Le paiement par WAVE n\'est pas disponible pour le moment. Veuillez utiliser WhatsApp pour commander.');
      return;
    }
    
    // Vérifier que tous les champs obligatoires sont remplis
    if (!formData.nom || !formData.prenom || !formData.telephone || !formData.commune || !formData.adresse_precise) {
      alert('Veuillez remplir tous les champs du formulaire avant de payer.');
      setShowForm(true);
      return;
    }
    
    const sousTotalWave = calculerSousTotal();
    const fraisLivWave = fraisLivraison.active ? fraisLivraison.montant : 0;
    const totalAvecLivraisonWave = sousTotalWave + fraisLivWave;
    
    try {
      await creerCommande({
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: `+225${formData.telephone}`,
        whatsapp: formData.whatsapp || formData.telephone,
        commune: formData.commune,
        adresse_precise: formData.adresse_precise,
        articles: panier,
        total: totalAvecLivraisonWave,
        methode_paiement: 'wave',
      });
      router.push(`/paiement?total=${Math.round(totalAvecLivraisonWave)}`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Erreur lors de la création de la commande');
    }
  };

  const handlePayerWhatsApp = async () => {
    // Vérifier que tous les champs obligatoires sont remplis
    if (!formData.nom || !formData.prenom || !formData.telephone || !formData.commune || !formData.adresse_precise) {
      alert('Veuillez remplir tous les champs du formulaire avant de commander.');
      setShowForm(true);
      return;
    }
    
    // Vérifier que le numéro de téléphone a 10 chiffres
    if (formData.telephone.length !== 10 || !/^\d{10}$/.test(formData.telephone)) {
      alert('Le numéro de téléphone doit contenir exactement 10 chiffres.');
      setShowForm(true);
      return;
    }
    
    const baseUrl = window.location.origin;
    
    // Générer le message WhatsApp avec les informations du client
    let message = '🛍️ *COMMANDE SAFIYA BOUTIQUE*\n\n';
    message += '*Informations du client :*\n';
    message += `👤 Nom: ${formData.nom} ${formData.prenom}\n`;
    message += `📱 Téléphone: +225${formData.telephone}\n`;
    if (formData.whatsapp) {
      message += `💬 WhatsApp: +225${formData.whatsapp}\n`;
    }
    message += `📍 Commune: ${formData.commune}\n`;
    message += `🏠 Adresse précise: ${formData.adresse_precise}\n\n`;
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    message += '*Articles commandés :*\n\n';
    
    // Recalculer le sous-total correctement
    const articlesEligibles = panier.filter((article) => {
      const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
      if (isPack) return false;
      if (packConfig.active && packConfig.config) {
        const config = packConfig.config;
        if (config.mode === 'articles') {
          return config.articles_ids && config.articles_ids.includes(article.id);
        } else if (config.mode === 'type') {
          return config.type_id && (article as any).type_id === config.type_id;
        }
      }
      return false;
    });
    
    const articlesNonEligibles = panier.filter((article) => {
      const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
      if (isPack) return false;
      if (packConfig.active && packConfig.config) {
        const config = packConfig.config;
        if (config.mode === 'articles') {
          return !config.articles_ids || !config.articles_ids.includes(article.id);
        } else if (config.mode === 'type') {
          return !config.type_id || (article as any).type_id !== config.type_id;
        }
      }
      return true;
    });
    
    const packsBoutique = panier.filter((article) => {
      const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
      return isPack;
    });
    
    const prixArticlesNonEligibles = articlesNonEligibles.reduce(
      (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
      0
    );
    
    const prixPacksBoutique = packsBoutique.reduce(
      (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
      0
    );
    
    const prixArticlesEligibles = packMode ? packPrix : articlesEligibles.reduce(
      (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
      0
    );
    
    const sousTotal = prixArticlesEligibles + prixArticlesNonEligibles + prixPacksBoutique;
    const fraisLiv = fraisLivraison.active ? (parseFloat(String(fraisLivraison.montant)) || 0) : 0;
    const totalCommande = sousTotal + fraisLiv;
    panier.forEach((article, index) => {
      const prixArticle = article.prix * (article.quantite || 1);
      const articleId = (article as any).isPack ? (article as any).id : article.id;
      const nomAvecId = (article as any).isPack 
        ? `*${article.nom} (Pack #${articleId})*`
        : `*${article.nom} (#${articleId})*`;
      message += `${index + 1}. ${nomAvecId}\n`;
      message += `   Prix: ${article.prix} FCFA x ${article.quantite || 1} = ${prixArticle.toFixed(0)} FCFA\n\n`;
    });
    
    if (packMode) {
      const prixOriginalArticlesEligibles = articlesEligibles.reduce(
        (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
        0
      );
      const reduction = prixOriginalArticlesEligibles - packPrix;
      if (reduction > 0) {
        message += `💰 *Réduction Pack (${packConfig.reduction}%):* ${Math.round(reduction).toFixed(0)} FCFA\n\n`;
      }
    }
    if (fraisLivraison.active) {
      message += `🚚 *Frais de livraison:* ${fraisLivraison.montant.toLocaleString()} FCFA\n\n`;
    }
    message += `💵 *TOTAL: ${Math.round(totalCommande).toLocaleString()} FCFA*\n\n`;
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    message += 'Lien de paiement WAVE :\n';
    message += `${baseUrl}/paiement?total=${Math.round(totalCommande)}`;
    
    // Créer la commande d'abord
    try {
      await creerCommande({
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: `+225${formData.telephone}`,
        whatsapp: formData.whatsapp || formData.telephone,
        commune: formData.commune,
        adresse_precise: formData.adresse_precise,
        articles: panier,
        total: totalCommande,
        methode_paiement: 'whatsapp',
      });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Erreur lors de la création de la commande');
      return;
    }
    
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 py-6 md:py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 lg:mb-12">
          <h1 className="luxury-title text-4xl md:text-5xl text-[#1A1A1A] font-light">Mon Panier</h1>
          <Link
            href="/"
            className="luxury-text text-sm uppercase tracking-wider bg-[#1A1A1A] text-white px-6 py-3 rounded-sm hover:bg-[#2A2A2A] transition-all duration-300"
          >
            ← Retour
          </Link>
        </div>

        {panier.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 md:p-16 text-center border border-[#E8E0D5]">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] flex items-center justify-center mb-6 shadow-inner">
                <svg
                  className="w-9 h-9 text-[#8B6F47]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.3}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h2 className="luxury-title text-2xl text-[#1A1A1A] font-light mb-2">
                Votre panier est vide
              </h2>
              <p className="luxury-text text-sm text-[#8B7355] mb-8 font-light max-w-sm">
                Explorez notre collection et laissez-vous séduire par nos créations uniques.
              </p>
              <Link
                href="/"
                className="inline-block luxury-text text-xs uppercase tracking-widest bg-[#1A1A1A] text-white px-8 py-3.5 rounded-sm hover:bg-[#2A2A2A] transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Découvrir la collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="md:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-[#E8E0D5]">
                <h2 className="luxury-title text-2xl text-[#3D2817] mb-6 border-b border-[#E8E0D5] pb-4">Articles</h2>
                <div className="space-y-6">
                  {packMode && packInfo && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="luxury-title text-lg text-[#3D2817]">Pack créé par le client</h3>
                          <p className="luxury-text text-sm text-green-700">
                            {packInfo.nombre_packs} pack(s) de {packConfig.nombre_articles} articles = {packInfo.articles_dans_packs} articles avec réduction de {packConfig.reduction}%
                            {packInfo.articles_hors_packs > 0 && ` + ${packInfo.articles_hors_packs} article(s) sans réduction`}
                          </p>
                        </div>
                        <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                          Pack Actif
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Afficher TOUS les articles, avec indication pour ceux dans le pack */}
                  {panier.map((article) => {
                    // Vérifier si c'est un pack boutique
                    const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                    
                    // Vérifier l'éligibilité au pack pour les articles
                    let isEligible = false;
                    let quantiteDansPack = 0;
                    if (!isPack && packMode && packInfo && packConfig.active && packConfig.config) {
                      const config = packConfig.config;
                      if (config.mode === 'articles') {
                        isEligible = config.articles_ids && config.articles_ids.includes(article.id);
                      } else if (config.mode === 'type') {
                        isEligible = config.type_id && (article as any).type_id === config.type_id;
                      }
                      // Vérifier combien d'unités de cet article sont dans le pack
                      if (isEligible && packInfo.articles_dans_pack_map) {
                        quantiteDansPack = packInfo.articles_dans_pack_map[article.id] || 0;
                      }
                    } else if (!isPack && !packMode && packConfig.active && packConfig.config) {
                      const config = packConfig.config;
                      if (config.mode === 'articles') {
                        isEligible = config.articles_ids && config.articles_ids.includes(article.id);
                      } else if (config.mode === 'type') {
                        isEligible = config.type_id && (article as any).type_id === config.type_id;
                      }
                    }
                    
                    const quantite = article.quantite || 1;
                    const quantiteHorsPack = quantite - quantiteDansPack;
                    
                    // Calculer les prix
                    let prixTotal = 0;
                    if (packMode && isEligible && quantiteDansPack > 0) {
                      // Prix avec réduction pour les articles dans le pack
                      const prixDansPack = article.prix * quantiteDansPack * (1 - packConfig.reduction / 100);
                      // Prix sans réduction pour les articles hors pack
                      const prixHorsPack = article.prix * quantiteHorsPack;
                      prixTotal = prixDansPack + prixHorsPack;
                    } else {
                      prixTotal = article.prix * quantite;
                    }
                    
                    // Collecter toutes les images si c'est un pack boutique
                    let packImages: string[] = [];
                    if (isPack && (article as any).articles) {
                      (article as any).articles.forEach((art: any) => {
                        if (art.image_principale) packImages.push(art.image_principale);
                        if (art.images && Array.isArray(art.images)) {
                          art.images.forEach((img: string) => {
                            if (img && !packImages.includes(img)) packImages.push(img);
                          });
                        }
                      });
                    }
                    
                    return (
                      <div 
                        key={article.id} 
                        className={`flex flex-col sm:flex-row justify-between items-start border-b border-[#E8E0D5] pb-4 md:pb-6 last:border-0 gap-3 md:gap-4 ${
                          packMode && isEligible && quantiteDansPack > 0 ? 'bg-green-50/50 rounded-lg p-4 border-2 border-green-300' : ''
                        }`}
                      >
                        {/* Photo ou carrousel */}
                        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-[#E8E0D5] relative mx-auto sm:mx-0">
                          {isPack && packImages.length > 0 ? (
                            <PackImageCarousel images={packImages} />
                          ) : article.image_principale ? (
                            <img 
                              src={article.image_principale} 
                              alt={article.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] flex items-center justify-center">
                              <span className="text-[#8B6F47]/40 text-xs">Pas d'image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="luxury-title text-lg text-[#3D2817]">{article.nom}</h3>
                            {isPack && (
                              <span className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
                                Pack Boutique
                              </span>
                            )}
                            {packMode && isEligible && quantiteDansPack > 0 && (
                              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
                                Dans le pack ({quantiteDansPack})
                              </span>
                            )}
                          </div>
                          <p className="luxury-text text-[#8B6F47] mb-2">
                            {isPack ? (
                              <span>Pack de {(article as any).nombre_articles || ((article as any).articles?.length || 0)} articles</span>
                            ) : (
                              <span>{article.prix.toLocaleString()} FCFA / unité</span>
                            )}
                          </p>
                          {packMode && isEligible && quantiteDansPack > 0 && quantiteHorsPack > 0 && (
                            <p className="luxury-text text-xs text-gray-600 mb-2">
                              {quantiteDansPack} unité(s) avec réduction de {packConfig.reduction}% + {quantiteHorsPack} unité(s) au prix normal
                            </p>
                          )}
                          {packMode && isEligible && quantiteDansPack > 0 && quantiteHorsPack === 0 && (
                            <p className="luxury-text text-xs text-green-700 mb-2 font-semibold">
                              ✓ Toutes les unités bénéficient de la réduction de {packConfig.reduction}%
                            </p>
                          )}
                          {!isPack && !packMode && packConfig.active && (
                            isEligible ? (
                              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                                ✅ Éligible pour bénéficier d'un rabais de {packConfig.reduction}%
                              </span>
                            ) : (
                              <p className="luxury-text text-xs text-red-600 mb-2 font-semibold">
                                ❌ Non éligible à la création d'un pack
                              </p>
                            )
                          )}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                            <button
                              onClick={() => {
                                const nouvelleQuantite = (article.quantite || 1) - 1;
                                if (nouvelleQuantite >= 1) {
                                  modifierQuantite(article.id, nouvelleQuantite);
                                  if (packMode) {
                                    setPackMode(false);
                                    setPackPrix(0);
                                    setPackInfo(null);
                                  }
                                }
                              }}
                              disabled={(article.quantite || 1) <= 1}
                              className={`w-10 h-10 border border-[#D4A574] rounded-lg flex items-center justify-center transition-all duration-300 font-semibold ${
                                (article.quantite || 1) <= 1
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                                  : 'bg-[#F5F1EB] hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]'
                              }`}
                            >
                              −
                            </button>
                            <span className="luxury-text text-lg font-semibold text-[#5C4033] w-8 text-center">{article.quantite || 1}</span>
                            <button
                              onClick={() => {
                                modifierQuantite(article.id, (article.quantite || 1) + 1);
                                if (packMode) {
                                  setPackMode(false);
                                  setPackPrix(0);
                                  setPackInfo(null);
                                }
                              }}
                              className="w-10 h-10 bg-[#F5F1EB] border border-[#D4A574] rounded-lg flex items-center justify-center hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-all duration-300 font-semibold"
                            >
                              +
                            </button>
                            <button
                              onClick={() => {
                                retirerDuPanier(article.id);
                                if (packMode) {
                                  setPackMode(false);
                                  setPackPrix(0);
                                  setPackInfo(null);
                                }
                              }}
                              className="ml-4 luxury-text text-sm text-red-600 hover:text-red-800 transition-colors duration-300"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {packMode && isEligible && quantiteDansPack > 0 ? (
                            <div>
                              <p className="luxury-text text-sm text-gray-500 line-through">
                                {(article.prix * quantite).toLocaleString()} FCFA
                              </p>
                              <p className="luxury-title text-xl font-bold text-green-600">
                                {Math.round(prixTotal).toLocaleString()} FCFA
                              </p>
                              {quantiteHorsPack > 0 && (
                                <p className="luxury-text text-xs text-gray-500 mt-1">
                                  ({quantiteDansPack} avec réduction + {quantiteHorsPack} normal)
                                </p>
                              )}
                            </div>
                          ) : isPack ? (
                            (() => {
                              // Pour les packs boutique, vérifier si prix_original existe et est supérieur au prix
                              const packData = article as any;
                              const prixOriginalValue = packData.prix_original;
                              const prixValue = packData.prix;
                              
                              // Convertir en nombres pour comparaison
                              const prixOriginal = typeof prixOriginalValue === 'number' ? prixOriginalValue : parseFloat(String(prixOriginalValue || 0));
                              const prix = typeof prixValue === 'number' ? prixValue : parseFloat(String(prixValue || 0));
                              
                              // Afficher le prix barré si prix_original existe et est supérieur au prix
                              if (prixOriginal && prixOriginal > prix) {
                                return (
                                  <div>
                                    <p className="luxury-text text-sm text-gray-500 line-through">
                                      {(prixOriginal * quantite).toLocaleString()} FCFA
                                    </p>
                                    <p className="luxury-title text-xl font-bold text-[#B8860B]">
                                      {(prix * quantite).toLocaleString()} FCFA
                                    </p>
                                  </div>
                                );
                              } else {
                                return (
                                  <p className="luxury-title text-xl font-bold text-[#B8860B]">
                                    {(prix * quantite).toLocaleString()} FCFA
                                  </p>
                                );
                              }
                            })()
                          ) : (
                            <p className="luxury-title text-xl font-bold text-[#B8860B]">{(article.prix * quantite).toLocaleString()} FCFA</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-[#E8E0D5] sticky top-24">
              <h2 className="luxury-title text-2xl text-[#3D2817] mb-6 border-b border-[#E8E0D5] pb-4">Résumé</h2>
              <div className="mb-6 space-y-3">
                {!packMode && packConfig.active && packConfig.config && (() => {
                  const articlesEligibles = panier.filter((article) => {
                    const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                    if (isPack) return false;
                    const config = packConfig.config;
                    if (config.mode === 'articles') {
                      return config.articles_ids && config.articles_ids.includes(article.id);
                    } else if (config.mode === 'type') {
                      return config.type_id && (article as any).type_id === config.type_id;
                    }
                    return false;
                  });
                  const totalArticlesEligibles = articlesEligibles.reduce((sum, a) => sum + (a.quantite || 1), 0);
                  return (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
                      <p className="luxury-text text-sm text-[#5C4033] font-semibold mb-1">
                        Articles éligibles au pack: {totalArticlesEligibles} / {packConfig.nombre_articles}
                      </p>
                      {totalArticlesEligibles < packConfig.nombre_articles && (
                        <p className="luxury-text text-xs text-blue-600">
                          Ajoutez {packConfig.nombre_articles - totalArticlesEligibles} article(s) éligible(s) pour bénéficier d'un rabais de {packConfig.reduction}%
                        </p>
                      )}
                    </div>
                  );
                })()}
                {(() => {
                  // Calculer le sous-total correctement
                  // Séparer les articles éligibles, non éligibles et packs boutique
                  const articlesEligibles = panier.filter((article) => {
                    const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                    if (isPack) return false;
                    if (packConfig.active && packConfig.config) {
                      const config = packConfig.config;
                      if (config.mode === 'articles') {
                        return config.articles_ids && config.articles_ids.includes(article.id);
                      } else if (config.mode === 'type') {
                        return config.type_id && (article as any).type_id === config.type_id;
                      }
                    }
                    return false;
                  });
                  
                  const articlesNonEligibles = panier.filter((article) => {
                    const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                    if (isPack) return false;
                    if (packConfig.active && packConfig.config) {
                      const config = packConfig.config;
                      if (config.mode === 'articles') {
                        return !config.articles_ids || !config.articles_ids.includes(article.id);
                      } else if (config.mode === 'type') {
                        return !config.type_id || (article as any).type_id !== config.type_id;
                      }
                    }
                    return true;
                  });
                  
                  const packsBoutique = panier.filter((article) => {
                    const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                    return isPack;
                  });
                  
                  // Calculer le prix original des articles éligibles
                  const prixOriginalArticlesEligibles = articlesEligibles.reduce(
                    (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
                    0
                  );
                  
                  // Calculer le prix des articles non éligibles
                  const prixArticlesNonEligibles = articlesNonEligibles.reduce(
                    (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
                    0
                  );
                  
                  // Calculer le prix des packs boutique
                  const prixPacksBoutique = packsBoutique.reduce(
                    (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
                    0
                  );
                  
                  // Si packMode est actif, utiliser packPrix pour les articles éligibles
                  // Sinon, utiliser le prix original
                  const prixArticlesEligibles = packMode ? packPrix : prixOriginalArticlesEligibles;
                  
                  // Sous-total = articles éligibles (avec ou sans réduction) + articles non éligibles + packs boutique
                  const sousTotal = prixArticlesEligibles + prixArticlesNonEligibles + prixPacksBoutique;
                  
                  // Réduction = prix original des articles éligibles - prix avec réduction
                  const reduction = packMode ? prixOriginalArticlesEligibles - packPrix : 0;
                  
                  return (
                    <>
                      <p className="flex justify-between luxury-text text-[#5C4033]">
                        <span>Sous-total:</span>
                        <span className="font-semibold">{Math.round(sousTotal).toLocaleString()} FCFA</span>
                      </p>
                      {packMode && reduction > 0 && (
                        <p className="flex justify-between luxury-text text-green-700">
                          <span>Réduction Pack ({packConfig.reduction}%):</span>
                          <span className="font-semibold">-{Math.round(reduction).toLocaleString()} FCFA</span>
                        </p>
                      )}
                    </>
                  );
                })()}
                {!formData.commune && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="luxury-text text-xs text-amber-700 font-medium">
                      🚚 Frais de livraison : Veuillez d'abord sélectionner la commune de livraison
                    </p>
                  </div>
                )}
                {formData.commune && (
                  <p className="flex justify-between luxury-text text-[#5C4033]">
                    <span>🚚 Frais de livraison:</span>
                    <span className="font-semibold">
                      {fraisLivraison.active && fraisLivraison.montant > 0 ? (
                        <span>{fraisLivraison.montant.toLocaleString()} FCFA</span>
                      ) : (
                        <span className="text-gray-400 italic">Calcul en cours...</span>
                      )}
                    </span>
                  </p>
                )}
                <div className="pt-3 border-t border-[#E8E0D5]">
                  <p className="flex justify-between luxury-title text-2xl text-[#3D2817]">
                    <span>Total:</span>
                    <span className="text-[#B8860B]">
                      {(() => {
                        // Recalculer le sous-total correctement
                        const articlesEligibles = panier.filter((article) => {
                          const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                          if (isPack) return false;
                          if (packConfig.active && packConfig.config) {
                            const config = packConfig.config;
                            if (config.mode === 'articles') {
                              return config.articles_ids && config.articles_ids.includes(article.id);
                            } else if (config.mode === 'type') {
                              return config.type_id && (article as any).type_id === config.type_id;
                            }
                          }
                          return false;
                        });
                        
                        const articlesNonEligibles = panier.filter((article) => {
                          const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                          if (isPack) return false;
                          if (packConfig.active && packConfig.config) {
                            const config = packConfig.config;
                            if (config.mode === 'articles') {
                              return !config.articles_ids || !config.articles_ids.includes(article.id);
                            } else if (config.mode === 'type') {
                              return !config.type_id || (article as any).type_id !== config.type_id;
                            }
                          }
                          return true;
                        });
                        
                        const packsBoutique = panier.filter((article) => {
                          const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                          return isPack;
                        });
                        
                        const prixArticlesNonEligibles = articlesNonEligibles.reduce(
                          (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
                          0
                        );
                        
                        const prixPacksBoutique = packsBoutique.reduce(
                          (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
                          0
                        );
                        
                        const prixArticlesEligibles = packMode ? packPrix : articlesEligibles.reduce(
                          (sum, a) => sum + Number(a.prix) * (a.quantite || 1),
                          0
                        );
                        
                        const sousTotal = prixArticlesEligibles + prixArticlesNonEligibles + prixPacksBoutique;
                        const totalAvecLivraison = fraisLivraison.active ? sousTotal + fraisLivraison.montant : sousTotal;
                        return Math.round(totalAvecLivraison).toLocaleString();
                      })()} FCFA
                    </span>
                  </p>
                </div>
                {packMode && packInfo && (
                  <>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="luxury-text text-sm text-green-700 font-semibold mb-1">
                        {packInfo.nombre_packs} pack(s) de {packConfig.nombre_articles} articles créé(s)
                      </p>
                      <p className="luxury-text text-xs text-green-600">
                        {packInfo.articles_dans_packs} article(s) avec réduction de {packConfig.reduction}%
                        {packInfo.articles_hors_packs > 0 && ` • ${packInfo.articles_hors_packs} article(s) au prix normal`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setPackMode(false);
                        setPackPrix(0);
                        setPackInfo(null);
                      }}
                      className="w-full mt-4 luxury-text text-xs uppercase tracking-wider bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300"
                    >
                      Annuler le pack
                    </button>
                  </>
                )}
              </div>

              {!packMode && packConfig.active && packConfig.config && (() => {
                // Compter uniquement les articles éligibles
                const articlesEligibles = panier.filter((article) => {
                  const isPack = (article as any).isPack || ((article as any).articles && Array.isArray((article as any).articles));
                  if (isPack) return false;
                  
                  const config = packConfig.config;
                  if (config.mode === 'articles') {
                    return config.articles_ids && config.articles_ids.includes(article.id);
                  } else if (config.mode === 'type') {
                    return config.type_id && (article as any).type_id === config.type_id;
                  }
                  return false;
                });
                
                const totalArticlesEligibles = articlesEligibles.reduce((sum, a) => sum + (a.quantite || 1), 0);
                const totalArticles = panier.reduce((sum, a) => sum + (a.quantite || 1), 0);
                const peutCreerPack = totalArticlesEligibles >= packConfig.nombre_articles;
                
                return (
                  <div className="mb-4 p-4 bg-gradient-to-br from-[#FAF7F0] to-[#F5F1EB] rounded-lg border border-[#E8E0D5]">
                    <div className="mb-3">
                      <p className="luxury-text text-sm text-[#5C4033] mb-1">
                        <span className="font-semibold">Articles dans le panier:</span> {totalArticles} (dont {totalArticlesEligibles} éligible(s))
                      </p>
                      <p className={`luxury-text text-xs ${peutCreerPack ? 'text-green-600' : 'text-[#8B6F47]'}`}>
                        {peutCreerPack 
                          ? `✓ Vous avez ${totalArticlesEligibles} articles éligibles pour un pack avec réduction de ${packConfig.reduction}% (minimum: ${packConfig.nombre_articles})`
                          : `Il vous faut encore ${packConfig.nombre_articles - totalArticlesEligibles} article(s) éligible(s) pour créer un pack`
                        }
                      </p>
                    </div>
                    <button
                      onClick={handlePack}
                      disabled={!peutCreerPack}
                      className={`w-full luxury-text text-sm uppercase tracking-wider text-white py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
                        peutCreerPack
                          ? 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] cursor-pointer'
                          : 'bg-gray-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {peutCreerPack 
                        ? `Créer un Pack (Réduction ${packConfig.reduction}%)`
                        : `Créer un Pack (minimum ${packConfig.nombre_articles} articles éligibles)`
                      }
                    </button>
                  </div>
                );
              })()}

              {/* Formulaire de commande */}
              <div className="mb-6 border-t-2 border-[#E8E0D5] pt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="w-full luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#6B7280] to-[#4B5563] text-white py-3 px-4 rounded-lg hover:from-[#4B5563] hover:to-[#374151] transition-all duration-300 mb-4 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  {showForm ? '▲' : '▼'} Informations de livraison
                </button>

                {showForm && (
                  <div className="space-y-4 bg-[#FAF7F0] p-4 rounded-lg border border-[#E8E0D5]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                          Nom <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                          Prénom <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                        Numéro de téléphone <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 bg-gray-100 border border-r-0 border-[#D4A574] rounded-l-lg luxury-text text-[#5C4033] font-medium">+225</span>
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => {
                            // N'autoriser que les chiffres et maximum 10 chiffres
                            const valeur = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({ ...formData, telephone: valeur });
                          }}
                          placeholder="07 00 00 00 00"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          className="w-full px-3 py-2 border border-l-0 border-[#D4A574] rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Entrez 10 chiffres (ex: 0700000000)</p>
                    </div>

                    <div>
                      <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                        Numéro WhatsApp (optionnel)
                      </label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 bg-gray-100 border border-r-0 border-[#D4A574] rounded-l-lg luxury-text text-[#5C4033] font-medium">+225</span>
                        <input
                          type="tel"
                          value={formData.whatsapp}
                          onChange={(e) => {
                            // N'autoriser que les chiffres et maximum 10 chiffres
                            const valeur = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({ ...formData, whatsapp: valeur });
                          }}
                          placeholder="07 00 00 00 00"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          className="w-full px-3 py-2 border border-l-0 border-[#D4A574] rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Entrez 10 chiffres (ex: 0700000000)</p>
                    </div>

                    <div>
                      <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                        Commune <span className="text-red-600">*</span>
                      </label>
                      {communes && communes.length > 0 ? (
                        <>
                          {/* Message initial pour les frais de livraison */}
                          <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="luxury-text text-sm text-amber-700 font-medium">
                              🚚 Frais de livraison : Veuillez d'abord sélectionner la commune de livraison
                            </p>
                          </div>
                          <select
                            value={formData.commune}
                            onChange={async (e) => {
                              const communeSelectionnee = e.target.value;
                              setFormData({ ...formData, commune: communeSelectionnee });
                              
                              // Récupérer le prix de livraison pour cette commune
                              if (communeSelectionnee) {
                                try {
                                  const res = await getPrixLivraisonCommune(communeSelectionnee);
                                  setFraisLivraison({
                                    active: true,
                                    montant: res.data.prix || 0
                                  });
                                } catch (err) {
                                  console.error('Erreur lors de la récupération du prix:', err);
                                  setFraisLivraison({
                                    active: false,
                                    montant: 0
                                  });
                                }
                              } else {
                                setFraisLivraison({
                                  active: false,
                                  montant: 0
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text"
                            required
                          >
                            <option value="">Sélectionner une commune</option>
                            {communes.map((item) => (
                              <option key={item.commune || `commune-${Math.random()}`} value={item.commune}>
                                {item.commune} - {(item.prix || 0).toLocaleString()} FCFA
                              </option>
                            ))}
                          </select>
                          {formData.commune && fraisLivraison.active && fraisLivraison.montant > 0 && (
                            <p className="mt-2 luxury-text text-sm text-green-600 font-semibold">
                              ✅ Frais de livraison: {fraisLivraison.montant.toLocaleString()} FCFA
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="luxury-text text-sm text-red-700 font-medium">
                            ⚠️ Aucune commune de livraison disponible pour le moment. Veuillez contacter le service client.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 luxury-text text-sm text-[#5C4033] font-medium">
                        Adresse précise de livraison <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        value={formData.adresse_precise}
                        onChange={(e) => setFormData({ ...formData, adresse_precise: e.target.value })}
                        placeholder="Ex: Rue de la Paix, près du marché, immeuble bleu, 2ème étage..."
                        rows={3}
                        className="w-full px-3 py-2 border border-[#D4A574] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] luxury-text resize-none"
                        required
                      />
                      <p className="mt-1 luxury-text text-xs text-[#8B6F47]">
                        Indiquez des détails précis pour faciliter la livraison (quartier, rue, repères, etc.)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Vérification stricte: seulement si waveActive est explicitement true */}
                {waveActive === true ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Double vérification avant d'appeler handlePayerWave
                      if (!waveActive) {
                        alert('Le paiement par WAVE n\'est pas disponible pour le moment.');
                        return;
                      }
                      handlePayerWave();
                    }}
                    className="w-full luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-4 px-6 rounded-lg hover:from-[#B8860B] hover:to-[#9A7209] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] font-semibold cursor-pointer"
                  >
                    Payer avec WAVE
                  </button>
                ) : (
                  <div className="w-full">
                    <button
                      type="button"
                      disabled
                      className="w-full luxury-text text-sm uppercase tracking-wider bg-gray-400 text-white py-4 px-6 rounded-lg cursor-not-allowed transition-all duration-300 shadow-md opacity-75 font-semibold"
                    >
                      Paiement WAVE indisponible
                    </button>
                    <p className="mt-2 text-xs text-amber-600 luxury-text text-center">
                      ⚠️ Le paiement WAVE n'est pas disponible actuellement. Utilisez WhatsApp pour commander.
                    </p>
                  </div>
                )}
                <button
                  onClick={handlePayerWhatsApp}
                  className="w-full luxury-text text-sm uppercase tracking-wider bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-4 px-6 rounded-lg hover:from-[#128C7E] hover:to-[#075E54] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] font-semibold"
                >
                  Commander via WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

