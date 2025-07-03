#!/bin/bash

echo "🚀 Déploiement Docker pour PFE Backend"
echo "======================================"

# Arrêter et supprimer les conteneurs existants
echo "📦 Nettoyage des conteneurs existants..."
docker-compose down

# Construire l'image Docker
echo "🔨 Construction de l'image Docker..."
docker-compose build

# Démarrer tous les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs:"
docker-compose ps

# Tester l'application
echo "🧪 Test de l'application..."
curl -f http://localhost:3000 || echo "⚠️  L'application n'est pas encore prête"

echo "✅ Déploiement terminé!"
echo "🌐 Application disponible sur: http://localhost:3000"
echo "📊 RabbitMQ Management: http://localhost:15672 (guest/guest)"
echo "📈 InfluxDB: http://localhost:8086 (admin/adminpassword)"
echo "🗄️  PostgreSQL: localhost:5432 (postgres/postgres)" 