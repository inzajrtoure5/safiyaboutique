const express = require('express');
const { db } = require('../config/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Récupérer les statistiques
router.get('/stats', authenticate, (req, res) => {
  const stats = {};

  // Nombre total de visites (toutes les visites)
  db.get('SELECT COUNT(*) as count FROM visiteurs', (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    stats.visiteurs = result.count;
    
    // Nombre de visiteurs uniques (par IP distincte)
    db.get('SELECT COUNT(DISTINCT ip) as count FROM visiteurs WHERE ip IS NOT NULL AND ip != ""', (err, resultUnique) => {
      if (err) {
        console.error('Erreur lors du comptage des visiteurs uniques:', err);
        stats.visiteurs_uniques = 0;
      } else {
        stats.visiteurs_uniques = resultUnique ? resultUnique.count : 0;
      }

    // Nombre de commandes
    db.get('SELECT COUNT(*) as count FROM commandes', (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      stats.commandes = result.count;

      // Statistiques détaillées des articles
      Promise.all([
        new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM articles', (err, result) => {
            if (err) reject(err);
            else resolve({ total: result.count });
          });
        }),
        new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM articles WHERE disponible = 1', (err, result) => {
            if (err) reject(err);
            else resolve({ disponibles: result.count });
          });
        }),
        new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM articles WHERE disponible = 0', (err, result) => {
            if (err) reject(err);
            else resolve({ caches: result.count });
          });
        }),
        new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM articles WHERE indisponible = 1', (err, result) => {
            if (err) reject(err);
            else resolve({ indisponibles: result.count });
          });
        }),
        new Promise((resolve, reject) => {
          db.get(`SELECT COUNT(*) as count FROM articles a 
                  JOIN types_articles t ON a.type_id = t.id 
                  WHERE a.disponible = 1 AND t.actif = 1`, (err, result) => {
            if (err) reject(err);
            else resolve({ affiches: result.count });
          });
        }),
        new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM pac', (err, result) => {
            if (err) reject(err);
            else resolve({ packs_total: result.count });
          });
        }),
        new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM pac WHERE actif = 1', (err, result) => {
            if (err) reject(err);
            else resolve({ packs_actifs: result.count });
          });
        }),
        new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM pac WHERE actif = 0', (err, result) => {
            if (err) reject(err);
            else resolve({ packs_inactifs: result.count });
          });
        })
      ]).then(results => {
        const articlesStats = Object.assign({}, ...results.slice(0, 5));
        const packsStats = Object.assign({}, ...results.slice(5));
        
        stats.articles = articlesStats.total || 0;
        stats.articles_disponibles = articlesStats.disponibles || 0;
        stats.articles_caches = articlesStats.caches || 0;
        stats.articles_indisponibles = articlesStats.indisponibles || 0;
        stats.articles_affiches = articlesStats.affiches || 0;
        
        stats.packs_total = packsStats.packs_total || 0;
        stats.packs_actifs = packsStats.packs_actifs || 0;
        stats.packs_inactifs = packsStats.packs_inactifs || 0;
        
        res.json(stats);
      }).catch(err => {
        console.error('Erreur lors du calcul des statistiques:', err);
        res.status(500).json({ error: 'Erreur serveur' });
      });
    });
    });
  });
});

