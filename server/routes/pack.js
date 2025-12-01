const express = require('express');
const { db } = require('../config/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Récupérer tous les packs (public - seulement actifs)
router.get('/', (req, res) => {
  db.all('SELECT * FROM pac WHERE actif = 1 ORDER BY created_at DESC', (err, packs) => {
    if (err) {
      console.error('Erreur lors de la récupération des packs:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // Pour chaque pack, récupérer les informations complètes des articles
    const packsWithArticles = packs.map(pack => {
      try {
        const articlesData = JSON.parse(pack.articles || '[]');
        return {
          ...pack,
          articles: Array.isArray(articlesData) ? articlesData : []
        };
      } catch (e) {
        console.error('Erreur lors du parsing des articles du pack:', e, pack);
        return {
          ...pack,
          articles: []
        };
      }
    });
    
    // Récupérer les informations complètes de tous les articles
    const articleIds = new Set();
    packsWithArticles.forEach(pack => {
      if (pack.articles && Array.isArray(pack.articles)) {
        pack.articles.forEach(item => {
          if (item && item.article_id) articleIds.add(item.article_id);
        });
      }
    });
    
    if (articleIds.size === 0) {
      return res.json(packsWithArticles);
    }
    
    const placeholders = Array.from(articleIds).map(() => '?').join(',');
    db.all(`SELECT * FROM articles WHERE id IN (${placeholders})`, Array.from(articleIds), (err, articles) => {
      if (err) {
        console.error('Erreur lors de la récupération des articles:', err);
        return res.json(packsWithArticles); // Retourner les packs sans détails d'articles
      }
      
      // Créer un map des articles par ID (inclure type_id pour le référencement)
      const articlesMap = {};
      if (articles && Array.isArray(articles)) {
        articles.forEach(article => {
          if (article && article.id) {
            articlesMap[article.id] = {
              id: article.id,
              nom: article.nom,
              prix: article.prix,
              description: article.description,
              image_principale: article.image_principale,
              images: article.images ? JSON.parse(article.images) : [],
              indisponible: article.indisponible || 0,
              type_id: article.type_id // Inclure le type_id pour le référencement
            };
          }
        });
      }
      
      // Enrichir les packs avec les informations complètes des articles
      const enrichedPacks = packsWithArticles.map(pack => {
        // Vérifier que pack.articles existe et est un tableau valide
        if (!pack.articles || !Array.isArray(pack.articles) || pack.articles.length === 0) {
          return {
            ...pack,
            prix_original: pack.prix_original || pack.prix || 0,
            articles: [],
            types_ids: []
          };
        }
        
        // TOUJOURS calculer le prix_original à partir de la somme des articles
        const prixOriginalCalcule = pack.articles.reduce((total, item) => {
          if (!item || !item.article_id) return total;
          const article = articlesMap[item.article_id];
          if (article && article.prix) {
            return total + (article.prix * (item.quantite || 1));
          }
          return total;
        }, 0);
        
        // Utiliser le prix_original de la DB s'il existe et est valide, sinon utiliser le calculé
        // Le prix_original doit toujours être la somme des articles individuels
        const prixOriginal = prixOriginalCalcule > 0 ? prixOriginalCalcule : (pack.prix_original || pack.prix);
        
        // Récupérer tous les types d'articles contenus dans le pack (pour le référencement)
        const typesInPack = new Set();
        pack.articles.forEach(item => {
          if (item && item.article_id) {
            const articleFromDb = articles.find(a => a.id === item.article_id);
            if (articleFromDb && articleFromDb.type_id) {
              typesInPack.add(articleFromDb.type_id);
            }
          }
        });

        // Mapper les articles avec leurs type_id
        const mappedArticles = pack.articles.map(item => {
          if (!item || !item.article_id) return null;
          const articleFromDb = articles.find(a => a.id === item.article_id);
          const articleData = articlesMap[item.article_id];
          // Vérifier que l'article existe dans le map
          if (!articleData || !articleData.id) return null;
          return {
            ...articleData,
            quantite: item.quantite || 1,
            type_id: articleFromDb?.type_id || null
          };
        }).filter(article => article !== null && article.id); // Filtrer les articles qui n'existent plus

        return {
          ...pack,
          prix_original: prixOriginal, // Toujours définir prix_original (somme des articles)
          articles: mappedArticles,
          types_ids: Array.from(typesInPack) // Liste des types d'articles contenus dans le pack (toujours un tableau)
        };
      });
      
      res.json(enrichedPacks);
    });
  });
});

// Récupérer tous les packs (admin - inclut les inactifs)
router.get('/admin', authenticate, (req, res) => {
  db.all('SELECT * FROM pac ORDER BY created_at DESC', (err, packs) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // Pour chaque pack, récupérer les informations complètes des articles
    const packsWithArticles = packs.map(pack => {
      const articlesData = JSON.parse(pack.articles || '[]');
      return {
        ...pack,
        articles: articlesData
      };
    });
    
    // Récupérer les informations complètes de tous les articles
    const articleIds = new Set();
    packsWithArticles.forEach(pack => {
      pack.articles.forEach(item => {
        if (item.article_id) articleIds.add(item.article_id);
      });
    });
    
    if (articleIds.size === 0) {
      return res.json(packsWithArticles);
    }
    
    const placeholders = Array.from(articleIds).map(() => '?').join(',');
    db.all(`SELECT * FROM articles WHERE id IN (${placeholders})`, Array.from(articleIds), (err, articles) => {
      if (err) {
        console.error('Erreur lors de la récupération des articles:', err);
        return res.json(packsWithArticles); // Retourner les packs sans détails d'articles
      }
      
      // Créer un map des articles par ID
      const articlesMap = {};
      articles.forEach(article => {
        articlesMap[article.id] = {
          id: article.id,
          nom: article.nom,
          prix: article.prix,
          description: article.description,
          image_principale: article.image_principale,
          images: article.images ? JSON.parse(article.images) : [],
          indisponible: article.indisponible || 0
        };
      });
      
      // Enrichir les packs avec les informations complètes des articles
      const enrichedPacks = packsWithArticles.map(pack => {
        // TOUJOURS calculer le prix_original à partir de la somme des articles
        const prixOriginalCalcule = pack.articles.reduce((total, item) => {
          const article = articlesMap[item.article_id];
          if (article) {
            return total + (article.prix * (item.quantite || 1));
          }
          return total;
        }, 0);
        
        // Utiliser le prix_original de la DB s'il existe et est valide, sinon utiliser le calculé
        // Le prix_original doit toujours être la somme des articles individuels
        const prixOriginal = prixOriginalCalcule > 0 ? prixOriginalCalcule : (pack.prix_original || pack.prix);
        
        return {
          ...pack,
          prix_original: prixOriginal, // Toujours définir prix_original (somme des articles)
          articles: pack.articles.map(item => ({
            ...articlesMap[item.article_id],
            quantite: item.quantite || 1
          })).filter(article => article.id) // Filtrer les articles qui n'existent plus
        };
      });
      
      res.json(enrichedPacks);
    });
  });
});

// Récupérer les paramètres du pack (public)
router.get('/parametres', (req, res) => {
  db.all('SELECT * FROM parametres WHERE cle LIKE "pack_%" OR cle LIKE "frais_livraison%" OR cle = "wave_active"', (err, params) => {
    if (err) {
      console.error('Erreur lors de la récupération des paramètres:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    const parametres = {};
    params.forEach(param => {
      parametres[param.cle] = param.valeur;
    });
    
    // Normaliser wave_active pour garantir '0' ou '1' (comme maintenance_active)
    // IMPORTANT: Seulement '1' est actif, tout le reste = '0'
    if (parametres.wave_active === undefined || parametres.wave_active === null || parametres.wave_active === '') {
      parametres.wave_active = '0'; // Désactivé par défaut
    } else {
      // Normalisation STRICTE: SEULEMENT '1' ou 1 est actif, tout le reste = '0'
      const value = parametres.wave_active;
      if (value === '1' || value === 1) {
        parametres.wave_active = '1';
      } else {
        parametres.wave_active = '0'; // Tout le reste est désactivé
      }
    }
    
    console.log('Paramètres pack - wave_active normalisé:', parametres.wave_active);
    // Retourner directement les paramètres (pas dans un objet data)
    res.json(parametres);
  });
});

// Calculer le prix d'un pack créé par le client
router.post('/calculer-prix-client', (req, res) => {
  const { articles, reduction, nombre_articles } = req.body;

  if (!articles || articles.length === 0) {
    return res.status(400).json({ error: 'Articles manquants' });
  }

  const nombreArticlesParPack = nombre_articles || 2;
  const reductionPercent = reduction || 5;

  // Créer une liste plate de tous les articles avec leurs quantités
  const articlesPlats = [];
  articles.forEach(article => {
    const quantite = article.quantite || 1;
    for (let i = 0; i < quantite; i++) {
      articlesPlats.push({
        id: article.id,
        nom: article.nom,
        prix: article.prix,
        image_principale: article.image_principale
      });
    }
  });

  // Calculer le total original
  let totalOriginal = 0;
  articlesPlats.forEach(article => {
    totalOriginal += article.prix;
  });

  // Calculer le nombre de packs complets
  const nombrePacksComplets = Math.floor(articlesPlats.length / nombreArticlesParPack);
  const articlesDansPacks = nombrePacksComplets * nombreArticlesParPack;
  const articlesHorsPacks = articlesPlats.length - articlesDansPacks;

  // Calculer le prix des articles dans les packs (avec réduction)
  let prixArticlesDansPacks = 0;
  for (let i = 0; i < articlesDansPacks; i++) {
    prixArticlesDansPacks += articlesPlats[i].prix * (1 - reductionPercent / 100);
  }

  // Calculer le prix des articles hors packs (sans réduction)
  let prixArticlesHorsPacks = 0;
  for (let i = articlesDansPacks; i < articlesPlats.length; i++) {
    prixArticlesHorsPacks += articlesPlats[i].prix;
  }

  // Le prix final
  const prixFinal = prixArticlesDansPacks + prixArticlesHorsPacks;
  const economie = totalOriginal - prixFinal;

  // Créer un mapping pour savoir quels articles sont dans les packs
  const articlesDansPackMap = {};
  for (let i = 0; i < articlesDansPacks; i++) {
    const articleId = articlesPlats[i].id;
    articlesDansPackMap[articleId] = (articlesDansPackMap[articleId] || 0) + 1;
  }

  res.json({ 
    prix_original: totalOriginal, 
    prix_final: prixFinal, 
    reduction: economie,
    nombre_packs: nombrePacksComplets,
    articles_dans_packs: articlesDansPacks,
    articles_hors_packs: articlesHorsPacks,
    articles_dans_pack_map: articlesDansPackMap // Mapping article_id -> nombre d'unités dans le pack
  });
});

// Créer un pack (admin)
router.post('/', authenticate, (req, res) => {
  const { nom, description, articles, prix, prix_original, type_id, nombre_articles, actif, created_by } = req.body;

  // Validation avec messages d'erreur détaillés
  if (!nom || nom.trim() === '') {
    return res.status(400).json({ error: 'Le nom du pack est requis' });
  }

  if (!prix || isNaN(parseFloat(prix)) || parseFloat(prix) <= 0) {
    return res.status(400).json({ error: 'Le prix du pack est requis et doit être un nombre positif' });
  }

  if (!articles || !Array.isArray(articles) || articles.length === 0) {
    return res.status(400).json({ error: 'Au moins un article doit être sélectionné' });
  }

  // nombre_articles doit être défini et >= 2
  // Accepter nombre_articles comme nombre ou chaîne
  const nombreArticles = nombre_articles !== undefined && nombre_articles !== null 
    ? (typeof nombre_articles === 'number' ? nombre_articles : parseInt(nombre_articles)) 
    : 2;
  if (isNaN(nombreArticles) || nombreArticles < 2) {
    return res.status(400).json({ error: 'Le nombre d\'articles doit être au moins 2' });
  }

  // Vérifier que le nombre total d'articles correspond (en comptant les quantités)
  // IMPORTANT: Compter la somme des quantités, pas le nombre d'articles différents
  // Exemple: 2 pagnes X + 2 pagnes Y = 4 articles total (même si seulement 2 articles différents)
  const totalArticles = articles.reduce((sum, item) => {
    const quantite = item.quantite || 1;
    return sum + quantite;
  }, 0);
  
  if (totalArticles < nombreArticles) {
    return res.status(400).json({ error: `Le nombre total d'articles (${totalArticles}) doit être au moins égal à ${nombreArticles}. Chaque article compte selon sa quantité (ex: 2 pagnes X + 2 pagnes Y = 4 articles total).` });
  }

  // TOUJOURS calculer le prix original (somme des prix des articles)
  const articleIds = articles.map(a => a.id || a.article_id).filter(id => id);
  if (articleIds.length > 0) {
    const placeholders = articleIds.map(() => '?').join(',');
    db.all(`SELECT id, prix FROM articles WHERE id IN (${placeholders})`, articleIds, (err, articlesFromDb) => {
      if (err) {
        console.error('Erreur lors de la récupération des articles pour calculer prix_original:', err);
        // En cas d'erreur, utiliser le prix fourni comme prix_original
        proceedWithCreation(prix_original || prix);
        return;
      }
      
      let total = 0;
      articles.forEach(article => {
        const articleId = article.id || article.article_id;
        const dbArticle = articlesFromDb.find(a => a.id === articleId);
        if (dbArticle) {
          total += dbArticle.prix * (article.quantite || 1);
        } else if (article.prix) {
          // Si l'article n'est pas trouvé en DB mais a un prix dans la requête
          total += article.prix * (article.quantite || 1);
        }
      });
      
      // Le prix_original est TOUJOURS la somme des prix des articles
      const prixOriginalCalculé = total > 0 ? total : (prix_original || prix);
      proceedWithCreation(prixOriginalCalculé);
    });
  } else {
    // Si pas d'IDs d'articles, utiliser le prix fourni comme prix_original
    proceedWithCreation(prix_original || prix);
  }

  function proceedWithCreation(prixOrig) {
    // Récupérer le nom du type si type_id est fourni
    // Si type_id est null, utiliser "Multi-types" pour type_pac
    if (type_id) {
      db.get('SELECT nom FROM types_articles WHERE id = ?', [type_id], (err, type) => {
        if (err) {
          console.error('Erreur lors de la récupération du type:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        const typeName = type ? type.nom : 'Multi-types';
        createPack(typeName, prixOrig);
      });
    } else {
      // Si pas de type_id, c'est un pack multi-types
      createPack('Multi-types', prixOrig);
    }
  }

  function createPack(typeName, prixOrig) {
    // S'assurer que nombre_articles est bien défini
    const nombreArticlesFinal = nombreArticles || 2;
    // S'assurer que type_pac a toujours une valeur (pas null)
    const typePacFinal = typeName || 'Multi-types';
    
    db.run(`
      INSERT INTO pac (nom, description, type_pac, type_id, prix, prix_original, nombre_articles, articles, actif, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nom.trim(),
      description || '',
      typePacFinal, // Toujours une valeur, jamais null
      type_id || null,
      parseFloat(prix),
      prixOrig ? parseFloat(prixOrig) : parseFloat(prix),
      nombreArticlesFinal,
      JSON.stringify(articles), 
      actif ? 1 : 0,
      created_by || 'boutique'
    ], function(err) {
      if (err) {
        console.error('Erreur lors de la création du pack:', err);
        console.error('Détails de l\'erreur:', err.message);
        console.error('Données envoyées:', {
          nom: nom.trim(),
          description: description || '',
          type_pac: typeName || null,
          type_id: type_id || null,
          prix: parseFloat(prix),
          prix_original: prixOrig ? parseFloat(prixOrig) : parseFloat(prix),
          nombre_articles: nombreArticlesFinal,
          articles_count: articles.length,
          actif: actif ? 1 : 0,
          created_by: created_by || 'boutique'
        });
        return res.status(500).json({ error: `Erreur serveur: ${err.message}` });
      }
      res.json({ id: this.lastID, message: 'Pack créé avec succès' });
    });
  }
});

// Modifier un pack (admin)
router.put('/:id', authenticate, (req, res) => {
  const { nom, description, articles, prix, prix_original, type_id, nombre_articles, actif } = req.body;

  // Validation améliorée avec messages d'erreur plus précis
  if (!nom || nom.trim() === '') {
    return res.status(400).json({ error: 'Le nom du pack est requis' });
  }
  if (!prix || isNaN(parseFloat(prix)) || parseFloat(prix) <= 0) {
    return res.status(400).json({ error: 'Le prix du pack est requis et doit être un nombre positif' });
  }
  if (!articles || !Array.isArray(articles)) {
    return res.status(400).json({ error: 'Les articles sont requis et doivent être un tableau' });
  }
  // Compter le nombre total d'articles (en tenant compte des quantités)
  const totalArticles = articles.reduce((sum, item) => {
    const quantite = item.quantite || 1;
    return sum + quantite;
  }, 0);
  if (totalArticles < 2) {
    return res.status(400).json({ error: 'Le pack doit contenir au moins 2 articles' });
  }

  // Récupérer le nom du type si type_id est fourni
  // Si type_id est null, utiliser "Multi-types" pour type_pac
  if (type_id) {
    db.get('SELECT nom FROM types_articles WHERE id = ?', [type_id], (err, type) => {
      if (err) {
        console.error('Erreur lors de la récupération du type:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      const typeName = type ? type.nom : 'Multi-types';
      updatePack(typeName);
    });
  } else {
    // Si pas de type_id, c'est un pack multi-types
    updatePack('Multi-types');
  }

  function updatePack(typeName) {
    // TOUJOURS recalculer le prix_original lors de la modification
    const articleIds = articles.map(a => a.id || a.article_id).filter(id => id);
    if (articleIds.length > 0) {
      const placeholders = articleIds.map(() => '?').join(',');
      db.all(`SELECT id, prix FROM articles WHERE id IN (${placeholders})`, articleIds, (err, articlesFromDb) => {
        if (err) {
          console.error('Erreur lors de la récupération des articles pour calculer prix_original:', err);
          // En cas d'erreur, utiliser le prix fourni comme prix_original
          doUpdate(prix_original || prix, typeName);
          return;
        }
        
        let total = 0;
        articles.forEach(article => {
          const articleId = article.id || article.article_id;
          const dbArticle = articlesFromDb.find(a => a.id === articleId);
          if (dbArticle) {
            total += dbArticle.prix * (article.quantite || 1);
          } else if (article.prix) {
            total += article.prix * (article.quantite || 1);
          }
        });
        
        const prixOriginalCalculé = total > 0 ? total : (prix_original || prix);
        doUpdate(prixOriginalCalculé, typeName);
      });
    } else {
      doUpdate(prix_original || prix, typeName);
    }
  }

  function doUpdate(prixOrig, typeName) {
    // S'assurer que type_pac a toujours une valeur (pas null)
    const typePacFinal = typeName || 'Multi-types';
    
    db.run(`
      UPDATE pac 
      SET nom = ?, description = ?, type_pac = ?, type_id = ?, prix = ?, prix_original = ?, nombre_articles = ?, articles = ?, actif = ?
      WHERE id = ?
    `, [
      nom,
      description || '',
      typePacFinal, // Toujours une valeur, jamais null
      type_id || null,
      prix,
      prixOrig, // prix_original = somme des prix des articles (toujours calculé)
      nombre_articles || articles.length,
      JSON.stringify(articles), 
      actif ? 1 : 0,
      req.params.id
    ], function(err) {
      if (err) {
        console.error('Erreur lors de la modification du pack:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ message: 'Pack modifié avec succès' });
    });
  }
});

// Activer/désactiver un pack (admin)
router.patch('/:id/actif', authenticate, (req, res) => {
  const { actif } = req.body;
  db.run('UPDATE pac SET actif = ? WHERE id = ?', [actif ? 1 : 0, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ message: 'Statut modifié avec succès' });
  });
});

// Supprimer un pack (admin)
router.delete('/:id', authenticate, (req, res) => {
  db.run('DELETE FROM pac WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ message: 'Pack supprimé avec succès' });
  });
});

module.exports = router;

