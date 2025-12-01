const QRCode = require('qrcode');
const { db } = require('../config/database');

// Générer un lien de paiement WAVE
const genererLienPaiement = async (montant, description = '', dbInstance = null) => {
  return new Promise((resolve, reject) => {
    const database = dbInstance || require('../config/database').db;
    
    // Récupérer le code marchand depuis les paramètres
    database.all('SELECT cle, valeur FROM parametres WHERE cle IN (?, ?)', 
      ['wave_merchant_code', 'wave_account'], 
      async (err, params) => {
        if (err) {
          console.error('Erreur lors de la récupération des paramètres WAVE:', err);
        }
        
        const parametres = {};
        params.forEach(param => {
          parametres[param.cle] = param.valeur;
        });
        
        // Utiliser les paramètres de la base ou les variables d'environnement
        const merchantCode = parametres.wave_merchant_code || process.env.WAVE_MERCHANT_CODE || '';
        const waveAccount = parametres.wave_account || process.env.WAVE_ACCOUNT || '';
        
        // Format du lien WAVE (à adapter selon leur API)
        // Si un code marchand est configuré, on l'utilise, sinon on génère un lien générique
        let lien;
        if (merchantCode) {
          // Format avec code marchand (QR code du marchand)
          lien = `https://wave.com/pay?merchant=${merchantCode}&amount=${montant}&description=${encodeURIComponent(description)}`;
        } else {
          // Format générique
          lien = `https://wave.com/pay?amount=${montant}&description=${encodeURIComponent(description)}`;
        }
        
        try {
          // Générer le QR code à partir du lien
          const qrCode = await QRCode.toDataURL(lien);
          resolve({ lien, qrCode, merchantCode });
        } catch (qrError) {
          console.error('Erreur lors de la génération du QR code:', qrError);
          reject(qrError);
        }
      }
    );
  });
};

module.exports = { genererLienPaiement };


