const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    // Vérifier si l'admin est bloqué
    db.get('SELECT blocked FROM admins WHERE id = ?', [decoded.id], (err, admin) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (!admin) {
        return res.status(401).json({ error: 'Admin introuvable' });
      }
      
      if (admin.blocked === 1 || admin.blocked === true) {
        return res.status(403).json({ error: 'Votre compte a été bloqué' });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = authenticate;


