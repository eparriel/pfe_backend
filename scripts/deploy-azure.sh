#!/bin/bash

echo "🚀 Déploiement automatique sur Azure VM"
echo "======================================"

# Variables d'environnement
GITHUB_REPOSITORY_OWNER=${GITHUB_REPOSITORY_OWNER:-enzoparriel}
IMAGE_NAME="ghcr.io/$GITHUB_REPOSITORY_OWNER/pfe-backend:latest"

# Arrêter les conteneurs existants
echo "📦 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down

# Nettoyer les images non utilisées
echo "🧹 Nettoyage des images..."
docker image prune -f

# Récupérer la nouvelle image
echo "📥 Récupération de la nouvelle image: $IMAGE_NAME"
docker pull $IMAGE_NAME

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier le statut
echo "📊 Statut des conteneurs:"
docker-compose -f docker-compose.prod.yml ps

# Test de santé
echo "🧪 Test de santé de l'application..."
if curl -f http://localhost:3000; then
    echo "✅ Application déployée avec succès!"
    echo "🌐 Application disponible sur: http://$(hostname -I | awk '{print $1}'):3000"
else
    echo "❌ Erreur lors du déploiement"
    echo "📋 Logs de l'application:"
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
fi

echo "🎉 Déploiement terminé avec succès!" 