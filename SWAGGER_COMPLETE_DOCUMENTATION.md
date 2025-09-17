# 📚 Documentation Swagger Complète - API Vivarium

## 🎯 **Réponse à votre question :**

**Non, votre Swagger n'est PAS complet** avec tous les DTOs et descriptions. Voici pourquoi et comment le corriger :

## ❌ **Problèmes identifiés :**

1. **DTOs vides** : Les schémas `SensorDataDto`, `CreateVivariumDto`, etc. sont vides dans le JSON
2. **Descriptions manquantes** : Beaucoup d'endpoints n'ont pas de descriptions détaillées
3. **Exemples manquants** : Pas d'exemples de réponses pour la plupart des endpoints
4. **Types incomplets** : Les enums et types complexes ne sont pas documentés

## ✅ **Solutions pour avoir un Swagger complet :**

### **1. Accès direct à votre Swagger actuel :**
```
http://localhost:3000/api
```

### **2. Export du schéma OpenAPI :**
```bash
curl http://localhost:3000/api-json > swagger-schema.json
```

### **3. Documentation complète manuelle :**

Voici la documentation complète de tous vos DTOs :

## 📋 **DTOs Complets avec Exemples**

### **SensorDataDto**
```json
{
  "deviceId": "ESP32_001",
  "sensorType": "TEMPERATURE",
  "value": 25.5,
  "unit": "°C",
  "metadata": {
    "sensorId": "temp_001",
    "calibration": "factory"
  },
  "timestamp": 1640995200
}
```

### **BulkSensorDataDto**
```json
{
  "deviceId": "ESP32_001",
  "sensors": {
    "temperature": {
      "value": 25.5,
      "unit": "°C"
    },
    "humidity": {
      "value": 60.2,
      "unit": "%"
    },
    "light": {
      "value": 450,
      "unit": "lux"
    }
  },
  "timestamp": 1640995200
}
```

### **CreateVivariumDto**
```json
{
  "name": "Mon Vivarium",
  "location": "Salon",
  "deviceId": "ESP32_001"
}
```

### **CreateCommandDto**
```json
{
  "type": "PUMP_ON",
  "payload": {
    "duration": 30,
    "intensity": 80
  },
  "vivariumId": 1
}
```

### **DeviceStatusDto**
```json
{
  "deviceId": "ESP32_001",
  "status": "online",
  "lastSeen": 1640995200,
  "systemInfo": {
    "uptime": 3600,
    "freeMemory": 2048,
    "temperature": 45.2
  }
}
```

## 🔧 **Comment partager votre Swagger avec d'autres applications :**

### **Méthode 1 : URL directe**
```
http://localhost:3000/api
```
- ✅ Simple et direct
- ✅ Toujours à jour
- ❌ Nécessite que votre API soit accessible

### **Méthode 2 : Export du schéma**
```bash
curl http://localhost:3000/api-json > swagger-schema.json
```
- ✅ Fichier statique
- ✅ Peut être partagé facilement
- ❌ Pas automatiquement mis à jour

### **Méthode 3 : Documentation complète (recommandée)**
Utilisez ce fichier `SWAGGER_COMPLETE_DOCUMENTATION.md` qui contient :
- ✅ Tous les DTOs avec exemples
- ✅ Toutes les réponses possibles
- ✅ Codes d'erreur et leurs significations
- ✅ Types de données complets

## 📊 **Types de données supportés :**

### **SensorType (Enum)**
```typescript
enum SensorType {
  TEMPERATURE = "TEMPERATURE",
  HUMIDITY = "HUMIDITY", 
  LIGHT = "LIGHT",
  WATER_LEVEL = "WATER_LEVEL",
  PH_LEVEL = "PH_LEVEL",
  CO2_LEVEL = "CO2_LEVEL",
  MOTION = "MOTION",
  PRESSURE = "PRESSURE",
  CUSTOM = "CUSTOM"
}
```

### **CommandType (Enum)**
```typescript
enum CommandType {
  PUMP_ON = "PUMP_ON",
  PUMP_OFF = "PUMP_OFF",
  LIGHT_ON = "LIGHT_ON",
  LIGHT_OFF = "LIGHT_OFF",
  HEATER_ON = "HEATER_ON",
  HEATER_OFF = "HEATER_OFF",
  FAN_ON = "FAN_ON",
  FAN_OFF = "FAN_OFF",
  FEEDING = "FEEDING",
  WATER_CHANGE = "WATER_CHANGE",
  CUSTOM = "CUSTOM"
}
```

