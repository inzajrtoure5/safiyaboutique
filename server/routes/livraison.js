const express = require('express');
const { db } = require('../config/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Récupérer tous les frais de livraison par commune (admin)
router.get('/', authenticate, (req, res) => {
  db.all('SELECT * FROM frais_livraison_communes ORDER BY commune', (err, communes) => {
    if (err) {
      console.error('Erreur lors de la récupération des frais de livraison:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(communes);
  });
});

// Récupérer tous les frais de livraison (public) - UNIQUEMENT les communes actives
router.get('/public', (req, res) => {
  db.all('SELECT commune, prix FROM frais_livraison_communes WHERE actif = 1 ORDER BY commune', (err, communes) => {
    if (err) {
      console.error('Erreur lors de la récupération des frais de livraison:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(communes);
  });
});

// Récupérer le prix pour une commune spécifique (public) - uniquement si active
router.get('/commune/:commune', (req, res) => {
  const { commune } = req.params;
  db.get('SELECT prix FROM frais_livraison_communes WHERE commune = ? AND actif = 1', [commune], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ prix: result ? result.prix : 1500 }); // Défaut à 1500 si pas trouvé ou inactive
  });
});

// Mettre à jour le prix d'une commune (admin)
router.put('/:id', authenticate, (req, res) => {
  const { prix, actif } = req.body;
  
  if (prix === undefined) {
    return res.status(400).json({ error: 'Prix requis' });
  }

  // Normaliser la valeur actif : true/1/'1' = 1, sinon = 0
  let actifValue = 1; // Par défaut actif
  if (actif !== undefined) {
    if (actif === true || actif === 1 || actif === '1' || actif === 'true') {
      actifValue = 1;
    } else {
      actifValue = 0;
    }
  }
  
  console.log(`Mise à jour commune ID ${req.params.id}: prix=${prix}, actif=${actifValue} (valeur reçue: ${actif})`);

  db.run(
    'UPDATE frais_livraison_communes SET prix = ?, actif = ?, updated_at = NOW() WHERE id = ?',
    [prix, actifValue, req.params.id],
    function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du prix de livraison:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      console.log(`Commune ID ${req.params.id} mise à jour: ${this.changes} ligne(s) modifiée(s)`);
      res.json({ message: 'Prix de livraison mis à jour avec succès', actif: actifValue });
    }
  );
});

// Créer une nouvelle commune (admin)
router.post('/', authenticate, (req, res) => {
  const { commune, prix } = req.body;
  
  if (!commune || prix === undefined) {
    return res.status(400).json({ error: 'Commune et prix requis' });
  }

  db.run(
    'INSERT INTO frais_livraison_communes (commune, prix) VALUES (?, ?)',
    [commune, prix],
    function(err) {
      if (err) {
        // Gérer les erreurs UNIQUE pour MySQL (Duplicate entry) et SQLite (UNIQUE constraint failed)
        if (err.message.includes('UNIQUE') || 
            err.message.includes('Duplicate entry') || 
            err.code === 'ER_DUP_ENTRY' ||
            err.errno === 1062) {
          return res.status(400).json({ error: 'Cette commune existe déjà' });
        }
        console.error('Erreur lors de la création de la commune:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ id: this.lastID, message: 'Commune ajoutée avec succès' });
    }
  );
});

// Supprimer une commune (admin)
router.delete('/:id', authenticate, (req, res) => {
  db.run('DELETE FROM frais_livraison_communes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de la commune:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ message: 'Commune supprimée avec succès' });
  });
});

module.exports = router;

