const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sqliteDbPath = path.join(__dirname, '../../data/boutique.db');

// Configuration MySQL depuis .env
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'safiya_boutique',
  multipleStatements: true
};

async function migrate() {
  console.log('🚀 Début de la migration SQLite → MySQL...\n');

  // Vérifier que le fichier SQLite existe
  if (!fs.existsSync(sqliteDbPath)) {
    console.error('❌ Erreur: Le fichier SQLite n\'existe pas:', sqliteDbPath);
    process.exit(1);
  }

  // Connexion SQLite
  const sqliteDb = new sqlite3.Database(sqliteDbPath);
  
  // Connexion MySQL
  let mysqlConnection;
  try {
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connexion MySQL établie');
  } catch (err) {
    console.error('❌ Erreur de connexion MySQL:', err.message);
    console.log('\n💡 Assurez-vous que:');
    console.log('   1. MySQL est démarré (XAMPP)');
    console.log('   2. La base de données existe ou sera créée automatiquement');
    console.log('   3. Les variables DB_HOST, DB_USER, DB_PASSWORD, DB_NAME sont correctes dans .env');
    sqliteDb.close();
    process.exit(1);
  }

  try {
    // Créer la base de données si elle n'existe pas
    const tempConnection = await mysql.createConnection({
      host: mysqlConfig.host,
      user: mysqlConfig.user,
      password: mysqlConfig.password
    });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\``);
    await tempConnection.end();
    console.log(`✅ Base de données "${mysqlConfig.database}" prête`);

    // Se reconnecter à la base de données spécifique
    await mysqlConnection.end();
    mysqlConnection = await mysql.createConnection(mysqlConfig);

    // Créer toutes les tables MySQL
    console.log('\n📋 Création des tables MySQL...');
    await createMySQLTables(mysqlConnection);
    console.log('✅ Tables créées\n');

    // Migrer les données
    console.log('📦 Migration des données...\n');
    
    // 1. Admins
    await migrateTable(sqliteDb, mysqlConnection, 'admins', [
      'id', 'username', 'password', 'blocked', 'created_at'
    ]);
    
    // 2. Admin logs
    await migrateTable(sqliteDb, mysqlConnection, 'admin_logs', [
      'id', 'admin_id', 'action', 'details', 'created_at'
    ]);
    
    // 3. Types articles
    await migrateTable(sqliteDb, mysqlConnection, 'types_articles', [
      'id', 'nom', 'actif', 'pac_autorise', 'created_at'
    ]);
    
    // 4. Articles
    await migrateTable(sqliteDb, mysqlConnection, 'articles', [
      'id', 'type_id', 'nom', 'prix', 'description', 'image_principale', 
      'images', 'disponible', 'indisponible', 'prix_original', 'created_at'
    ]);
    
    // 5. PAC (packs)
    await migrateTable(sqliteDb, mysqlConnection, 'pac', [
      'id', 'nom', 'description', 'type_pac', 'type_id', 'prix', 
      'prix_original', 'nombre_articles', 'articles', 'actif', 
      'created_by', 'created_at'
    ]);
    
    // 6. Visiteurs
    await migrateTable(sqliteDb, mysqlConnection, 'visiteurs', [
      'id', 'ip', 'localisation', 'user_agent', 'nom', 'prenom', 'visited_at'
    ]);
    
    // 7. Commandes
    await migrateTable(sqliteDb, mysqlConnection, 'commandes', [
      'id', 'nom', 'prenom', 'telephone', 'whatsapp', 'commune', 
      'adresse_precise', 'lieu_livraison', 'articles', 'total', 
      'methode_paiement', 'statut', 'created_at'
    ]);
    
    // 8. Paramètres
    await migrateTable(sqliteDb, mysqlConnection, 'parametres', [
      'id', 'cle', 'valeur'
    ]);
    
    // 9. Pack visiteurs config
    await migrateTable(sqliteDb, mysqlConnection, 'pack_visiteurs_config', [
      'id', 'nom', 'mode', 'articles_ids', 'type_id', 'reduction', 
      'nombre_articles', 'actif', 'created_at'
    ]);
    
    // 10. Contenus légaux
    await migrateTable(sqliteDb, mysqlConnection, 'contenus_legaux', [
      'id', 'page', 'contenu', 'updated_at'
    ]);
    
    // 11. Frais livraison communes
    await migrateTable(sqliteDb, mysqlConnection, 'frais_livraison_communes', [
      'id', 'commune', 'prix', 'actif', 'created_at', 'updated_at'
    ]);

    console.log('\n✅ Migration terminée avec succès!');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Vérifiez que toutes les données sont présentes dans MySQL');
    console.log('   2. Modifiez database.js pour utiliser MySQL');
    console.log('   3. Redémarrez l\'application');
    console.log('   4. Testez toutes les fonctionnalités');
    console.log('\n⚠️  Le fichier SQLite est conservé en backup: data/boutique.db');

  } catch (err) {
    console.error('❌ Erreur lors de la migration:', err);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await mysqlConnection.end();
  }
}

