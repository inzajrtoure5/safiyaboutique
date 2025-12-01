const express = require('express');
const router = express.Router();

// Le panier sera géré côté client (localStorage)
// Cette route peut servir pour sauvegarder le panier si nécessaire

router.post('/calculer-total', (req, res) => {
  const { articles } = req.body;
  let total = 0;

  articles.forEach(article => {
    total += article.prix * article.quantite;
  });

  res.json({ total });
});

module.exports = router;


