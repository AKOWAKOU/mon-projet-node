# Node.js Authentication System with MVC Architecture

Un système d'authentification complet construit avec Node.js, Express et MongoDB, utilisant une architecture MVC avec des classes.

## 🚀 Fonctionnalités

- **Authentification complète**
  - Inscription avec validation d'email
  - Connexion sécurisée
  - Confirmation d'email
  - Réinitialisation de mot de passe
  - Gestion des sessions JWT

- **Sécurité**
  - Hachage des mots de passe avec bcrypt
  - Tokens JWT sécurisés
  - Rate limiting
  - Validation des données
  - Helmet pour la sécurité HTTP

- **Architecture MVC**
  - Contrôleurs avec classes
  - Modèles Mongoose
  - Routes modulaires
  - Middleware personnalisés
  - Services séparés

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn

## 🛠️ Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd node-auth-mvc
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Remplissez les variables d'environnement dans le fichier `.env`:
   - `MONGODB_URI`: URL de connexion MongoDB
   - `JWT_SECRET`: Clé secrète pour JWT
   - `SMTP_*`: Configuration email pour l'envoi d'emails

4. **Démarrer MongoDB**
   ```bash
   mongod
   ```

5. **Lancer l'application**
   ```bash
   # Mode développement
   npm run dev
   
   # Mode production
   npm start
   ```

## 📁 Structure du projet

```
├── app.js                 # Point d'entrée principal
├── config/
│   └── database.js        # Configuration base de données
├── controllers/
│   ├── AuthController.js  # Contrôleur d'authentification
│   └── UserController.js  # Contrôleur utilisateur
├── middleware/
│   ├── authMiddleware.js  # Middleware d'authentification
│   ├── validation.js      # Validation des données
│   └── errorHandler.js    # Gestion des erreurs
├── models/
│   └── User.js           # Modèle utilisateur
├── routes/
│   ├── authRoutes.js     # Routes d'authentification
│   └── userRoutes.js     # Routes utilisateur
├── services/
│   └── EmailService.js   # Service d'envoi d'emails
├── .env.example          # Variables d'environnement
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Inscription d'un nouvel utilisateur |
| POST | `/login` | Connexion utilisateur |
| GET | `/confirm-email/:token` | Confirmation d'email |
| POST | `/resend-confirmation` | Renvoyer l'email de confirmation |
| POST | `/request-password-reset` | Demander une réinitialisation |
| POST | `/reset-password/:token` | Réinitialiser le mot de passe |

### Utilisateur (`/api/users`)

| Méthode | Endpoint | Description | Auth Required |
|---------|----------|-------------|---------------|
| GET | `/profile` | Profil utilisateur | ✅ |
| PUT | `/profile` | Modifier le profil | ✅ |
| POST | `/change-password` | Changer mot de passe | ✅ |
| DELETE | `/account` | Supprimer le compte | ✅ |
| GET | `/` | Liste des utilisateurs | ✅ Admin |
| GET | `/:id` | Utilisateur par ID | ✅ Admin |

## 📝 Exemples d'utilisation

### Inscription

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "Password123"
  }'
```

### Accès aux ressources protégées

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Sécurité

- **Mots de passe** : Hachage avec bcrypt (rounds configurables)
- **JWT** : Tokens sécurisés avec expiration
- **Rate Limiting** : Protection contre les attaques par force brute
- **Validation** : Validation stricte des données d'entrée
- **Headers sécurisés** : Configuration Helmet
- **CORS** : Configuration des origines autorisées

## 📧 Configuration Email

Pour l'envoi d'emails, configurez votre service SMTP :

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Autres services
- **Outlook** : smtp-mail.outlook.com:587
- **Yahoo** : smtp.mail.yahoo.com:587
- **SendGrid**, **Mailgun**, etc.

## 🔧 Personnalisation

### Ajouter de nouveaux champs utilisateur

1. Modifier le schéma dans `models/User.js`
2. Ajouter la validation dans `middleware/validation.js`
3. Mettre à jour les contrôleurs correspondants

### Ajouter de nouveaux rôles

1. Modifier l'enum `role` dans le modèle User
2. Créer des middleware de permission spécifiques
3. Protéger les routes avec les nouveaux rôles