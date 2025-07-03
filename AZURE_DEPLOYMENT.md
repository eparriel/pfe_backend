 # 🚀 Déploiement Automatique sur Azure VM

## 📋 Vue d'ensemble

Ce guide explique comment configurer un déploiement automatique de votre application PFE Backend sur une VM Azure via GitHub Actions.

## 🏗️ Architecture

```
GitHub Actions → Build & Test → Push GHCR → Deploy Azure VM
```

## 🔧 Configuration de la VM Azure

### 1. Créer une VM Ubuntu
```bash
# Via Azure CLI
az vm create \
  --resource-group myResourceGroup \
  --name pfe-backend-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys
```

### 2. Installer Docker sur la VM
```bash
# Se connecter à la VM
ssh azureuser@<IP_DE_LA_VM>

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session
exit
ssh azureuser@<IP_DE_LA_VM>
```

### 3. Créer le répertoire de déploiement
```bash
sudo mkdir -p /opt/pfe-backend
sudo chown azureuser:azureuser /opt/pfe-backend
```

### 4. Configurer le firewall Azure
```bash
# Ouvrir les ports nécessaires
az vm open-port --resource-group myResourceGroup --name pfe-backend-vm --port 3000
az vm open-port --resource-group myResourceGroup --name pfe-backend-vm --port 22
az vm open-port --resource-group myResourceGroup --name pfe-backend-vm --port 5432
az vm open-port --resource-group myResourceGroup --name pfe-backend-vm --port 5672
az vm open-port --resource-group myResourceGroup --name pfe-backend-vm --port 15672
az vm open-port --resource-group myResourceGroup --name pfe-backend-vm --port 8086
```

## 🔐 Configuration des Secrets GitHub

Dans votre repository GitHub, allez dans **Settings > Secrets and variables > Actions** et ajoutez :

### Secrets requis :
- `AZURE_VM_HOST` : L'IP publique de votre VM Azure
- `AZURE_VM_USERNAME` : Le nom d'utilisateur (ex: azureuser)
- `AZURE_VM_SSH_KEY` : Votre clé SSH privée pour accéder à la VM

### Comment obtenir la clé SSH :
```bash
# Si vous avez utilisé --generate-ssh-keys
cat ~/.ssh/id_rsa

# Ou générer une nouvelle clé
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
cat ~/.ssh/id_rsa
```

## 🚀 Test du déploiement

### 1. Push sur la branche main
```bash
git add .
git commit -m "Add Azure deployment"
git push origin main
```

### 2. Vérifier le workflow GitHub Actions
- Allez dans l'onglet **Actions** de votre repo
- Vérifiez que tous les jobs passent

### 3. Vérifier le déploiement
```bash
# Se connecter à la VM
ssh azureuser@<IP_DE_LA_VM>

# Vérifier les conteneurs
docker ps

# Tester l'application
curl http://localhost:3000
```

## 📊 Monitoring

### Logs des conteneurs
```bash
# Logs de l'application
docker-compose -f /opt/pfe-backend/docker-compose.prod.yml logs app

# Logs de tous les services
docker-compose -f /opt/pfe-backend/docker-compose.prod.yml logs
```

### Statut des services
```bash
# Statut des conteneurs
docker-compose -f /opt/pfe-backend/docker-compose.prod.yml ps

# Utilisation des ressources
docker stats
```

## 🔄 Rollback automatique

En cas de problème, le script de déploiement :
1. Arrête les conteneurs existants
2. Récupère la nouvelle image
3. Redémarre les services
4. Teste la santé de l'application
5. Affiche les logs en cas d'échec

## 🎯 Points d'accès

Une fois déployé, votre application sera accessible sur :
- **Application** : http://<IP_VM>:3000
- **RabbitMQ Management** : http://<IP_VM>:15672 (guest/guest)
- **InfluxDB** : http://<IP_VM>:8086 (admin/adminpassword)
- **PostgreSQL** : <IP_VM>:5432 (postgres/postgres)

## 🚨 Dépannage

### Problèmes courants :
1. **Ports fermés** : Vérifiez les règles de firewall Azure
2. **Permissions SSH** : Vérifiez les permissions de la clé SSH (600)
3. **Docker non installé** : Réinstallez Docker sur la VM
4. **Image non trouvée** : Vérifiez que l'image est bien poussée sur GHCR

### Commandes utiles :
```bash
# Vérifier la connectivité SSH
ssh -i ~/.ssh/id_rsa azureuser@<IP_VM>

# Vérifier les logs GitHub Actions
# (dans l'onglet Actions de votre repo)

# Redémarrer manuellement sur la VM
cd /opt/pfe-backend
./scripts/deploy-azure.sh
```

## 🎉 Résultat

Vous avez maintenant un pipeline CI/CD complet :
- ✅ **Build automatique** sur chaque push
- ✅ **Tests automatisés** 
- ✅ **Publication d'image** sur GHCR
- ✅ **Déploiement automatique** sur Azure VM
- ✅ **Monitoring et logs** intégrés

Parfait pour votre évaluation ! 🎓