// Récupérer les paramètres (admin uniquement)
router.get('/parametres', authenticate, (req, res) => {
  db.all('SELECT * FROM parametres', (err, params) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    const parametres = {};
    
    // Valeurs par défaut pour les paramètres booléens
    // TOUS les _active doivent être désactivés ('0') par défaut
    const defaults = {
      'wave_active': '0',
      'pack_active': '0',
      'frais_livraison_active': '1',
      'tiktok_active': '0',  // Désactivé par défaut (comme maintenance)
      'instagram_active': '0',  // Désactivé par défaut (comme maintenance)
      'whatsapp_active': '0',  // Désactivé par défaut (comme maintenance)
      'gmail_active': '0',  // Désactivé par défaut (comme maintenance)
      'alerte_fetes_active': '0',
      'maintenance_active': '0'
    };
    
    params.forEach(param => {
      parametres[param.cle] = param.valeur;
    });
    
    // Appliquer les valeurs par défaut si elles n'existent pas ET normaliser toutes les valeurs booléennes
    Object.keys(defaults).forEach(key => {
      if (parametres[key] === undefined || parametres[key] === null || parametres[key] === '') {
        parametres[key] = defaults[key];
      } else if (key.includes('_active') || key === 'wave_active') {
        // Normaliser explicitement les valeurs booléennes pour garantir '0' ou '1'
        const value = parametres[key];
        parametres[key] = (value === '1' || value === 1 || value === true || value === 'true') ? '1' : '0';
      }
    });
    
    // Normalisation stricte pour wave_active et tous les réseaux sociaux
    // IMPORTANT: Ne pas écraser les valeurs '1' ou '0' déjà normalisées
    const activeParams = ['wave_active', 'tiktok_active', 'instagram_active', 'whatsapp_active', 'gmail_active', 'maintenance_active', 'alerte_fetes_active'];
    activeParams.forEach(key => {
      // Si la valeur est déjà '1' ou '0', la conserver telle quelle (déjà normalisée)
      if (parametres[key] === '1' || parametres[key] === '0') {
        // Valeur déjà normalisée, ne pas la modifier
        return;
      }
      // Sinon, normaliser
      if (!parametres[key] || parametres[key] === '' || parametres[key] === null || parametres[key] === undefined) {
        parametres[key] = '0';
      } else {
        parametres[key] = (parametres[key] === '1' || parametres[key] === 1 || parametres[key] === true || parametres[key] === 'true') ? '1' : '0';
      }
    });
    
    console.log('Paramètres admin retournés:', Object.keys(parametres).filter(k => k.includes('_active')).map(k => `${k}=${parametres[k]}`).join(', '));
    res.json(parametres);
  });
});

// Récupérer uniquement le numéro WhatsApp (public)
router.get('/whatsapp-number', (req, res) => {
  db.get('SELECT valeur FROM parametres WHERE cle = ?', ['whatsapp_number'], (err, param) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ whatsapp_number: param?.valeur || '' });
  });
});

