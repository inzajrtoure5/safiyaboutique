// Générer le message WhatsApp pour une commande
const genererMessageCommande = (articles, baseUrl) => {
  let message = '🛍️ *Commande SAFIYA BOUTIQUE*\n\n';
  message += 'Articles commandés :\n\n';
  
  let total = 0;
  articles.forEach((article, index) => {
    const prixArticle = article.prix * (article.quantite || 1);
    total += prixArticle;
    message += `${index + 1}. *${article.nom}*\n`;
    message += `   Prix: ${article.prix} FCFA x ${article.quantite || 1}\n`;
    message += `   Lien: ${baseUrl}/article/${article.id}\n\n`;
  });
  
  message += `*Total: ${total} FCFA*\n\n`;
  message += 'Cliquez ici pour valider le paiement :\n';
  message += `${baseUrl}/paiement?total=${total}`;
  
  return message;
};

module.exports = { genererMessageCommande };


