# 🛡️ Protection Throttler - Sécurité de l'API

## 📋 Vue d'ensemble

Le **Throttler** est un système de limitation de taux qui protège votre API contre :
- 🚫 **Attaques par force brute** sur les endpoints d'authentification
- 🚫 **Spam** et surcharge des endpoints
- 🚫 **Abus** des ressources de l'API

## ⚙️ Configuration actuelle

### **Limites globales (toute l'API)**
```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000,        // 1 minute
    limit: 10,         // 10 requêtes par minute
  },
  {
    ttl: 3600000,      // 1 heure
    limit: 100,        // 100 requêtes par heure
  },
])
```

### **Limites spécifiques (endpoints sensibles)**
- **`POST /connect`** : 5 tentatives par 5 minutes
- **`POST /register`** : 3 tentatives par 10 minutes

## 🔒 **Comment ça fonctionne**

### **1. Protection globale**
- **Tous les endpoints** sont limités à 10 requêtes par minute
- **Limite horaire** de 100 requêtes par heure
- **Protection automatique** contre le spam

### **2. Protection renforcée sur l'authentification**
- **Connexion** : Maximum 5 tentatives par 5 minutes
- **Inscription** : Maximum 3 tentatives par 10 minutes
- **Blocage temporaire** en cas de dépassement

### **3. Gestion des erreurs**
- **Code 429** : "Too Many Requests"
- **Message clair** : "Trop de tentatives. Réessayez dans X minutes"
- **Logs de sécurité** pour monitoring

## 🚨 **Scénarios d'attaque bloqués**

### **Attaque par force brute sur /connect**
```
❌ Tentative 1 : email: admin@test.com, password: 123456
❌ Tentative 2 : email: admin@test.com, password: password
❌ Tentative 3 : email: admin@test.com, password: admin
❌ Tentative 4 : email: admin@test.com, password: root
❌ Tentative 5 : email: admin@test.com, password: test
🚫 BLOQUÉ : "Trop de tentatives de connexion. Réessayez dans 5 minutes"
```

### **Spam sur /register**
```
❌ Tentative 1 : Création compte spam1@test.com
❌ Tentative 2 : Création compte spam2@test.com  
❌ Tentative 3 : Création compte spam3@test.com
🚫 BLOQUÉ : "Trop de tentatives d'inscription. Réessayez dans 10 minutes"
```

## 📊 **Codes de réponse HTTP**

### **200/201** : Succès
- Requête traitée normalement
- Compteur de requêtes incrémenté

### **429** : Too Many Requests
- Limite de taux dépassée
- Message d'erreur explicite
- Temps d'attente avant nouvelle tentative

### **401** : Unauthorized
- Identifiants invalides
- Compteur de tentatives incrémenté

## 🔧 **Configuration avancée**

### **Personnalisation des limites**
```typescript
// Dans app.module.ts
ThrottlerModule.forRoot([
  {
    ttl: 60000,        // 1 minute
    limit: 20,         // 20 requêtes par minute
  },
  {
    ttl: 3600000,      // 1 heure  
    limit: 200,        // 200 requêtes par heure
  },
])
```

### **Limites par endpoint**
```typescript
// Dans un contrôleur
@Throttle(10, 60)     // 10 requêtes par minute
@Get('sensitive-data')
getSensitiveData() {
  // ...
}
```

### **Exclusion d'endpoints**
```typescript
// Désactiver le throttling sur un endpoint
@SkipThrottle()
@Get('public-data')
getPublicData() {
  // ...
}
```

## 🧪 **Test de la protection**

### **Test de limitation globale**
```bash
# Faire 11 requêtes rapides sur n'importe quel endpoint
for i in {1..11}; do
  curl http://localhost:3000/
  sleep 0.1
done

# La 11ème requête devrait retourner 429
```

### **Test de limitation d'authentification**
```bash
# Tenter 6 connexions avec de mauvais identifiants
for i in {1..6}; do
  curl -X POST http://localhost:3000/connect \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "wrong"}'
  sleep 0.1
done

# La 6ème tentative devrait retourner 429
```

## 📈 **Monitoring et logs**

### **Logs de sécurité**
- **Tentatives bloquées** par le Throttler
- **IPs sources** des attaques
- **Endpoints ciblés** par les attaques

### **Métriques**
- **Nombre de requêtes** par période
- **Taux de blocage** par endpoint
- **Patterns d'attaque** détectés

## 🎯 **Avantages pour votre évaluation**

### **Sécurité renforcée**
- ✅ **Protection contre les attaques** par force brute
- ✅ **Limitation de taux** intelligente
- ✅ **Gestion des erreurs** professionnelle

### **Architecture robuste**
- ✅ **Middleware de sécurité** intégré
- ✅ **Configuration flexible** et adaptable
- ✅ **Monitoring** des tentatives d'attaque

### **Bonnes pratiques**
- ✅ **OWASP compliant** (Open Web Application Security Project)
- ✅ **Standards de sécurité** modernes
- ✅ **Documentation** des mesures de sécurité

## 🚀 **Déploiement**

### **1. Reconstruire l'image Docker**
```bash
docker-compose down
docker-compose up -d --build
```

### **2. Vérifier la configuration**
```bash
# Vérifier que l'API démarre
docker-compose logs app

# Tester la protection
curl -X POST http://localhost:3000/connect \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "wrong"}'
```

## 🎉 **Résultat**

Votre API est maintenant protégée par :
- 🛡️ **Throttler global** contre le spam
- 🔒 **Protection renforcée** sur l'authentification
- 📊 **Monitoring** des tentatives d'attaque
- 🚫 **Blocage automatique** des attaques par force brute

**Votre API est maintenant sécurisée et prête pour la production !** 🎓




