const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(config);

// Fonction pour convertir les requêtes SQLite en MySQL
const convertSQLiteToMySQL = (sql) => {
  if (!sql || typeof sql !== 'string') return sql;
  
  let converted = sql;
  
  // Convertir datetime("now") en NOW()
  converted = converted.replace(/datetime\s*\(\s*["']now["']\s*\)/gi, 'NOW()');
  
  // Convertir CURRENT_TIMESTAMP si utilisé dans les valeurs
  converted = converted.replace(/CURRENT_TIMESTAMP/gi, 'NOW()');
  
  // Convertir INSERT OR IGNORE en INSERT IGNORE
  converted = converted.replace(/INSERT\s+OR\s+IGNORE/gi, 'INSERT IGNORE');
  
  // Convertir INSERT OR REPLACE en INSERT ... ON DUPLICATE KEY UPDATE
  converted = converted.replace(/INSERT\s+OR\s+REPLACE\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/gi, 
    (match, table, columns, values) => {
      const cols = columns.split(',').map(c => c.trim());
      const updates = cols.map(col => `${col} = VALUES(${col})`).join(', ');
      return `INSERT INTO ${table} (${columns}) VALUES (${values}) ON DUPLICATE KEY UPDATE ${updates}`;
    });
  
  // Convertir INTEGER PRIMARY KEY AUTOINCREMENT en INT AUTO_INCREMENT PRIMARY KEY (déjà fait dans les CREATE TABLE)
  // Convertir REAL en DECIMAL(10,2) pour les prix (déjà fait dans les CREATE TABLE)
  
  // Convertir les comparaisons avec NULL (SQLite accepte = NULL, MySQL nécessite IS NULL)
  converted = converted.replace(/\s+=\s+NULL\b/gi, ' IS NULL');
  converted = converted.replace(/\s+!=\s+NULL\b/gi, ' IS NOT NULL');
  converted = converted.replace(/\s+<>\s+NULL\b/gi, ' IS NOT NULL');
  
  // Convertir PRAGMA table_info en SHOW COLUMNS FROM (pour MySQL)
  // Note: Cette conversion nécessite un traitement spécial dans le wrapper db.get/db.all
  if (converted.includes('PRAGMA table_info')) {
    const tableMatch = converted.match(/PRAGMA\s+table_info\s*\(\s*(\w+)\s*\)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      converted = `SHOW COLUMNS FROM ${tableName}`;
    }
  }
  
  return converted;
};

// Fonction pour exécuter une requête
const query = async (sql, params = []) => {
  try {
    const convertedSQL = convertSQLiteToMySQL(sql);
    const [results] = await pool.execute(convertedSQL, params);
    return results;
  } catch (err) {
    console.error('Erreur MySQL:', err);
    throw err;
  }
};

// Fonction pour obtenir une seule ligne (équivalent à db.get)
const get = async (sql, params = []) => {
  const results = await query(sql, params);
  const row = results[0] || null;
  if (row) {
    // Convertir les TINYINT(1) en nombres pour compatibilité
    const converted = { ...row };
    Object.keys(converted).forEach(key => {
      if (typeof converted[key] === 'boolean') {
        converted[key] = converted[key] ? 1 : 0;
      }
    });
    return converted;
  }
  return null;
};

// Fonction pour obtenir toutes les lignes (équivalent à db.all)
const all = async (sql, params = []) => {
  return await query(sql, params);
};

// Fonction pour exécuter une requête sans résultat (équivalent à db.run)
const run = async (sql, params = []) => {
  const result = await query(sql, params);
  return {
    lastID: result.insertId,
    changes: result.affectedRows
  };
};

// Fonction pour exécuter plusieurs requêtes en série (équivalent à db.serialize)
const serialize = async (callback) => {
  await callback();
};

// Fonction d'initialisation de la base de données
const init = async () => {
  try {
    console.log('Initialisation de la base de données MySQL...');

    // Table des administrateurs
    await query(`CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      blocked TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des logs d'activités des admins
    await query(`CREATE TABLE IF NOT EXISTS admin_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      action VARCHAR(255) NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des types d'articles
    await query(`CREATE TABLE IF NOT EXISTS types_articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      actif TINYINT(1) DEFAULT 1,
      pac_autorise TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des articles
    await query(`CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type_id INT NOT NULL,
      nom VARCHAR(255) NOT NULL,
      prix DECIMAL(10,2) NOT NULL,
      description TEXT,
      image_principale TEXT,
      images TEXT,
      disponible TINYINT(1) DEFAULT 1,
      indisponible TINYINT(1) DEFAULT 0,
      prix_original DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (type_id) REFERENCES types_articles(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des PAC (packs)
    await query(`CREATE TABLE IF NOT EXISTS pac (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      description TEXT,
      type_pac VARCHAR(255),
      type_id INT,
      prix DECIMAL(10,2) NOT NULL,
      prix_original DECIMAL(10,2),
      nombre_articles INT NOT NULL DEFAULT 2,
      articles TEXT NOT NULL,
      actif TINYINT(1) DEFAULT 1,
      created_by VARCHAR(255) DEFAULT 'boutique',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (type_id) REFERENCES types_articles(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des visiteurs
    await query(`CREATE TABLE IF NOT EXISTS visiteurs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(45),
      localisation TEXT,
      user_agent TEXT,
      nom VARCHAR(255),
      prenom VARCHAR(255),
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des commandes
    await query(`CREATE TABLE IF NOT EXISTS commandes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255),
      prenom VARCHAR(255),
      telephone VARCHAR(50),
      whatsapp VARCHAR(50),
      commune VARCHAR(255),
      adresse_precise TEXT,
      lieu_livraison TEXT,
      articles TEXT NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      methode_paiement VARCHAR(50),
      statut VARCHAR(50) DEFAULT 'en_attente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des paramètres
    await query(`CREATE TABLE IF NOT EXISTS parametres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cle VARCHAR(255) UNIQUE NOT NULL,
      valeur TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des configurations de packs visiteurs
    await query(`CREATE TABLE IF NOT EXISTS pack_visiteurs_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      mode VARCHAR(50) NOT NULL DEFAULT 'articles',
      articles_ids TEXT,
      type_id INT,
      reduction DECIMAL(5,2) NOT NULL DEFAULT 5,
      nombre_articles INT NOT NULL DEFAULT 2,
      actif TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (type_id) REFERENCES types_articles(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Table des contenus légaux
    await query(`CREATE TABLE IF NOT EXISTS contenus_legaux (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page VARCHAR(255) UNIQUE NOT NULL,
      contenu TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Insérer les contenus par défaut si la table est vide
    const contenusCount = await get('SELECT COUNT(*) as count FROM contenus_legaux');
    if (contenusCount.count === 0) {
      await run(`INSERT INTO contenus_legaux (page, contenu) VALUES ('a-propos', '')`);
      await run(`INSERT INTO contenus_legaux (page, contenu) VALUES ('mentions-legales', '')`);
      await run(`INSERT INTO contenus_legaux (page, contenu) VALUES ('politique-confidentialite', '')`);
    }

    // Table des frais de livraison par commune
    const COMMUNES_DEFAUT = [
      'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi', 'Marcory',
      'Plateau', 'Port-Bouët', 'Treichville', 'Yopougon', 'Anyama',
      'Bingerville', 'Songon', 'Autre commune d\'Abidjan', 'Autre ville de Côte d\'Ivoire'
    ];
    
    await query(`CREATE TABLE IF NOT EXISTS frais_livraison_communes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      commune VARCHAR(255) UNIQUE NOT NULL,
      prix DECIMAL(10,2) NOT NULL DEFAULT 1500,
      actif TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Insérer les communes par défaut
    for (const commune of COMMUNES_DEFAUT) {
      await query(`INSERT IGNORE INTO frais_livraison_communes (commune, prix) VALUES (?, ?)`, [commune, 1500]);
    }

    // Insérer les paramètres par défaut
    const parametresDefaults = [
      ['whatsapp_number', ''],
      ['wave_account', ''],
      ['wave_merchant_code', ''],
      ['wave_active', '0'],
      ['pack_active', '0'],
      ['pack_nombre_articles', '3'],
      ['pack_reduction', '5'],
      ['pack_visiteurs_active', '0'],
      ['pack_visiteurs_articles', '[]'],
      ['frais_livraison_active', '1'],
      ['frais_livraison_montant', '1500'],
      ['tiktok_url', ''],
      ['instagram_url', ''],
      ['whatsapp_url', ''],
      ['whatsapp_active', '1'],
      ['tiktok_active', '1'],
      ['instagram_active', '1'],
      ['gmail_active', '1'],
      ['gmail_url', ''],
      ['contact_adresse', 'Cocody Angré 8ᵉ tranche, Abidjan, Côte d\'Ivoire'],
      ['contact_telephone', '+225 0505616042'],
      ['contact_horaires_jour', 'Lundi - Dimanche'],
      ['contact_horaires_heure', '9h - 18h'],
      ['boutiques_texte', 'Vos boutiques bientôt disponibles'],
      ['alerte_fetes_active', '0'],
      ['alerte_fetes_texte', 'Bientôt la fête ! Profitez de nos réductions exceptionnelles'],
      ['alerte_fetes_reduction', '0'],
      ['maintenance_active', '0'],
      ['maintenance_message', 'Le site est actuellement en maintenance. Nous serons de retour très bientôt !']
    ];

    for (const [cle, valeur] of parametresDefaults) {
      await query(`INSERT IGNORE INTO parametres (cle, valeur) VALUES (?, ?)`, [cle, valeur]);
    }

    // Créer un admin par défaut
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    await query(`INSERT IGNORE INTO admins (username, password) VALUES ('admin', ?)`, [defaultPassword]);

    console.log('✅ Base de données MySQL initialisée');
  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation:', err);
    throw err;
  }
};

// Wrapper pour compatibilité avec l'ancien code
const db = {
  run: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    // Convertir la requête SQLite en MySQL
    const convertedSQL = convertSQLiteToMySQL(sql);
    run(convertedSQL, params || [])
      .then(result => {
        if (callback) {
          // Simuler this.lastID pour compatibilité
          const mockThis = { lastID: result.lastID, changes: result.changes };
          callback.call(mockThis, null);
        }
      })
      .catch(err => {
        if (callback) callback(err);
      });
  },
  get: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Traitement spécial pour PRAGMA table_info -> SHOW COLUMNS
    if (sql.includes('PRAGMA table_info')) {
      const tableMatch = sql.match(/PRAGMA\s+table_info\s*\(\s*(\w+)\s*\)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        query(`SHOW COLUMNS FROM ${tableName}`, [])
          .then(columns => {
            // Convertir le format MySQL en format SQLite pour compatibilité
            const formattedColumns = columns.map((col, index) => ({
              cid: index,
              name: col.Field,
              type: col.Type,
              notnull: col.Null === 'NO' ? 1 : 0,
              dflt_value: col.Default,
              pk: col.Key === 'PRI' ? 1 : 0
            }));
            if (callback) callback(null, formattedColumns[0] || null);
          })
          .catch(err => {
            if (callback) callback(err);
          });
        return;
      }
    }
    
    const convertedSQL = convertSQLiteToMySQL(sql);
    get(convertedSQL, params || [])
      .then(result => {
        if (callback) callback(null, result);
      })
      .catch(err => {
        if (callback) callback(err);
      });
  },
  all: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Traitement spécial pour PRAGMA table_info -> SHOW COLUMNS
    if (sql.includes('PRAGMA table_info')) {
      const tableMatch = sql.match(/PRAGMA\s+table_info\s*\(\s*(\w+)\s*\)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        query(`SHOW COLUMNS FROM ${tableName}`, [])
          .then(columns => {
            // Convertir le format MySQL en format SQLite pour compatibilité
            const formattedColumns = columns.map((col, index) => ({
              cid: index,
              name: col.Field,
              type: col.Type,
              notnull: col.Null === 'NO' ? 1 : 0,
              dflt_value: col.Default,
              pk: col.Key === 'PRI' ? 1 : 0
            }));
            if (callback) callback(null, formattedColumns);
          })
          .catch(err => {
            if (callback) callback(err);
          });
        return;
      }
    }
    
    const convertedSQL = convertSQLiteToMySQL(sql);
    all(convertedSQL, params || [])
      .then(results => {
        if (callback) callback(null, results);
      })
      .catch(err => {
        if (callback) callback(err);
      });
  },
  serialize: (callback) => {
    serialize(callback).catch(err => {
      console.error('Erreur dans serialize:', err);
    });
  }
};

module.exports = { db, init, query, get, all, run, serialize, pool };

