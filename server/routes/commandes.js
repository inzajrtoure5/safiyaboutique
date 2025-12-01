const express = require('express');
const { db } = require('../config/database');
const router = express.Router();

// Créer une commande
router.post('/', (req, res) => {
  const { 
    nom, 
    prenom, 
    telephone, 
    whatsapp, 
    commune, 
    adresse_precise, 
    lieu_livraison, 
    articles, 
    total, 
    methode_paiement 
  } = req.body;

  if (!articles || !total) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  // Construire le lieu de livraison complet
  const lieuComplet = commune && adresse_precise 
    ? `${commune} - ${adresse_precise}` 
    : lieu_livraison || adresse_precise || commune || '';

  db.run(`
    INSERT INTO commandes (
      nom, prenom, telephone, whatsapp, commune, adresse_precise, 
      lieu_livraison, articles, total, methode_paiement
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    nom || '', 
    prenom || '', 
    telephone || '', 
    whatsapp || '', 
    commune || '', 
    adresse_precise || '', 
    lieuComplet, 
    JSON.stringify(articles), 
    total, 
    methode_paiement || 'wave'
  ], function(err) {
    if (err) {
      console.error('Erreur lors de la création de la commande:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // Mettre à jour les visiteurs avec nom/prénom si commande créée
    if (nom && prenom) {
      const clientIp = req.headers['x-forwarded-for'] 
        ? req.headers['x-forwarded-for'].split(',')[0].trim() 
        : req.headers['x-real-ip'] 
        ? req.headers['x-real-ip'] 
        : req.connection.remoteAddress 
        ? req.connection.remoteAddress.replace('::ffff:', '')
        : '';
      
      // Mettre à jour tous les visiteurs avec cette IP qui n'ont pas encore de nom/prénom
      if (clientIp) {
        db.run(`
          UPDATE visiteurs 
          SET nom = ?, prenom = ? 
          WHERE ip = ? AND (nom IS NULL OR nom = '' OR nom = 'Inconnue')
        `, [nom, prenom, clientIp], (updateErr) => {
          if (updateErr) {
            console.error('Erreur lors de la mise à jour du visiteur:', updateErr);
          } else {
            console.log(`Visiteurs mis à jour avec nom/prénom pour IP: ${clientIp}`);
          }
        });
      }
    }
    
    res.json({ id: this.lastID, message: 'Commande créée avec succès' });
  });
});

// Récupérer toutes les commandes (admin)
router.get('/', require('../middleware/auth'), (req, res) => {
  db.all('SELECT * FROM commandes ORDER BY created_at DESC', (err, commandes) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    // Parser les articles avec gestion d'erreur
    const commandesParsed = commandes.map(commande => {
      try {
        const articles = typeof commande.articles === 'string' 
          ? JSON.parse(commande.articles) 
          : commande.articles || [];
        return {
          ...commande,
          articles: Array.isArray(articles) ? articles : []
        };
      } catch (parseErr) {
        console.error(`Erreur lors du parsing des articles pour la commande ${commande.id}:`, parseErr);
        return {
          ...commande,
          articles: []
        };
      }
    });
    res.json(commandesParsed);
  });
});

module.exports = router;


