const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔥 FORCER LA CREATION DU DOSSIER uploads SUR RENDER
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Dossier uploads créé automatiquement");
}

// Charger et initialiser la base MySQL
const { init } = require('./config/database');
init();

// 🔥 CORS PROPRE
const allowedOrigins = [
  process.env.FRONTEND_URL,                 // URL du front
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // version sans /
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman etc.

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Origine refusée :", origin);
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/logo', express.static(path.join(__dirname, '../LOGO')));

// ✅ AJOUTER UNE ROUTE DE DIAGNOSTIC
app.get('/api/diagnostic/uploads', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads');
  
  const exists = fs.existsSync(uploadsPath);
  const files = exists ? fs.readdirSync(uploadsPath).slice(0, 10) : [];
  
  res.json({
    uploadsPath,
    exists,
    fileCount: files.length,
    sampleFiles: files,
    baseUrl: process.env.BASE_URL
  });
});

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/types-articles', require('./routes/types_articles'));
app.use('/api/panier', require('./routes/panier'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pack', require('./routes/pack'));
app.use('/api/pack-visiteurs', require('./routes/pack-visiteurs'));
app.use('/api/visiteurs', require('./routes/visiteurs'));
app.use('/api/livraison', require('./routes/livraison'));
app.use('/api/wave', require('./routes/wave'));
app.use('/api/parametres', require('./routes/parametres'));

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});