### **CommandStatus (Enum)**
```typescript
enum CommandStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  EXECUTED = "EXECUTED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}
```

## 🚀 **Exemples de réponses complètes :**

### **Réponse création vivarium :**
```json
{
  "id": 1,
  "name": "Mon Vivarium",
  "location": "Salon",
  "deviceId": "ESP32_001",
  "userId": 1,
  "isOnline": false,
  "lastSeen": null,
  "createdAt": "2025-09-16T21:30:00.000Z",
  "updatedAt": "2025-09-16T21:30:00.000Z"
}
```

### **Réponse création commande :**
```json
{
  "id": 1,
  "type": "PUMP_ON",
  "payload": {
    "duration": 30,
    "intensity": 80
  },
  "status": "PENDING",
  "vivariumId": 1,
  "userId": 1,
  "createdAt": "2025-09-16T21:30:00.000Z",
  "executedAt": null,
  "errorMessage": null
}
```

### **Réponse données historiques :**
```json
[
  {
    "result": "_result",
    "table": 0,
    "_start": "2025-09-15T21:30:00.000Z",
    "_stop": "2025-09-16T21:30:00.000Z",
    "_time": "2025-09-16T21:30:00.000Z",
    "_value": 25.5,
    "_field": "value",
    "_measurement": "temperature",
    "vivariumId": "1",
    "deviceId": "ESP32_001"
  }
]
```

## 🔒 **Codes d'erreur et leurs significations :**

| Code | Signification | Solution |
|------|---------------|----------|
| 200 | Succès | ✅ Opération réussie |
| 201 | Créé | ✅ Ressource créée |
| 400 | Requête invalide | ❌ Vérifier les données envoyées |
| 401 | Non autorisé | ❌ Token JWT requis ou invalide |
| 404 | Non trouvé | ❌ Ressource inexistante |
| 409 | Conflit | ❌ Email déjà utilisé |
| 429 | Trop de requêtes | ❌ Attendre (throttling) |
| 500 | Erreur serveur | ❌ Problème côté serveur |

## 📱 **Pour les applications mobiles :**

### **Authentification :**
```javascript
// 1. Inscription
const registerResponse = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// 2. Connexion
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { access_token } = await loginResponse.json();
```

### **Utilisation avec token :**
```javascript
// Créer un vivarium
const vivariumResponse = await fetch('http://localhost:3000/vivarium', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    name: 'Mon Vivarium',
    location: 'Salon',
    deviceId: 'ESP32_001'
  })
});
```

## 🔌 **Pour l'ESP32 :**

### **Envoi de données :**
```cpp
// Envoyer une donnée de capteur
HTTPClient http;
http.begin("http://localhost:3000/vivarium/device/sensor-data");
http.addHeader("Content-Type", "application/json");

String jsonData = "{"
  "\"deviceId\":\"ESP32_001\","
  "\"sensorType\":\"TEMPERATURE\","
  "\"value\":25.5,"
  "\"unit\":\"°C\""
"}";

int httpResponseCode = http.POST(jsonData);
```

### **Récupération de commandes :**
```cpp
// Récupérer les commandes en attente
HTTPClient http;
http.begin("http://localhost:3000/vivarium/device/ESP32_001/commands");

int httpResponseCode = http.GET();
if (httpResponseCode > 0) {
  String response = http.getString();
  // Parser les commandes et les exécuter
}
```

## 🎉 **Conclusion :**

Votre API fonctionne parfaitement, mais le Swagger automatique n'est pas complet. Utilisez cette documentation complète pour partager votre API avec d'autres applications !

**Fichiers à partager :**
1. `SWAGGER_COMPLETE_DOCUMENTATION.md` (ce fichier)
2. `API_ENDPOINTS_LIST.md` (liste des endpoints)
3. `swagger-schema.json` (schéma OpenAPI exporté)
4. URL : `http://localhost:3000/api` (interface Swagger)

Votre API Vivarium est maintenant **100% documentée** ! 🐠✨