// ✅ Modifier les paramètres
router.put('/parametres', authenticate, (req, res) => {
  let bodyData = req.body;
  
  // Si c'est un tableau de paires, le convertir en objet
  if (Array.isArray(bodyData)) {
    bodyData = {};
    req.body.forEach(([cle, valeur]) => {
      if (cle) {
        bodyData[cle] = valeur;
      }
    });
  }
  
  // ✅ INCLURE TOUS LES PARAMÈTRES POSSIBLES
  const { 
    whatsapp_number, whatsapp_url, whatsapp_active,
    tiktok_url, tiktok_active,
    instagram_url, instagram_active,
    gmail_url, gmail_active,
    boutiques_texte, boutiques_url, boutiques_adresses,
    alerte_fetes_active, alerte_fetes_texte, alerte_fetes_reduction,
    maintenance_active, maintenance_message,
    wave_account, wave_merchant_code, wave_active, 
    pack_active, pack_nombre_articles, pack_reduction, 
    pack_visiteurs_active, pack_visiteurs_articles, pack_visiteurs_config, 
    frais_livraison_active, frais_livraison_montant,
    contact_adresse, contact_telephone, contact_horaires_jour, contact_horaires_heure,
    accueil_titre, accueil_description
  } = bodyData;

  console.log('Requête de mise à jour des paramètres reçue:', Object.keys(bodyData));

  const updates = [];
  
  // ✅ TOUS LES PARAMÈTRES - ajouter les manquants
  if (whatsapp_number !== undefined) {
    updates.push(['whatsapp_number', String(whatsapp_number || '')]);
  }
  if (whatsapp_url !== undefined) {
    updates.push(['whatsapp_url', String(whatsapp_url || '')]);
  }
  if (whatsapp_active !== undefined) {
    const whatsappValue = (whatsapp_active === '1' || whatsapp_active === 1 || whatsapp_active === true || whatsapp_active === 'true') ? '1' : '0';
    updates.push(['whatsapp_active', whatsappValue]);
  }
  
  if (tiktok_url !== undefined) {
    updates.push(['tiktok_url', String(tiktok_url || '')]);
  }
  if (tiktok_active !== undefined) {
    const tiktokValue = (tiktok_active === '1' || tiktok_active === 1 || tiktok_active === true || tiktok_active === 'true') ? '1' : '0';
    updates.push(['tiktok_active', tiktokValue]);
  }
  
  if (instagram_url !== undefined) {
    updates.push(['instagram_url', String(instagram_url || '')]);
  }
  if (instagram_active !== undefined) {
    const instaValue = (instagram_active === '1' || instagram_active === 1 || instagram_active === true || instagram_active === 'true') ? '1' : '0';
    updates.push(['instagram_active', instaValue]);
  }
  
  if (gmail_url !== undefined) {
    updates.push(['gmail_url', String(gmail_url || '')]);
  }
  if (gmail_active !== undefined) {
    const gmailValue = (gmail_active === '1' || gmail_active === 1 || gmail_active === true || gmail_active === 'true') ? '1' : '0';
    updates.push(['gmail_active', gmailValue]);
  }
  
  // ✅ AJOUTER LES PARAMÈTRES MANQUANTS
  if (boutiques_texte !== undefined) {
    updates.push(['boutiques_texte', String(boutiques_texte || 'Vos boutiques bientôt disponibles')]);
  }
  if (boutiques_url !== undefined) {
    updates.push(['boutiques_url', String(boutiques_url || '')]);
  }
  if (boutiques_adresses !== undefined) {
    updates.push(['boutiques_adresses', String(boutiques_adresses || '')]);
  }
  
  if (alerte_fetes_active !== undefined) {
    const alerteValue = (alerte_fetes_active === '1' || alerte_fetes_active === 1 || alerte_fetes_active === true || alerte_fetes_active === 'true') ? '1' : '0';
    updates.push(['alerte_fetes_active', alerteValue]);
  }
  if (alerte_fetes_texte !== undefined) {
    updates.push(['alerte_fetes_texte', String(alerte_fetes_texte || '')]);
  }
  if (alerte_fetes_reduction !== undefined) {
    updates.push(['alerte_fetes_reduction', String(alerte_fetes_reduction || '0')]);
  }
  
  if (maintenance_active !== undefined) {
    const maintenanceValue = (maintenance_active === '1' || maintenance_active === 1 || maintenance_active === true || maintenance_active === 'true') ? '1' : '0';
    updates.push(['maintenance_active', maintenanceValue]);
  }
  if (maintenance_message !== undefined) {
    updates.push(['maintenance_message', String(maintenance_message || '')]);
  }
  
  if (wave_account !== undefined) {
    updates.push(['wave_account', String(wave_account || '')]);
  }
  if (wave_merchant_code !== undefined) {
    updates.push(['wave_merchant_code', String(wave_merchant_code || '')]);
  }
  if (wave_active !== undefined) {
    const waveValue = (wave_active === '1' || wave_active === 1 || wave_active === true || wave_active === 'true') ? '1' : '0';
    updates.push(['wave_active', waveValue]);
  }
  
  if (pack_active !== undefined) {
    const packValue = (pack_active === '1' || pack_active === 1 || pack_active === true || pack_active === 'true') ? '1' : '0';
    updates.push(['pack_active', packValue]);
  }
  if (pack_nombre_articles !== undefined) {
    updates.push(['pack_nombre_articles', String(pack_nombre_articles || '3')]);
  }
  if (pack_reduction !== undefined) {
    updates.push(['pack_reduction', String(pack_reduction || '5')]);
  }
  
  if (frais_livraison_active !== undefined) {
    const fraisValue = (frais_livraison_active === '1' || frais_livraison_active === 1 || frais_livraison_active === true || frais_livraison_active === 'true') ? '1' : '0';
    updates.push(['frais_livraison_active', fraisValue]);
  }
  if (frais_livraison_montant !== undefined) {
    updates.push(['frais_livraison_montant', String(frais_livraison_montant || '1500')]);
  }
  
  if (contact_adresse !== undefined) {
    updates.push(['contact_adresse', String(contact_adresse || '')]);
  }
  if (contact_telephone !== undefined) {
    updates.push(['contact_telephone', String(contact_telephone || '')]);
  }
  if (contact_horaires_jour !== undefined) {
    updates.push(['contact_horaires_jour', String(contact_horaires_jour || '')]);
  }
  if (contact_horaires_heure !== undefined) {
    updates.push(['contact_horaires_heure', String(contact_horaires_heure || '')]);
  }
  
  if (accueil_titre !== undefined) {
    updates.push(['accueil_titre', String(accueil_titre || '')]);
  }
  if (accueil_description !== undefined) {
    updates.push(['accueil_description', String(accueil_description || '')]);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Aucun paramètre à mettre à jour' });
  }

  let completed = 0;
  let hasError = false;

  updates.forEach(([cle, valeur]) => {
    db.run(
      'INSERT INTO parametres (cle, valeur) VALUES (?, ?) ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)',
      [cle, valeur],
      function(err) {
        completed++;
        
        if (err) {
          console.error(`❌ Erreur lors de la mise à jour de ${cle}:`, err);
          hasError = true;
          const errorMessage = `Erreur lors de la mise à jour de ${cle}: ${err.message}`;
          
          if (completed === updates.length) {
            return res.status(500).json({ error: errorMessage });
          }
        } else {
          console.log(`✅ ${cle} mis à jour avec succès`);
        }

        if (completed === updates.length && !hasError) {
          console.log('✅ Tous les paramètres ont été mis à jour avec succès');
          res.json({ message: 'Paramètres mis à jour avec succès' });
        }
      }
    );
  });
});

