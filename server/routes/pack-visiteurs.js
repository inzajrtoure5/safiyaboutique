const express = require('express');
const { db } = require('../config/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Récupérer tous les packs visiteurs configurés
router.get('/', authenticate, (req, res) => {
  db.all('SELECT * FROM pack_visiteurs_config ORDER BY created_at DESC', (err, packs) => {
    if (err) {
      console.error('Erreur lors de la récupération des packs visiteurs:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // Parser les articles_ids depuis JSON
    const packsWithParsed = packs.map(pack => ({
      ...pack,
      articles_ids: pack.articles_ids ? JSON.parse(pack.articles_ids) : []
    }));
    
    res.json(packsWithParsed);
  });
});

// Récupérer tous les packs visiteurs actifs (public)
router.get('/public', (req, res) => {
  db.all('SELECT * FROM pack_visiteurs_config WHERE actif = 1 ORDER BY created_at DESC', (err, packs) => {
    if (err) {
      console.error('Erreur lors de la récupération des packs visiteurs:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // Parser les articles_ids depuis JSON
    const packsWithParsed = packs.map(pack => ({
      ...pack,
      articles_ids: pack.articles_ids ? JSON.parse(pack.articles_ids) : []
    }));
    
    res.json(packsWithParsed);
  });
});

// Récupérer un pack visiteur par ID
router.get('/:id', authenticate, (req, res) => {
  db.get('SELECT * FROM pack_visiteurs_config WHERE id = ?', [req.params.id], (err, pack) => {
    if (err) {
      console.error('Erreur lors de la récupération du pack visiteur:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (!pack) {
      return res.status(404).json({ error: 'Pack visiteur non trouvé' });
    }
    
    pack.articles_ids = pack.articles_ids ? JSON.parse(pack.articles_ids) : [];
    res.json(pack);
  });
});

// Créer un nouveau pack visiteur
router.post('/', authenticate, (req, res) => {
  const { nom, mode, articles_ids, type_id, reduction, nombre_articles, actif } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  if (!mode || !['articles', 'type'].includes(mode)) {
    return res.status(400).json({ error: 'Le mode doit être "articles" ou "type"' });
  }

  if (mode === 'articles' && (!articles_ids || !Array.isArray(articles_ids) || articles_ids.length === 0)) {
    return res.status(400).json({ error: 'Les articles sont requis en mode "articles"' });
  }

  if (mode === 'type' && !type_id) {
    return res.status(400).json({ error: 'Le type est requis en mode "type"' });
  }

  if (!reduction || reduction < 0 || reduction > 100) {
    return res.status(400).json({ error: 'La réduction doit être entre 0 et 100' });
  }

  if (!nombre_articles || nombre_articles < 2) {
    return res.status(400).json({ error: 'Le nombre d\'articles doit être au moins 2' });
  }

  db.run(`
    INSERT INTO pack_visiteurs_config (nom, mode, articles_ids, type_id, reduction, nombre_articles, actif)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    nom.trim(),
    mode,
    mode === 'articles' ? JSON.stringify(articles_ids) : null,
    mode === 'type' ? type_id : null,
    reduction,
    nombre_articles,
    actif ? 1 : 0
  ], function(err) {
    if (err) {
      console.error('Erreur lors de la création du pack visiteur:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ id: this.lastID, message: 'Pack visiteur créé avec succès' });
  });
});

// Modifier un pack visiteur
router.put('/:id', authenticate, (req, res) => {
  const { nom, mode, articles_ids, type_id, reduction, nombre_articles, actif } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  if (!mode || !['articles', 'type'].includes(mode)) {
    return res.status(400).json({ error: 'Le mode doit être "articles" ou "type"' });
  }

  if (mode === 'articles' && (!articles_ids || !Array.isArray(articles_ids) || articles_ids.length === 0)) {
    return res.status(400).json({ error: 'Les articles sont requis en mode "articles"' });
  }

  if (mode === 'type' && !type_id) {
    return res.status(400).json({ error: 'Le type est requis en mode "type"' });
  }

  if (!reduction || reduction < 0 || reduction > 100) {
    return res.status(400).json({ error: 'La réduction doit être entre 0 et 100' });
  }

  if (!nombre_articles || nombre_articles < 2) {
    return res.status(400).json({ error: 'Le nombre d\'articles doit être au moins 2' });
  }

  db.run(`
    UPDATE pack_visiteurs_config 
    SET nom = ?, mode = ?, articles_ids = ?, type_id = ?, reduction = ?, nombre_articles = ?, actif = ?
    WHERE id = ?
  `, [
    nom.trim(),
    mode,
    mode === 'articles' ? JSON.stringify(articles_ids) : null,
    mode === 'type' ? type_id : null,
    reduction,
    nombre_articles,
    actif ? 1 : 0,
    req.params.id
  ], function(err) {
    if (err) {
      console.error('Erreur lors de la modification du pack visiteur:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pack visiteur non trouvé' });
    }
    res.json({ message: 'Pack visiteur modifié avec succès' });
  });
});

// Supprimer un pack visiteur
router.delete('/:id', authenticate, (req, res) => {
  db.run('DELETE FROM pack_visiteurs_config WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression du pack visiteur:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pack visiteur non trouvé' });
    }
    res.json({ message: 'Pack visiteur supprimé avec succès' });
  });
});

// Activer/désactiver un pack visiteur
router.patch('/:id/actif', authenticate, (req, res) => {
  const { actif } = req.body;
  
  db.run('UPDATE pack_visiteurs_config SET actif = ? WHERE id = ?', [actif ? 1 : 0, req.params.id], function(err) {
    if (err) {
      console.error('Erreur lors de la modification du statut:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pack visiteur non trouvé' });
    }
    res.json({ message: 'Statut modifié avec succès' });
  });
});

module.exports = router;

