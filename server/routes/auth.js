const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!admin) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    if (!bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET || 'secret_key', {
      expiresIn: '30d' // Token valide 30 jours - vous pouvez réinitialiser quand vous voulez
    });

    // Enregistrer le log de connexion
    const { db } = require('../config/database');
    db.run('INSERT INTO admin_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())', 
      [admin.id, 'login', JSON.stringify({ ip: req.ip || 'unknown' })], 
      (logErr) => {
        if (logErr) console.error('Erreur lors de l\'enregistrement du log de connexion:', logErr);
      }
    );

    res.json({ token, admin: { id: admin.id, username: admin.username } });
  });
});

module.exports = router;


