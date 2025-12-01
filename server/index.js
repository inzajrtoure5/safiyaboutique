const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Charger et initialiser la base MySQL
const { init } = require('./config/database');
init();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', ''),
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/logo', express.static(path.join(__dirname, '../LOGO')));

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