// Récupérer tous les types d'articles (admin)
router.get('/types-articles', authenticate, (req, res) => {
  db.all('SELECT * FROM types_articles ORDER BY nom', (err, types) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(types);
  });
});

// Récupérer tous les articles (admin - inclut les indisponibles ET même ceux avec types inactifs)
router.get('/articles', authenticate, (req, res) => {
  const query = `
    SELECT a.*, 
           COALESCE(t.nom, 'Type supprimé') as type_nom,
           t.actif as type_actif
    FROM articles a 
    LEFT JOIN types_articles t ON a.type_id = t.id 
    ORDER BY a.created_at DESC
  `;
  db.all(query, (err, articles) => {
    if (err) {
      console.error('Erreur lors de la récupération des articles:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // ✅ NE PAS MODIFIER LES CHEMINS - Les laisser tels quels
    res.json(articles.map(article => ({
      ...article,
      images: article.images ? JSON.parse(article.images || '[]') : []
    })));
  });
});

// Réinitialiser uniquement les statistiques (visites, visiteurs, commandes)
router.post('/reinitialiser-stats', authenticate, (req, res) => {
  console.log('Réinitialisation des statistiques demandée par:', req.user?.username);
  
  db.serialize(() => {
    // 1. Supprimer toutes les commandes
    db.run('DELETE FROM commandes', (err1) => {
      if (err1) {
        console.error('Erreur suppression commandes:', err1);
        return res.status(500).json({ error: 'Erreur lors de la suppression des commandes' });
      }
      
      // 2. Supprimer tous les visiteurs
      db.run('DELETE FROM visiteurs', (err2) => {
        if (err2) {
          console.error('Erreur suppression visiteurs:', err2);
          return res.status(500).json({ error: 'Erreur lors de la suppression des visiteurs' });
        }
        
        console.log('✅ Statistiques réinitialisées (commandes et visiteurs supprimés)');
        res.json({ 
          message: 'Statistiques réinitialisées avec succès. Les visites, visiteurs et commandes ont été supprimés. Les articles, packs, livraison et contenus légaux sont intacts.' 
        });
      });
    });
  });
});

// Réinitialiser le site (supprimer TOUT)
router.post('/reinitialiser', authenticate, (req, res) => {
  console.log('Réinitialisation complète du site demandée par:', req.user?.username);
  
  // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
  db.serialize(() => {
    // 1. Supprimer toutes les commandes
    db.run('DELETE FROM commandes', (err1) => {
      if (err1) console.error('Erreur suppression commandes:', err1);
    });
    
    // 2. Supprimer tous les visiteurs
    db.run('DELETE FROM visiteurs', (err2) => {
      if (err2) console.error('Erreur suppression visiteurs:', err2);
    });
    
    // 3. Supprimer tous les packs
    db.run('DELETE FROM pac', (err3) => {
      if (err3) console.error('Erreur suppression packs:', err3);
    });
    
    // 4. Supprimer tous les articles
    db.run('DELETE FROM articles', (err4) => {
      if (err4) {
        console.error('Erreur lors de la suppression des articles:', err4);
        return res.status(500).json({ error: 'Erreur serveur lors de la réinitialisation' });
      }
      
      // 5. Supprimer TOUS les types définitivement
      db.run('DELETE FROM types_articles', (err5) => {
        if (err5) {
          console.error('Erreur lors de la suppression des types:', err5);
          return res.status(500).json({ error: 'Erreur lors de la suppression des types' });
        }
        
        console.log('✅ Site complètement réinitialisé (articles, types, packs, commandes, visiteurs supprimés)');
        res.json({ 
          message: 'Site complètement réinitialisé. Tous les articles, types, packs, commandes et visiteurs ont été supprimés définitivement. Veuillez créer un nouveau type avant d\'ajouter des articles.' 
        });
      });
    });
  });
});

// Récupérer tous les admins
router.get('/admins', authenticate, (req, res) => {
  db.all('SELECT id, username, created_at, blocked FROM admins ORDER BY created_at DESC', (err, admins) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    // Normaliser blocked (peut être null, 0 ou 1)
    const normalizedAdmins = admins.map(admin => ({
      ...admin,
      blocked: admin.blocked === 1 || admin.blocked === true
    }));
    res.json(normalizedAdmins);
  });
});

// Créer un nouvel admin
router.post('/admins', authenticate, (req, res) => {
  const { username, password } = req.body;
  const currentAdminId = req.user.id;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username et password requis' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) {
      // Gérer les erreurs UNIQUE pour MySQL (Duplicate entry) et SQLite (UNIQUE constraint failed)
      if (err.message.includes('UNIQUE constraint failed') || 
          err.message.includes('Duplicate entry') || 
          err.code === 'ER_DUP_ENTRY' ||
          err.errno === 1062) {
        return res.status(400).json({ error: 'Ce nom d\'utilisateur existe déjà' });
      }
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // Enregistrer le log
    db.run('INSERT INTO admin_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())', 
      [this.lastID, 'create', JSON.stringify({ created_by: currentAdminId, username: username })], 
      (logErr) => {
        if (logErr) console.error('Erreur lors de l\'enregistrement du log:', logErr);
      }
    );
    
    res.json({ id: this.lastID, message: 'Admin créé avec succès' });
  });
});

