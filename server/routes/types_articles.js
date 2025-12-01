const express = require('express');
const { db } = require('../config/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Récupérer tous les types d'articles (public) - éviter les doublons (insensible à la casse)
router.get('/', (req, res) => {
  db.all('SELECT * FROM types_articles WHERE actif = 1 ORDER BY nom', (err, types) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    // Grouper par nom (insensible à la casse) et garder seulement le premier de chaque type
    const uniqueTypes = [];
    const seenNames = new Set();
    types.forEach(type => {
      const nomLower = type.nom.toLowerCase().trim();
      if (!seenNames.has(nomLower)) {
        seenNames.add(nomLower);
        uniqueTypes.push(type);
      }
    });
    res.json(uniqueTypes);
  });
});

// Créer un type d'article (admin) - éviter les doublons
router.post('/', authenticate, (req, res) => {
  const { nom } = req.body;
  if (!nom) {
    return res.status(400).json({ error: 'Nom manquant' });
  }

  const nomNormalise = nom.trim();
  
  // Vérifier si un type avec ce nom (insensible à la casse) existe déjà
  db.get('SELECT * FROM types_articles WHERE LOWER(TRIM(nom)) = LOWER(?)', [nomNormalise], (err, existingType) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (existingType) {
      // Si le type existe mais est inactif, le réactiver
      if (!existingType.actif) {
        db.run('UPDATE types_articles SET actif = 1 WHERE id = ?', [existingType.id], function(updateErr) {
          if (updateErr) {
            return res.status(500).json({ error: 'Erreur serveur' });
          }
          res.json({ id: existingType.id, message: 'Type réactivé avec succès' });
        });
      } else {
        return res.status(400).json({ error: 'Ce type d\'article existe déjà' });
      }
    } else {
      // Créer un nouveau type
      db.run('INSERT INTO types_articles (nom) VALUES (?)', [nomNormalise], function(insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ id: this.lastID, message: 'Type créé avec succès' });
      });
    }
  });
});

// Modifier un type d'article (admin)
router.put('/:id', authenticate, (req, res) => {
  const { nom, actif, pac_autorise } = req.body;
  db.run(
    'UPDATE types_articles SET nom = ?, actif = ?, pac_autorise = ? WHERE id = ?',
    [nom, actif ? 1 : 0, pac_autorise ? 1 : 0, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ message: 'Type modifié avec succès' });
    }
  );
});

// Supprimer un type d'article (admin) - vérifier d'abord s'il est utilisé
router.delete('/:id', authenticate, (req, res) => {
  const typeId = req.params.id;
  
  // Vérifier si des articles utilisent ce type
  db.get('SELECT COUNT(*) as count FROM articles WHERE type_id = ?', [typeId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (result.count > 0) {
      return res.status(400).json({ 
        error: `Ce type ne peut pas être supprimé car ${result.count} article(s) l'utilise(nt). Veuillez d'abord supprimer ou modifier ces articles.` 
      });
    }
    
    // Supprimer définitivement le type (DELETE, pas juste désactivation)
    db.run('DELETE FROM types_articles WHERE id = ?', [typeId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ message: 'Type supprimé définitivement avec succès' });
    });
  });
});

module.exports = router;


