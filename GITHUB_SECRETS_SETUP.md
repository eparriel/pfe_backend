# 🔐 Configuration des Secrets GitHub Actions

## ⚠️ Statut actuel

**Le déploiement automatique sur Azure est actuellement DÉSACTIVÉ** dans le workflow GitHub Actions.

Le job `deploy-to-azure` est commenté dans `.github/workflows/build-check.yml` car il nécessite une configuration Azure spécifique.

## 🚀 Pour activer le déploiement Azure

Si vous souhaitez activer le déploiement automatique sur Azure :

1. **Décommentez le job** `deploy-to-azure` dans le workflow
2. **Configurez les secrets** GitHub décrits ci-dessous
3. **Assurez-vous** que votre VM Azure est prête avec Docker

## 📋 Vue d'ensemble

Ce guide explique comment configurer les secrets GitHub nécessaires pour le déploiement automatique sur Azure VM.

## 🔧 Secrets requis

Dans votre repository GitHub, allez dans **Settings > Secrets and variables > Actions > New repository secret** et ajoutez :

### **1. Secrets Azure VM**
- `AZURE_VM_HOST` : L'IP publique de votre VM Azure
- `AZURE_VM_USERNAME` : Le nom d'utilisateur (ex: azureuser)
- `AZURE_VM_SSH_KEY` : Votre clé SSH privée pour accéder à la VM

### **2. Secret JWT**
- `JWT_SECRET` : Une clé secrète pour signer les tokens JWT

## 🚀 Comment configurer

### **Étape 1 : Obtenir l'IP de la VM Azure**
```bash
# Via Azure CLI
az vm show --resource-group myResourceGroup --name pfe-backend-vm --show-details --query [publicIps] --output tsv
```

### **Étape 2 : Générer une clé SSH (si pas déjà fait)**
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
cat ~/.ssh/id_rsa  # Copiez cette clé privée
```

### **Étape 3 : Générer un JWT Secret**
```bash
# Générer une clé secrète sécurisée
openssl rand -base64 32
```

### **Étape 4 : Ajouter les secrets dans GitHub**

1. Allez dans votre repo GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez chaque secret :

| Nom du Secret | Valeur |
|---------------|--------|
| `AZURE_VM_HOST` | `20.xxx.xxx.xxx` (IP de votre VM) |
| `AZURE_VM_USERNAME` | `azureuser` |
| `AZURE_VM_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `JWT_SECRET` | `votre-jwt-secret-généré` |

## 🔍 Vérification

### **Test de connectivité SSH**
```bash
ssh -i ~/.ssh/id_rsa azureuser@<IP_VM>
```

### **Test du workflow**
1. Faites un push sur la branche `main`
2. Allez dans l'onglet **Actions** de votre repo
3. Vérifiez que le job `deploy-to-azure` passe

## 🚨 Dépannage

### **Erreur SSH**
- Vérifiez que la clé SSH est correcte
- Vérifiez que l'utilisateur a les bonnes permissions sur la VM
- Vérifiez que le port 22 est ouvert sur Azure

### **Erreur de déploiement**
- Vérifiez les logs du job GitHub Actions
- Vérifiez que Docker est installé sur la VM
- Vérifiez que l'image est bien poussée sur GHCR

### **Erreur de variables d'environnement**
- Vérifiez que tous les secrets sont configurés
- Vérifiez que le fichier `.env` est bien créé sur la VM

## 📊 Monitoring

### **Logs GitHub Actions**
- Allez dans **Actions** → **Workflow runs**
- Cliquez sur le dernier run
- Vérifiez les logs du job `deploy-to-azure`

### **Logs sur la VM**
```bash
ssh azureuser@<IP_VM>
cd /opt/pfe-backend
docker-compose -f docker-compose.prod.yml logs app
```

## 🎉 Résultat

Une fois configuré, chaque push sur `main` déclenchera :
1. ✅ Build et tests
2. ✅ Publication de l'image sur GHCR
3. ✅ Déploiement automatique sur Azure VM
4. ✅ Test de santé de l'application

Votre application sera accessible sur `http://<IP_VM>:3000` ! 🚀 