#!/usr/bin/env node

/**
 * Script pour réinitialiser la base de données MySQL
 * Usage: node server/scripts/reset-db.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    console.log('🗑️  Suppression de la base de données existante...');
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'safiya_boutique'}`);
    console.log('✅ Base de données supprimée\n');

    console.log('📁 Création de la nouvelle base de données...');
    await connection.query(`CREATE DATABASE ${process.env.DB_NAME || 'safiya_boutique'} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    console.log('✅ Base de données créée\n');

    console.log('✨ Réinitialisation complète!');
    console.log('Prochaine étape: npm start');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

resetDatabase();
