const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { db } = require('../config/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Configuration multer (stockage en mémoire)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ...existing code...

// Récupérer tous les articles (public)
router.get('/', (req, res) => {
  const { type_id, search, page, limit } = req.query;
  const pageNum = page ? Math.max(1, parseInt(String(page), 10) || 1) : 1;
  const limitNum = limit ? Math.max(1, Math.min(100, parseInt(String(limit), 10) || 0)) : 0;
  const usePagination = Boolean(limitNum);

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

  if (usePagination) {
    const offset = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum + 1, offset);
  }

  db.all(query, params, (err, articles) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    const mapped = (articles || []).map(article => ({
      ...article,
      images: article.images ? JSON.parse(article.images) : []
    }));

    if (!usePagination) {
      return res.json(mapped);
    }

    const hasMore = mapped.length > limitNum;
    const items = hasMore ? mapped.slice(0, limitNum) : mapped;
    return res.json({ items, page: pageNum, limit: limitNum, hasMore });
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
router.post('/', authenticate, upload.array('images', 10), async (req, res) => {
  const { type_id, nom, prix, prix_original, description } = req.body;
  const files = req.files || [];

  if (!type_id || !nom || !prix) {
    return res.status(400).json({ error: 'Champs manquants (type_id, nom, prix requis)' });
  }

  // Vérifier que le type existe et est actif
  db.get('SELECT id, actif FROM types_articles WHERE id = ?', [type_id], async (err, type) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (!type) {
      return res.status(400).json({ error: 'Le type d\'article sélectionné n\'existe pas. Veuillez d\'abord créer un type dans l\'onglet "Types".' });
    }
    
    if (!type.actif) {
      return res.status(400).json({ error: 'Le type d\'article sélectionné est inactif. Veuillez l\'activer ou en choisir un autre.' });
    }

    try {
      let imagePrincipale = null;
      const images = [];

      // Upload chaque image sur Cloudinary
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const imageUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'safiya-boutique/articles',
              resource_type: 'auto',
              quality: 'auto',
              fetch_format: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });

        images.push(imageUrl);
        if (i === 0) {
          imagePrincipale = imageUrl;
        }
      }

      // Insérer dans la DB avec les URLs Cloudinary
      db.run(`
        INSERT INTO articles (type_id, nom, prix, prix_original, description, image_principale, images)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [type_id, nom, prix, prix_original || null, description || '', imagePrincipale, JSON.stringify(images)], function(err) {
        if (err) {
          console.error('❌ Erreur création article:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        console.log('✅ Article créé:', this.lastID);
        res.json({ id: this.lastID, message: 'Article créé avec succès' });
      });
    } catch (error) {
      console.error('❌ Erreur Cloudinary:', error);
      res.status(500).json({ error: 'Erreur upload images' });
    }
  });
});
// Modifier un article (admin)
router.put('/:id', authenticate, upload.array('images', 10), async (req, res) => {
  const { type_id, nom, prix, prix_original, description, images_to_delete } = req.body;
  const files = req.files || [];

  db.get('SELECT image_principale, images FROM articles WHERE id = ?', [req.params.id], async (err, currentArticle) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    try {
      let existingImages = [];
      let existingImagePrincipale = currentArticle?.image_principale || null;

      if (currentArticle) {
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
            console.error('Erreur parsing:', e);
          }
        }
      }

      // Traiter les suppressions
      let imagesToDelete = [];
      if (images_to_delete) {
        try {
          imagesToDelete = typeof images_to_delete === 'string' 
            ? JSON.parse(images_to_delete) 
            : images_to_delete;
        } catch (e) {
          console.error('Erreur parsing delete:', e);
        }
      }

      // Supprimer de Cloudinary
      for (const imgUrl of imagesToDelete) {
        try {
          const publicId = imgUrl.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(`safiya-boutique/articles/${publicId}`);
          console.log('✅ Image supprimée:', publicId);
        } catch (error) {
          console.error('Erreur suppression:', error);
        }
      }

      // Filtrer les images restantes
      existingImages = existingImages.filter(img => !imagesToDelete.includes(img));
      if (imagesToDelete.includes(existingImagePrincipale)) {
        existingImagePrincipale = existingImages.length > 0 ? existingImages[0] : null;
      }

      // Upload les nouvelles images
      let newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const imageUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'safiya-boutique/articles',
              resource_type: 'auto',
              quality: 'auto',
              fetch_format: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });

        newImages.push(imageUrl);
      }

      // Combiner les images
      const finalImages = [...existingImages.filter(img => !newImages.includes(img)), ...newImages];
      const finalImagePrincipale = newImages.length > 0 ? newImages[0] : existingImagePrincipale;

      // Mettre à jour la DB
      db.run(`
        UPDATE articles 
        SET type_id = ?, nom = ?, prix = ?, prix_original = ?, description = ?, image_principale = ?, images = ? 
        WHERE id = ?
      `, [type_id, nom, prix, prix_original || null, description || '', finalImagePrincipale, JSON.stringify(finalImages), req.params.id], function(err) {
        if (err) {
          console.error('❌ Erreur modification:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        console.log('✅ Article modifié:', req.params.id);
        res.json({ message: 'Article modifié avec succès' });
      });
    } catch (error) {
      console.error('❌ Erreur:', error);
      res.status(500).json({ error: 'Erreur traitement' });
    }
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


