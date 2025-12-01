const { pool } = require('./server/config/database');

const tablesToCheck = [
  'admins',
  'admin_logs',
  'types_articles',
  'articles',
  'pac',
  'visiteurs',
  'commandes',
  'parametres',
  'pack_visiteurs_config',
  'contenus_legaux',
  'frais_livraison_communes'
];

const checkTables = async () => {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    const existingTables = rows.map(row => Object.values(row)[0]);

    tablesToCheck.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✅ Table "${table}" existe`);
      } else {
        console.log(`❌ Table "${table}" manquante`);
      }
    });

    await pool.end();
  } catch (err) {
    console.error('Erreur lors de la vérification des tables :', err);
  }
};

checkTables();