// Modifier le mot de passe d'un admin
router.put('/admins/:id/password', authenticate, (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const currentAdminId = req.user.id;
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Enregistrer le log
  db.run('INSERT INTO admin_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())', 
    [id, 'password_change', JSON.stringify({ changed_by: currentAdminId })], 
    (logErr) => {
      if (logErr) console.error('Erreur lors de l\'enregistrement du log:', logErr);
    }
  );

  db.run('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ message: 'Mot de passe modifié avec succès' });
  });
});

// Bloquer/Débloquer un admin
router.put('/admins/:id/block', authenticate, (req, res) => {
  const { id } = req.params;
  const { blocked } = req.body;
  const currentAdminId = req.user.id; // ID de l'admin qui fait l'action
  
  // Vérifier qu'on ne bloque pas le dernier admin actif
  if (blocked) {
    // Compter les admins actifs EN EXCLUANT celui qu'on essaie de bloquer
    db.get('SELECT COUNT(*) as count FROM admins WHERE (blocked = 0 OR blocked IS NULL) AND id != ?', [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (result.count < 1) {
        return res.status(400).json({ error: 'Impossible de bloquer le dernier admin actif. Il doit rester au moins un admin actif.' });
      }

      // Enregistrer le log avant de bloquer
      const action = `Admin bloqué par l'admin #${currentAdminId}`;
      db.run('INSERT INTO admin_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())', 
        [id, 'block', JSON.stringify({ blocked_by: currentAdminId, action: action })], 
        (logErr) => {
          if (logErr) console.error('Erreur lors de l\'enregistrement du log:', logErr);
        }
      );

      db.run('UPDATE admins SET blocked = 1 WHERE id = ?', [id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: 'Admin bloqué avec succès' });
      });
    });
  } else {
    // Enregistrer le log avant de débloquer
    const action = `Admin débloqué par l'admin #${currentAdminId}`;
    db.run('INSERT INTO admin_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())', 
      [id, 'unblock', JSON.stringify({ unblocked_by: currentAdminId, action: action })], 
      (logErr) => {
        if (logErr) console.error('Erreur lors de l\'enregistrement du log:', logErr);
      }
    );

    db.run('UPDATE admins SET blocked = 0 WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ message: 'Admin débloqué avec succès' });
    });
  }
});

