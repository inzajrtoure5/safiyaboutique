const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Configuration multer pour les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Récupérer tous les articles (public)
router.get('/', (req, res) => {
  const { type_id, search } = req.query;
  let query = `
    SELECT a.*, t.nom as type_nom 
    FROM articles a 
    JOIN types_articles t ON a.type_id = t.id 
    WHERE a.disponible = 1 AND t.actif = 1
  `;
  // Note: indisponible=1 affiche juste un badge, l'article reste visible
  const params = [];

  if (type_id) {
    query += ' AND a.type_id = ?';
    params.push(type_id);
  }

  if (search) {
    query += ' AND a.nom LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY a.created_at DESC';

  db.all(query, params, (err, articles) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(articles.map(article => ({
      ...article,
      images: article.images ? JSON.parse(article.images) : []
    })));
  });
});

// Récupérer un article par ID (public)
router.get('/:id', (req, res) => {
  db.get(`
    SELECT a.*, t.nom as type_nom 
    FROM articles a 
    JOIN types_articles t ON a.type_id = t.id 
    WHERE a.id = ?
  `, [req.params.id], (err, article) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json({
      ...article,
      images: article.images ? JSON.parse(article.images) : []
    });
  });
});

// Créer un article (admin)
router.post('/', authenticate, upload.array('images', 10), (req, res) => {
  const { type_id, nom, prix, prix_original, description } = req.body;
  const files = req.files || [];

  if (!type_id || !nom || !prix) {
    return res.status(400).json({ error: 'Champs manquants (type_id, nom, prix requis)' });
  }

  // Vérifier que le type existe et est actif
  db.get('SELECT id, actif FROM types_articles WHERE id = ?', [type_id], (err, type) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (!type) {
      return res.status(400).json({ error: 'Le type d\'article sélectionné n\'existe pas. Veuillez d\'abord créer un type dans l\'onglet "Types".' });
    }
    
    if (!type.actif) {
      return res.status(400).json({ error: 'Le type d\'article sélectionné est inactif. Veuillez l\'activer ou en choisir un autre.' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imagePrincipale = files[0] ? `${baseUrl}/uploads/${files[0].filename}` : null;
    const images = files.map(file => `${baseUrl}/uploads/${file.filename}`);

    db.run(`
      INSERT INTO articles (type_id, nom, prix, prix_original, description, image_principale, images)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [type_id, nom, prix, prix_original || null, description || '', imagePrincipale, JSON.stringify(images)], function(err) {
      if (err) {
        console.error('Erreur lors de la création de l\'article:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ id: this.lastID, message: 'Article créé avec succès' });
    });
  });
});

// Modifier un article (admin)
router.put('/:id', authenticate, upload.array('images', 10), (req, res) => {
  const { type_id, nom, prix, prix_original, description, images_to_delete } = req.body;
  const files = req.files || [];

  // Récupérer l'article actuel pour conserver les images existantes
  db.get('SELECT image_principale, images FROM articles WHERE id = ?', [req.params.id], (err, currentArticle) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Préparer les images existantes (en excluant celles à supprimer)
    let existingImages = [];
    let existingImagePrincipale = currentArticle?.image_principale || null;

    if (currentArticle) {
      // Récupérer toutes les images existantes
      if (currentArticle.image_principale) {
        existingImages.push(currentArticle.image_principale);
      }
      if (currentArticle.images) {
        try {
          const parsedImages = typeof currentArticle.images === 'string' 
            ? JSON.parse(currentArticle.images) 
            : currentArticle.images;
          if (Array.isArray(parsedImages)) {
            parsedImages.forEach((img) => {
              if (img && !existingImages.includes(img)) {
                existingImages.push(img);
              }
            });
          }
        } catch (e) {
          console.error('Erreur parsing images:', e);
        }
      }
    }

    // Supprimer les images marquées pour suppression
    let imagesToDelete = [];
    if (images_to_delete) {
      try {
        imagesToDelete = typeof images_to_delete === 'string' 
          ? JSON.parse(images_to_delete) 
          : images_to_delete;
      } catch (e) {
        console.error('Erreur parsing images_to_delete:', e);
      }
    }

    // Supprimer les fichiers physiques
    imagesToDelete.forEach((imgUrl) => {
      try {
        // Extraire le nom du fichier de l'URL
        const filename = imgUrl.split('/uploads/')[1];
        if (filename) {
          const filePath = path.join(__dirname, '../uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Image supprimée: ${filePath}`);
          }
        }
      } catch (fileErr) {
        console.error('Erreur lors de la suppression du fichier:', fileErr);
      }
    });

    // Filtrer les images à conserver
    existingImages = existingImages.filter(img => !imagesToDelete.includes(img));
    
    // Si l'image principale est supprimée, prendre la première image restante
    if (imagesToDelete.includes(existingImagePrincipale)) {
      existingImagePrincipale = existingImages.length > 0 ? existingImages[0] : null;
    }

    // Préparer les nouvelles images
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    let newImages = [];
    if (files.length > 0) {
      newImages = files.map(file => `${baseUrl}/uploads/${file.filename}`);
    }

    // Combiner les images existantes (non supprimées) avec les nouvelles
    const finalImages = [...existingImages.filter(img => !newImages.includes(img)), ...newImages];
    const finalImagePrincipale = newImages.length > 0 ? newImages[0] : existingImagePrincipale;

    // Construire la requête SQL
    let query = 'UPDATE articles SET type_id = ?, nom = ?, prix = ?, prix_original = ?, description = ?';
    const params = [type_id, nom, prix, prix_original || null, description || ''];

    // Mettre à jour les images si nécessaire
    query += ', image_principale = ?, images = ?';
    params.push(finalImagePrincipale, JSON.stringify(finalImages));

    query += ' WHERE id = ?';
    params.push(req.params.id);

    db.run(query, params, (err) => {
      if (err) {
        console.error('Erreur lors de la mise à jour:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ message: 'Article modifié avec succès' });
    });
  });
});

// Supprimer un article (admin)
router.delete('/:id', authenticate, (req, res) => {
  db.run('DELETE FROM articles WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ message: 'Article supprimé avec succès' });
  });
});

// Rendre un article disponible/caché (admin) - disponible=0 cache l'article
router.patch('/:id/disponible', authenticate, (req, res) => {
  const { disponible } = req.body;
  db.run('UPDATE articles SET disponible = ? WHERE id = ?', [disponible ? 1 : 0, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ message: 'Statut modifié avec succès' });
  });
});

// Marquer un article comme indisponible (avec badge) - indisponible=1 affiche badge mais article visible
router.patch('/:id/indisponible', authenticate, (req, res) => {
  const { indisponible } = req.body;
  db.run('UPDATE articles SET indisponible = ? WHERE id = ?', [indisponible ? 1 : 0, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ message: 'Badge indisponible modifié avec succès' });
  });
});

module.exports = router;


