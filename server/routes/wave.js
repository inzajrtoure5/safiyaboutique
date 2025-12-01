const express = require('express');
const { genererLienPaiement } = require('../utils/wave');
const { db } = require('../config/database');
const router = express.Router();

router.get('/generer-paiement', async (req, res) => {
  const { montant } = req.query;
  
  if (!montant) {
    return res.status(400).json({ error: 'Montant manquant' });
  }

  try {
    const { lien, qrCode, merchantCode } = await genererLienPaiement(
      parseFloat(montant), 
      `Paiement SAFIYA BOUTIQUE - ${montant} FCFA`,
      db
    );
    res.json({ lien, qrCode, merchantCode: merchantCode || null });
  } catch (error) {
    console.error('Erreur lors de la génération du paiement WAVE:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du paiement' });
  }
});

module.exports = router;

