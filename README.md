# 🚀 PFE Backend - Architecture Microservices

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  <br/>
  <strong>Backend Microservices pour Projet de Fin d'Études</strong>
</p>

## 📋 Description

Ce projet est un backend microservices développé avec NestJS pour la gestion de vivariums connectés. Il permet de recevoir des données de capteurs ESP32, de stocker ces données dans InfluxDB, et d'envoyer des commandes aux appareils via WebSocket.

### 🏗️ Architecture

- **API Gateway** : Point d'entrée principal avec authentification JWT
- **Auth Service** : Gestion des utilisateurs et authentification
- **User Service** : Gestion des profils utilisateurs
- **Vivarium Service** : Gestion des vivariums, capteurs et commandes
- **Influx Service** : Gestion des données InfluxDB pour les métriques temps réel
- **WebSocket Gateway** : Communication temps réel avec les ESP32 et applications mobiles
- **Shared Package** : Interfaces et DTOs partagés entre services

### 🛠️ Technologies

- **Framework** : NestJS 10.x
- **Base de données** : PostgreSQL 15 avec Prisma ORM
- **Base de données temps réel** : InfluxDB 2.7
- **Communication temps réel** : WebSocket (Socket.IO)
- **Containerisation** : Docker & Docker Compose
- **CI/CD** : GitHub Actions
- **Sécurité** : JWT, Helmet, Throttler
- **Validation** : class-validator, class-transformer

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd pfe_backend

# Installer les dépendances
npm install --legacy-peer-deps

# Copier la configuration d'environnement
cp config.env.example .env
# Éditer .env avec vos valeurs
```

### Démarrage rapide avec Docker
```bash
# Démarrer tous les services
./deploy.sh

# Ou manuellement
docker-compose up -d --build
```

### Démarrage en développement
```bash
# Base de données et services
docker-compose up -d postgres rabbitmq influxdb

# Application en mode développement
npm run start:dev

# Service InfluxDB séparé
npm run start:influx
```

## 🔧 Configuration

### Variables d'environnement
```bash
# Base de données
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pfe_db

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# InfluxDB
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=adminpassword
INFLUXDB_ORG=pfe_org
INFLUXDB_BUCKET=pfe_bucket

# JWT
JWT_SECRET=your-secure-jwt-secret
```

### Ports par défaut
- **3000** : Application principale
- **5432** : PostgreSQL
- **5672** : RabbitMQ AMQP
- **15672** : RabbitMQ Management UI
- **8086** : InfluxDB

## 🐠 Fonctionnalités Vivarium

### Capteurs supportés
- **Température** - Monitoring de la température de l'eau
- **Humidité** - Contrôle de l'humidité ambiante
- **Luminosité** - Gestion de l'éclairage automatique
- **Niveau d'eau** - Surveillance du niveau d'eau
- **pH** - Contrôle de l'acidité de l'eau
- **CO2** - Monitoring du dioxyde de carbone
- **Mouvement** - Détection de présence
- **Pression** - Surveillance de la pression

### Commandes disponibles
- **Pompe** - Activation/désactivation des pompes
- **Éclairage** - Contrôle des lumières LED
- **Chauffage** - Gestion du système de chauffage
- **Ventilation** - Contrôle des ventilateurs
- **Nourrissage** - Distribution automatique de nourriture
- **Changement d'eau** - Automatisation des changements d'eau

### Communication temps réel
- **WebSocket** pour la communication bidirectionnelle
- **Notifications push** pour les alertes
- **Dashboard temps réel** pour le monitoring
- **Historique des données** avec InfluxDB

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:cov

# Tests e2e
npm run test:e2e

# Test de l'API Vivarium
node test-vivarium-api.js

# Linting
npm run lint
```

## 📦 Structure du projet

```
pfe_backend/
├── packages/
│   ├── api-gateway/     # Point d'entrée principal
│   ├── auth-service/    # Service d'authentification
│   ├── user-service/    # Service utilisateurs
│   ├── influx-service/  # Service InfluxDB
│   └── shared/          # Code partagé
├── src/                 # Code principal
├── prisma/              # Schéma et migrations DB
└── docker-compose.yml   # Services Docker
```

## 🐳 Déploiement

### Déploiement local
```bash
# Script automatique
./deploy.sh

# Manuel
docker-compose up -d --build
```

### Déploiement production
```bash
# Construire l'image
docker build -t pfe-backend:latest .

# Démarrer avec docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD
Le projet utilise GitHub Actions pour :
- ✅ Tests automatiques
- ✅ Build Docker
- ✅ Publication sur GitHub Container Registry
- ✅ Déploiement automatisé (configurable)

## 🔐 Sécurité

- **JWT** pour l'authentification
- **Helmet** pour les en-têtes de sécurité
- **Throttler** pour la limitation de débit
- **CORS** configuré
- **Validation** des données avec class-validator

## 📊 Monitoring

### Interfaces d'administration
- **RabbitMQ Management** : http://localhost:15672 (guest/guest)
- **InfluxDB** : http://localhost:8086 (admin/adminpassword)

### Logs
```bash
# Logs de l'application
docker-compose logs app

# Logs en temps réel
docker-compose logs -f
```

## 🚨 Dépannage

### Problèmes courants
1. **Ports déjà utilisés** : Vérifiez les ports 3000, 5432, 5672, 15672, 8086
2. **Permissions Docker** : Assurez-vous d'avoir les droits Docker
3. **Mémoire insuffisante** : Augmentez la RAM allouée à Docker

### Commandes utiles
```bash
# Vérifier l'état des services
docker-compose ps

# Redémarrer un service
docker-compose restart app

# Nettoyer l'espace
docker system prune -a
```

## 📚 Documentation

- [Guide de déploiement Docker](DOCKER_DEPLOYMENT.md)
- [Architecture des packages](ARCHITECTURE.md)
- [Documentation des APIs](API_DOCUMENTATION.md)
- [**API Vivarium**](VIVARIUM_API_DOCUMENTATION.md) - Documentation complète pour les vivariums connectés
- [Configuration des secrets GitHub](GITHUB_SECRETS_SETUP.md)
- [Guide de sécurité](THROTTLER_SECURITY.md)
- [Guide de test](TESTING.md)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation dans le dossier `docs/`
- Vérifiez les logs Docker pour le débogage

---

**Développé avec ❤️ pour le PFE** 🎓