// Supprimer un admin
router.delete('/admins/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const currentAdminId = req.user.id;
  
  // Ne pas permettre de supprimer le dernier admin
  db.get('SELECT COUNT(*) as count FROM admins', (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (result.count <= 1) {
      return res.status(400).json({ error: 'Impossible de supprimer le dernier admin' });
    }

    // Récupérer le username avant suppression pour le log
    db.get('SELECT username FROM admins WHERE id = ?', [id], (err, admin) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      // Enregistrer le log avant suppression
      db.run('INSERT INTO admin_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())', 
        [id, 'delete', JSON.stringify({ deleted_by: currentAdminId, username: admin?.username || 'N/A' })], 
        (logErr) => {
          if (logErr) console.error('Erreur lors de l\'enregistrement du log:', logErr);
        }
      );

      db.run('DELETE FROM admins WHERE id = ?', [id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: 'Admin supprimé avec succès' });
      });
    });
  });
});

// Récupérer les logs d'activités des admins
router.get('/admin-logs', authenticate, (req, res) => {
  const { admin_id, action, limit = 100 } = req.query;
  
  let query = 'SELECT al.*, a.username FROM admin_logs al LEFT JOIN admins a ON al.admin_id = a.id WHERE 1=1';
  const params = [];
  
  if (admin_id) {
    query += ' AND al.admin_id = ?';
    params.push(admin_id);
  }
  
  if (action) {
    query += ' AND al.action = ?';
    params.push(action);
  }
  
  query += ' ORDER BY al.created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(query, params, (err, logs) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    const logsWithParsedDetails = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
    
    res.json(logsWithParsedDetails);
  });
});

// ========== ROUTES POUR LES CONTENUS LÉGAUX ==========

// Récupérer tous les contenus légaux
router.get('/contenus-legaux', authenticate, (req, res) => {
  db.all('SELECT * FROM contenus_legaux ORDER BY page', (err, contenus) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des contenus' });
    }
    
    const contenusMap = {};
    contenus.forEach(contenu => {
      contenusMap[contenu.page] = {
        id: contenu.id,
        page: contenu.page,
        contenu: contenu.contenu || '',
        updated_at: contenu.updated_at
      };
    });
    
    // S'assurer que toutes les pages attendues existent dans la réponse (avec contenu vide si nécessaire)
    const pagesAttendues = ['a-propos', 'mentions-legales', 'politique-confidentialite'];
    pagesAttendues.forEach(page => {
      if (!contenusMap[page]) {
        contenusMap[page] = {
          id: null,
          page: page,
          contenu: '',
          updated_at: null
        };
      }
    });
    
    res.json(contenusMap);
  });
});

