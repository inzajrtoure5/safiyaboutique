# SAFIYA BOUTIQUE - Site E-commerce

Site e-commerce pour SAFIYA BOUTIQUE avec système de gestion d'articles, panier, commandes, paiement WAVE et intégration WhatsApp.

## Structure du Projet

- `server/` - Backend Node.js/Express avec SQLite
- `client/` - Frontend Next.js avec TypeScript et Tailwind CSS
- `LOGO/` - Logo de la boutique

## Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn

### Installation des dépendances

```bash
# Installer les dépendances du serveur
npm install

# Installer les dépendances du client
cd client
npm install
```

### Configuration

1. Créer un fichier `.env` à la racine du projet :
```
PORT=5000
JWT_SECRET=your_secret_key_here
WAVE_MERCHANT_CODE=your_merchant_code
WAVE_ACCOUNT=your_wave_account
BASE_URL=http://localhost:3000
```

2. Initialiser la base de données :
```bash
npm run init-db
```

3. Créer le dossier `server/uploads/` pour les images (s'il n'existe pas déjà) :
```bash
mkdir server/uploads
```

## Démarrage

### Mode développement

```bash
# Démarrer le serveur et le client en parallèle
npm run dev
```

Ou séparément :

```bash
# Terminal 1 - Serveur
npm run server

# Terminal 2 - Client
cd client
npm run dev
```

### Mode production

```bash
# Build du client
cd client
npm run build

# Démarrer le serveur
npm start
```

## Accès

- **Site client** : http://localhost:3000
- **API Backend** : http://localhost:5000/api
- **Admin** : http://localhost:3000/admin
  - Username par défaut : `admin`
  - Password par défaut : `admin123`

## Fonctionnalités

### Client
- Affichage des articles par type
- Recherche et filtrage
- Panier avec gestion des quantités
- Système PAC (packs) avec réduction
- Paiement WAVE (QR code et lien)
- Commande via WhatsApp
- Modal de détails des articles

### Administration
- Dashboard avec statistiques
- Gestion des articles (CRUD)
- Gestion des types d'articles
- Gestion des PAC (packs)
- Suivi des visiteurs (IP, localisation)
- Gestion des commandes
- Paramètres (WhatsApp, WAVE)

## Système PAC (Packs)

### PAC créé par la boutique
- Prix fixe défini par l'administrateur
- Exemple : 3 PAG à 7000 FCFA au lieu de 7500 FCFA (réduction de 500 FCFA)

### PAC créé par le client
- Réduction automatique de 5%
- Exemple : 7500 FCFA → 7125 FCFA

## Base de données

La base de données SQLite est créée dans `data/boutique.db` lors de l'exécution de `npm run init-db`.

Pour réinitialiser la base de données :
```bash
npm run init-db
```

Tables :
- `admins` - Administrateurs
- `types_articles` - Types d'articles
- `articles` - Articles
- `pac` - Packs (PAC)
- `visiteurs` - Visiteurs
- `commandes` - Commandes
- `parametres` - Paramètres système

## Notes

- Le logo doit être placé dans `LOGO/LOGO.png`
- Les images uploadées sont stockées dans `server/uploads/`
- Le système de paiement WAVE nécessite une configuration avec leur API
- L'intégration WhatsApp utilise l'API Web de WhatsApp