async function createMySQLTables(connection) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      blocked TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS admin_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      action VARCHAR(255) NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS types_articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      actif TINYINT(1) DEFAULT 1,
      pac_autorise TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS articles (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS pac (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS visiteurs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(45),
      localisation TEXT,
      user_agent TEXT,
      nom VARCHAR(255),
      prenom VARCHAR(255),
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS commandes (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS parametres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cle VARCHAR(255) UNIQUE NOT NULL,
      valeur TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS pack_visiteurs_config (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS contenus_legaux (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page VARCHAR(255) UNIQUE NOT NULL,
      contenu TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS frais_livraison_communes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      commune VARCHAR(255) UNIQUE NOT NULL,
      prix DECIMAL(10,2) NOT NULL DEFAULT 1500,
      actif TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const tableSQL of tables) {
    await connection.query(tableSQL);
  }
}

async function migrateTable(sqliteDb, mysqlConnection, tableName, columns) {
  return new Promise((resolve, reject) => {
    // Vérifier si la table existe dans SQLite
    sqliteDb.all(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], async (err, tables) => {
      if (err) {
        console.error(`❌ Erreur lors de la vérification de la table ${tableName}:`, err);
        return reject(err);
      }

      if (tables.length === 0) {
        console.log(`⏭️  Table ${tableName} n'existe pas dans SQLite, ignorée`);
        return resolve();
      }

      // Récupérer toutes les données de SQLite
      sqliteDb.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
        if (err) {
          console.error(`❌ Erreur lors de la lecture de ${tableName}:`, err);
          return reject(err);
        }

        if (rows.length === 0) {
          console.log(`✅ ${tableName}: 0 ligne (table vide)`);
          return resolve();
        }

        // Vider la table MySQL avant insertion (pour éviter les doublons)
        try {
          await mysqlConnection.query(`DELETE FROM ${tableName}`);
          // Réinitialiser l'auto-increment
          await mysqlConnection.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
        } catch (deleteErr) {
          // Ignorer si la table est vide ou n'existe pas encore
        }

        // Insérer les données dans MySQL
        let inserted = 0;
        let errors = 0;

        for (const row of rows) {
          try {
            // Construire la requête INSERT avec gestion des doublons
            const placeholders = columns.map(() => '?').join(', ');
            const values = columns.map(col => {
              const value = row[col];
              // Convertir les valeurs NULL et les booléens
              if (value === null || value === undefined) return null;
              if (typeof value === 'boolean') return value ? 1 : 0;
              return value;
            });

            // Utiliser INSERT IGNORE pour éviter les erreurs de doublons
            const sql = `INSERT IGNORE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            const result = await mysqlConnection.query(sql, values);
            // Vérifier si une ligne a été réellement insérée
            if (result[0].affectedRows > 0) {
              inserted++;
            } else {
              // Ligne déjà existante, on peut la mettre à jour
              const updateCols = columns.filter(col => col !== 'id');
              const updateValues = updateCols.map(col => {
                const value = row[col];
                if (value === null || value === undefined) return null;
                if (typeof value === 'boolean') return value ? 1 : 0;
                return value;
              });
              const updatePlaceholders = updateCols.map(col => `${col} = ?`).join(', ');
              const updateSQL = `UPDATE ${tableName} SET ${updatePlaceholders} WHERE id = ?`;
              await mysqlConnection.query(updateSQL, [...updateValues, row.id]);
              inserted++;
            }
          } catch (insertErr) {
            errors++;
            if (errors <= 5) { // Afficher seulement les 5 premières erreurs
              console.error(`   ⚠️  Erreur insertion ligne ${row.id || 'N/A'}:`, insertErr.message);
            }
          }
        }

        if (errors > 0) {
          console.log(`⚠️  ${tableName}: ${inserted}/${rows.length} lignes migrées, ${errors} erreur(s)`);
        } else {
          console.log(`✅ ${tableName}: ${inserted} ligne(s) migrée(s)`);
        }
        resolve();
      });
    });
  });
}

// Lancer la migration
migrate().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});

