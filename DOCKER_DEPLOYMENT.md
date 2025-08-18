# 🐳 Déploiement Docker - PFE Backend

## 📋 Vue d'ensemble

Ce projet utilise Docker pour le déploiement avec les services suivants :
- **Application NestJS** (port 3000)
- **PostgreSQL** (port 5432)
- **RabbitMQ** (ports 5672, 15672)
- **InfluxDB** (port 8086)

## 🚀 Déploiement rapide

### Option 1 : Script automatique
```bash
./deploy.sh
```

### Option 2 : Commandes manuelles
```bash
# Construire et démarrer tous les services
docker-compose up -d --build

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f app
```

## 🔧 Configuration

### Variables d'environnement
L'application utilise ces variables d'environnement :
- `DATABASE_URL`: PostgreSQL connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `INFLUXDB_URL`: InfluxDB URL
- `INFLUXDB_TOKEN`: InfluxDB token
- `INFLUXDB_ORG`: InfluxDB organization

**📝 Voir `config.env.example` pour la configuration complète**

### Ports exposés
- **3000**: Application NestJS
- **5432**: PostgreSQL
- **5672**: RabbitMQ AMQP
- **15672**: RabbitMQ Management UI
- **8086**: InfluxDB

## 🧪 Tests

### Test de l'application
```bash
# Test de santé
curl http://localhost:3000

# Test avec Docker
docker run --rm pfe-backend:latest node --version
```

### Accès aux interfaces
- **Application**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **InfluxDB**: http://localhost:8086 (admin/adminpassword)

## 🔍 Debugging

### Logs des conteneurs
```bash
# Logs de l'application
docker-compose logs app

# Logs de tous les services
docker-compose logs

# Logs en temps réel
docker-compose logs -f
```

### Accès aux conteneurs
```bash
# Accès au conteneur de l'application
docker-compose exec app sh

# Accès à PostgreSQL
docker-compose exec postgres psql -U postgres -d pfe_db
```

## 🛠️ Maintenance

### Mise à jour
```bash
# Arrêter les services
docker-compose down

# Reconstruire et redémarrer
docker-compose up -d --build
```

### Nettoyage
```bash
# Supprimer les conteneurs et volumes
docker-compose down -v

# Supprimer les images
docker rmi pfe_backend_app
```

## 📊 CI/CD

Le workflow GitHub Actions (`build-check.yml`) inclut :
1. **Build & Test**: Compilation et tests
2. **Docker Build**: Construction de l'image Docker
3. **Container Test**: Test du conteneur

**📝 Note**: Le déploiement Azure est actuellement désactivé. Voir `GITHUB_SECRETS_SETUP.md` pour l'activer.

## 🎯 Pour l'évaluation

Ce déploiement Docker démontre :
- ✅ **Containerisation** complète de l'application
- ✅ **Orchestration** avec Docker Compose
- ✅ **Microservices** (PostgreSQL, RabbitMQ, InfluxDB)
- ✅ **CI/CD** automatisé
- ✅ **Sécurité** (utilisateur non-root)
- ✅ **Optimisation** (multi-stage build)

## 🚨 Dépannage

### Problèmes courants
1. **Ports déjà utilisés** : Vérifiez qu'aucun service n'utilise les ports 3000, 5432, 5672, 15672, 8086
2. **Permissions Docker** : Assurez-vous d'avoir les droits Docker
3. **Mémoire insuffisante** : Augmentez la RAM allouée à Docker

### Commandes utiles
```bash
# Vérifier l'espace disque
docker system df

# Nettoyer l'espace
docker system prune -a

# Vérifier les réseaux
docker network ls
```

## 📚 Documentation liée

- [README.md](README.md) - Vue d'ensemble du projet
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture des packages
- [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) - Configuration CI/CD
- [THROTTLER_SECURITY.md](THROTTLER_SECURITY.md) - Sécurité et limitation de débit
- [TESTING.md](TESTING.md) - Guide des tests

## 🔮 Évolutions futures

### Déploiement microservices
- Séparation des services en conteneurs individuels
- Communication via RabbitMQ
- Scaling indépendant des services

### Monitoring avancé
- Prometheus + Grafana
- Logs centralisés (ELK Stack)
- Alertes automatiques

---

**Pour toute question sur le déploiement, consultez la documentation ou ouvrez une issue.** 🚀 