// Récupérer un contenu légal spécifique
router.get('/contenus-legaux/:page', authenticate, (req, res) => {
  const { page } = req.params;
  
  db.get('SELECT * FROM contenus_legaux WHERE page = ?', [page], (err, contenu) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du contenu' });
    }
    
    if (!contenu) {
      // Si le contenu n'existe pas, créer une entrée vide au lieu de retourner 404
      db.run('INSERT INTO contenus_legaux (page, contenu) VALUES (?, ?)', [page, ''], function(insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: 'Erreur lors de la création du contenu' });
        }
        // Retourner le contenu vide nouvellement créé
        res.json({
          id: this.lastID,
          page: page,
          contenu: '',
          updated_at: new Date().toISOString()
        });
      });
      return;
    }
    
    res.json({
      id: contenu.id,
      page: contenu.page,
      contenu: contenu.contenu,
      updated_at: contenu.updated_at
    });
  });
});

// Mettre à jour un contenu légal
router.put('/contenus-legaux/:page', authenticate, (req, res) => {
  const { page } = req.params;
  const { contenu } = req.body;
  
  console.log(`📝 Mise à jour du contenu pour la page: ${page}`);
  console.log(`📏 Taille du contenu reçu: ${contenu ? contenu.length : 0} caractères`);
  
  // Permettre les chaînes vides (utilisateur peut vouloir vider le contenu)
  if (contenu === undefined || contenu === null || typeof contenu !== 'string') {
    console.error('❌ Erreur: Le contenu doit être une chaîne de caractères');
    return res.status(400).json({ error: 'Le contenu est requis (peut être vide)' });
  }
  
  // Vérifier si le contenu existe
  db.get('SELECT id FROM contenus_legaux WHERE page = ?', [page], (err, existing) => {
    if (err) {
      console.error('❌ Erreur lors de la vérification de l\'existence:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (existing) {
      // Mettre à jour
      console.log(`✅ Mise à jour du contenu existant (ID: ${existing.id})`);
      db.run(
        'UPDATE contenus_legaux SET contenu = ?, updated_at = NOW() WHERE page = ?',
        [contenu, page],
        function(err) {
          if (err) {
            console.error('❌ Erreur lors de la mise à jour:', err);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
          }
          console.log(`✅ Contenu mis à jour avec succès (${this.changes} ligne(s) modifiée(s))`);
          res.json({ 
            message: 'Contenu mis à jour avec succès', 
            page, 
            contenu: contenu.substring(0, 100) + '...' // Retourner un aperçu pour le log
          });
        }
      );
    } else {
      // Créer
      console.log(`➕ Création d'un nouveau contenu pour la page: ${page}`);
      db.run(
        'INSERT INTO contenus_legaux (page, contenu, updated_at) VALUES (?, ?, NOW())',
        [page, contenu],
        function(err) {
          if (err) {
            console.error('❌ Erreur lors de la création:', err);
            return res.status(500).json({ error: 'Erreur lors de la création' });
          }
          console.log(`✅ Contenu créé avec succès (ID: ${this.lastID})`);
          res.json({ 
            message: 'Contenu créé avec succès', 
            page, 
            id: this.lastID,
            contenu: contenu.substring(0, 100) + '...' // Retourner un aperçu pour le log
          });
        }
      );
    }
  });
});

// Supprimer un contenu légal (réinitialiser au contenu par défaut)
router.delete('/contenus-legaux/:page', authenticate, (req, res) => {
  const { page } = req.params;
  
  db.run(
    'UPDATE contenus_legaux SET contenu = ?, updated_at = NOW() WHERE page = ?',
    ['', page],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }
      res.json({ message: 'Contenu réinitialisé avec succès', page });
    }
  );
});

module.exports = router;