const express = require('express');
const { db } = require('../config/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Enregistrer un visiteur
router.post('/', (req, res) => {
  const { ip, localisation, user_agent } = req.body;

  // Récupérer l'IP du client (prendre en compte les proxies)
  const clientIp = req.headers['x-forwarded-for'] 
    ? req.headers['x-forwarded-for'].split(',')[0].trim() 
    : req.headers['x-real-ip'] 
    ? req.headers['x-real-ip'] 
    : req.connection.remoteAddress 
    ? req.connection.remoteAddress.replace('::ffff:', '')
    : ip || '';

  // Récupérer le user agent depuis les headers si non fourni
  const ua = user_agent || req.headers['user-agent'] || '';

  db.run(`
    INSERT INTO visiteurs (ip, localisation, user_agent)
    VALUES (?, ?, ?)
  `, [clientIp, localisation || 'Inconnue', ua], function(err) {
    if (err) {
      console.error('Erreur lors de l\'enregistrement du visiteur:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ id: this.lastID });
  });
});

// Récupérer tous les visiteurs (admin) avec filtres
router.get('/', authenticate, (req, res) => {
  const { periode, date_debut, date_fin, heure } = req.query;
  
  let query = 'SELECT * FROM visiteurs WHERE 1=1';
  const params = [];
  
  // Calculer les dates selon la période
  const now = new Date();
  let dateLimite = null;
  
  if (!periode || periode === 'semaine') {
    // Par défaut : cette semaine (hebdomadaire - 7 derniers jours)
    const debutSemaine = new Date(now);
    debutSemaine.setDate(now.getDate() - 7);
    debutSemaine.setHours(0, 0, 0, 0);
    dateLimite = debutSemaine;
    query += ' AND visited_at >= ?';
    params.push(dateLimite.toISOString());
  } else if (periode === 'aujourdhui') {
    const debutJour = new Date(now);
    debutJour.setHours(0, 0, 0, 0);
    dateLimite = debutJour;
    query += ' AND visited_at >= ?';
    params.push(dateLimite.toISOString());
  } else if (periode === 'semaine') {
    const debutSemaine = new Date(now);
    debutSemaine.setDate(now.getDate() - 7);
    debutSemaine.setHours(0, 0, 0, 0);
    dateLimite = debutSemaine;
    query += ' AND visited_at >= ?';
    params.push(dateLimite.toISOString());
  } else if (periode === 'mois') {
    const debutMois = new Date(now);
    debutMois.setMonth(now.getMonth() - 1);
    debutMois.setHours(0, 0, 0, 0);
    dateLimite = debutMois;
    query += ' AND visited_at >= ?';
    params.push(dateLimite.toISOString());
  } else if (periode === 'custom' && date_debut && date_fin) {
    query += ' AND visited_at >= ? AND visited_at <= ?';
    params.push(date_debut, date_fin);
  }
  
  // Filtrer par heure si spécifié
  if (heure) {
    query += ' AND HOUR(visited_at) = ?';
    params.push(parseInt(heure));
  }
  
  query += ' ORDER BY visited_at DESC';
  
  // Limiter à 1000 résultats pour éviter les problèmes de performance
  if (!periode || periode !== 'all') {
    query += ' LIMIT 1000';
  }
  
  db.all(query, params, (err, visiteurs) => {
    if (err) {
      console.error('Erreur lors de la récupération des visiteurs:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // Enrichir avec les données des commandes si disponibles
    const visiteursEnrichis = visiteurs.map(visiteur => {
      return {
        ...visiteur,
        // Si nom/prénom existent déjà dans le visiteur, les utiliser
        // Sinon, on les récupérera depuis les commandes si besoin
      };
    });
    
    res.json(visiteursEnrichis);
  });
});

module.exports = router;


