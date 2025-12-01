const express = require('express');
const { db } = require('../config/database');
const router = express.Router();

// Récupérer les paramètres publics (réseaux sociaux, contacts, maintenance, alertes)
router.get('/public', (req, res) => {
  const publicParams = [
    'tiktok_url', 'instagram_url', 'whatsapp_url', 'whatsapp_number', 'gmail_url',
    'whatsapp_active', 'tiktok_active', 'instagram_active', 'gmail_active',
    'boutiques_texte', 'boutiques_url', 'boutiques_adresses',
    'alerte_fetes_active', 'alerte_fetes_texte', 'alerte_fetes_reduction',
    'maintenance_active', 'maintenance_message',
    'contact_adresse', 'contact_telephone', 'contact_horaires_jour', 'contact_horaires_heure',
    'accueil_titre', 'accueil_description'
  ];
  
  const placeholders = publicParams.map(() => '?').join(',');
  
  db.all(`SELECT cle, valeur FROM parametres WHERE cle IN (${placeholders})`, 
    publicParams, 
    (err, params) => {
      if (err) {
        console.error('Erreur lors de la récupération des paramètres publics:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      const result = {};
      // Initialiser tous les paramètres avec leurs valeurs par défaut d'abord
      publicParams.forEach(paramName => {
        // Valeurs par défaut pour les booléens actifs
        if (paramName.includes('_active')) {
          // TOUS les _active doivent être désactivés par défaut ('0')
          // Les valeurs de la DB remplaceront les valeurs par défaut
          result[paramName] = '0'; // Désactivé par défaut pour tous
        } else {
          result[paramName] = '';
        }
      });
      
      // Puis remplacer par les valeurs de la DB (même si c'est '0' ou vide)
      params.forEach(param => {
        if (param && param.cle) {
          // Remplacer TOUJOURS, même si la valeur est '0' ou vide
          // C'est important pour que la désactivation fonctionne
          if (param.valeur !== null && param.valeur !== undefined) {
            result[param.cle] = param.valeur;
          }
        }
      });
      
      // Normaliser toutes les valeurs booléennes pour garantir '0' ou '1'
      publicParams.forEach(paramName => {
        if (paramName.includes('_active')) {
          const value = result[paramName];
          // Normaliser strictement: seulement '1' ou 1 = '1', tout le reste = '0'
          // IMPORTANT: Ne pas accepter 'true' comme chaîne, seulement le booléen true
          if (value === '1' || value === 1) {
            result[paramName] = '1';
          } else {
            // Tout le reste (y compris '0', '', null, undefined, false, 'true', etc.) = '0'
            result[paramName] = '0';
          }
          console.log(`Paramètre ${paramName} normalisé: ${value} -> ${result[paramName]}`);
        }
      });
      
      // Format WhatsApp URL si numéro disponible mais pas d'URL
      if (!result.whatsapp_url || result.whatsapp_url.trim() === '') {
        if (result.whatsapp_number && result.whatsapp_number.trim() !== '') {
          const number = result.whatsapp_number.replace(/\D/g, ''); // Enlever tout sauf les chiffres
          result.whatsapp_url = number ? `https://wa.me/${number}` : '';
        }
      }
      
      console.log('Paramètres publics retournés:', result);
      res.json(result);
    }
  );
});

// Récupérer un contenu légal public (sans authentification)
router.get('/contenu-legal/:page', (req, res) => {
  const { page } = req.params;
  
  db.get('SELECT contenu FROM contenus_legaux WHERE page = ?', [page], (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération du contenu légal:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // Toujours retourner le contenu, même s'il est vide
    // Le frontend décidera d'afficher le contenu par défaut si vide
    res.json({ 
      contenu: result ? result.contenu : null, 
      existe: result && result.contenu && result.contenu.trim() !== ''
    });
  });
});

module.exports = router;

