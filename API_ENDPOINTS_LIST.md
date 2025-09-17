# 🌐 Liste Complète des Endpoints API Vivarium

## 📋 Vue d'ensemble

Cette liste présente tous les endpoints disponibles dans votre API Vivarium, organisés par catégorie avec les méthodes HTTP, les paramètres et les exemples d'utilisation.

---

## 🔐 **AUTHENTIFICATION** (`/auth`)

### `POST /auth/register`
**Description** : Inscription d'un nouvel utilisateur
**Authentification** : Aucune
**Body** :
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Réponse** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### `POST /auth/login`
**Description** : Connexion d'un utilisateur existant
**Authentification** : Aucune
**Body** :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Réponse** : Même format que `/auth/register`

---

## 🏠 **ENDPOINTS GÉNÉRAUX**

### `GET /`
**Description** : Endpoint de test principal
**Authentification** : Aucune
**Réponse** : `"Hello World!"`

### `GET /health`
**Description** : Health check complet de l'API
**Authentification** : Aucune
**Réponse** :
```json
{
  "status": "ok",
  "timestamp": "2025-09-16T18:39:07.033Z",
  "uptime": 11.587772,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "api": "healthy",
    "database": "healthy",
    "influxdb": "healthy"
  }
}
```

### `GET /health/simple`
**Description** : Health check simple (ping/pong)
**Authentification** : Aucune
**Réponse** :
```json
{
  "status": "ok",
  "message": "pong",
  "timestamp": "2025-09-16T18:39:07.045Z"
}
```

### `GET /profile`
**Description** : Profil de l'utilisateur connecté
**Authentification** : JWT Token requis
**Headers** : `Authorization: Bearer <token>`
**Réponse** :
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

---

## 🐠 **GESTION DES VIVARIUMS** (`/vivarium`)

### `POST /vivarium`
**Description** : Créer un nouveau vivarium
**Authentification** : JWT Token requis
**Body** :
```json
{
  "name": "Mon Vivarium",
  "location": "Salon",
  "deviceId": "ESP32_001"
}
```
**Réponse** :
```json
{
  "id": 1,
  "name": "Mon Vivarium",
  "location": "Salon",
  "deviceId": "ESP32_001",
  "userId": 1,
  "isOnline": false,
  "createdAt": "2025-09-16T18:39:07.033Z"
}
```

### `GET /vivarium`
**Description** : Lister tous les vivariums de l'utilisateur
**Authentification** : JWT Token requis
**Réponse** :
```json
[
  {
    "id": 1,
    "name": "Mon Vivarium",
    "location": "Salon",
    "deviceId": "ESP32_001",
    "isOnline": true,
    "lastSeen": "2025-09-16T18:39:07.033Z",
    "sensors": [...],
    "_count": {
      "commands": 5
    }
  }
]
```

### `GET /vivarium/{id}`
**Description** : Obtenir un vivarium spécifique
**Authentification** : JWT Token requis
**Paramètres** : `id` (number) - ID du vivarium
**Réponse** :
```json
{
  "id": 1,
  "name": "Mon Vivarium",
  "location": "Salon",
  "deviceId": "ESP32_001",
  "isOnline": true,
  "lastSeen": "2025-09-16T18:39:07.033Z",
  "sensors": [...],
  "commands": [...]
}
```

### `PUT /vivarium/{id}`
**Description** : Mettre à jour un vivarium
**Authentification** : JWT Token requis
**Paramètres** : `id` (number) - ID du vivarium
**Body** :
```json
{
  "name": "Nouveau nom",
  "location": "Bureau",
  "isOnline": true
}
```

### `DELETE /vivarium/{id}`
**Description** : Supprimer un vivarium
**Authentification** : JWT Token requis
**Paramètres** : `id` (number) - ID du vivarium

---

## 📊 **DONNÉES DES CAPTEURS** (`/vivarium/device`)

### `POST /vivarium/device/sensor-data`
**Description** : Envoyer une donnée de capteur (ESP32 → API)
**Authentification** : Aucune
**Body** :
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
**Réponse** :
```json
{
  "success": true
}
```

### `POST /vivarium/device/bulk-sensor-data`
**Description** : Envoyer plusieurs données de capteurs en une fois
**Authentification** : Aucune
**Body** :
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

### `POST /vivarium/device/status`
**Description** : Mettre à jour le statut de l'appareil
**Authentification** : Aucune
**Body** :
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

### `GET /vivarium/device/{deviceId}/commands`
**Description** : Récupérer les commandes en attente (ESP32 ← API)
**Authentification** : Aucune
**Paramètres** : `deviceId` (string) - ID de l'appareil
**Réponse** :
```json
[
  {
    "id": 1,
    "type": "PUMP_ON",
    "payload": {
      "duration": 30,
      "intensity": 80
    },
    "status": "PENDING",
    "createdAt": "2025-09-16T18:39:07.033Z"
  }
]
```

---

## 🎮 **GESTION DES COMMANDES** (`/vivarium/{id}/commands`)

### `POST /vivarium/{id}/commands`
**Description** : Créer une nouvelle commande
**Authentification** : JWT Token requis
**Paramètres** : `id` (number) - ID du vivarium
**Body** :
```json
{
  "type": "PUMP_ON",
  "payload": {
    "duration": 30,
    "intensity": 80
  }
}
```
**Réponse** :
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
  "createdAt": "2025-09-16T18:39:07.033Z"
}
```

### `GET /vivarium/{id}/commands`
**Description** : Lister les commandes d'un vivarium
**Authentification** : JWT Token requis
**Paramètres** : `id` (number) - ID du vivarium
**Réponse** :
```json
[
  {
    "id": 1,
    "type": "PUMP_ON",
    "payload": {...},
    "status": "EXECUTED",
    "createdAt": "2025-09-16T18:39:07.033Z",
    "executedAt": "2025-09-16T18:40:07.033Z",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    }
  }
]
```

---

## 📈 **DONNÉES HISTORIQUES** (`/vivarium/{id}/sensor-data`)

### `GET /vivarium/{id}/sensor-data/{sensorType}`
**Description** : Récupérer les données historiques d'un capteur
**Authentification** : JWT Token requis
**Paramètres** : 
- `id` (number) - ID du vivarium
- `sensorType` (string) - Type de capteur (temperature, humidity, etc.)
**Query Parameters** :
- `timeRange` (number) - Plage de temps en heures (défaut: 24)
**Exemple** : `/vivarium/1/sensor-data/temperature?timeRange=48`
**Réponse** :
```json
[
  {
    "result": "_result",
    "table": 0,
    "_start": "2025-09-15T18:39:07.033Z",
    "_stop": "2025-09-16T18:39:07.033Z",
    "_time": "2025-09-16T18:39:07.033Z",
    "_value": 25.5,
    "_field": "value",
    "_measurement": "temperature",
    "vivariumId": "1",
    "deviceId": "ESP32_001"
  }
]
```

---

## 🔧 **GESTION DES CAPTEURS** (`/vivarium/{id}/sensors`)

### `POST /vivarium/{id}/sensors`
**Description** : Ajouter un capteur à un vivarium
**Authentification** : JWT Token requis
**Paramètres** : `id` (number) - ID du vivarium
**Body** :
```json
{
  "name": "Capteur de température",
  "type": "TEMPERATURE",
  "unit": "°C",
  "minValue": 15,
  "maxValue": 35
}
```

### `PUT /vivarium/sensors/{sensorId}`
**Description** : Mettre à jour un capteur
**Authentification** : JWT Token requis
**Paramètres** : `sensorId` (number) - ID du capteur
**Body** :
```json
{
  "name": "Nouveau nom",
  "unit": "°F",
  "minValue": 20,
  "maxValue": 40,
  "isActive": true
}
```

---

## 📚 **DOCUMENTATION**

### `GET /api`
**Description** : Interface Swagger UI
**Authentification** : Aucune
**Accès** : http://localhost:3000/api

### `GET /api-json`
**Description** : Schéma OpenAPI en JSON
**Authentification** : Aucune
**Réponse** : Schéma OpenAPI complet

---

## 🔌 **WEBSOCKET EVENTS**

### Connexion
**URL** : `ws://localhost:3000/socket.io/`
**Transport** : WebSocket

### Events ESP32 → API

#### `device_register`
**Description** : Enregistrer un appareil ESP32
**Payload** :
```json
{
  "deviceId": "ESP32_001"
}
```

#### `device_heartbeat`
**Description** : Envoyer un heartbeat
**Payload** :
```json
{
  "deviceId": "ESP32_001"
}
```

#### `command_executed`
**Description** : Confirmer l'exécution d'une commande
**Payload** :
```json
{
  "commandId": 1,
  "success": true,
  "errorMessage": null
}
```

### Events API → Clients

#### `device_registered`
**Description** : Confirmation d'enregistrement d'appareil
**Payload** :
```json
{
  "vivariumId": 1,
  "message": "Device registered successfully"
}
```

#### `sensor_data_update`
**Description** : Nouvelles données de capteurs
**Payload** :
```json
{
  "vivariumId": 1,
  "sensorData": {...},
  "timestamp": "2025-09-16T18:39:07.033Z"
}
```

#### `new_command`
**Description** : Nouvelle commande disponible
**Payload** :
```json
{
  "vivariumId": 1,
  "command": {...},
  "timestamp": "2025-09-16T18:39:07.033Z"
}
```

#### `command_status_update`
**Description** : Mise à jour du statut d'une commande
**Payload** :
```json
{
  "commandId": 1,
  "status": "EXECUTED",
  "errorMessage": null,
  "timestamp": "2025-09-16T18:39:07.033Z"
}
```

#### `device_online` / `device_offline`
**Description** : Changement de statut de l'appareil
**Payload** :
```json
{
  "deviceId": "ESP32_001",
  "vivariumId": 1,
  "timestamp": "2025-09-16T18:39:07.033Z"
}
```

### Events Application Mobile

#### `join_vivarium`
**Description** : Rejoindre un vivarium
**Payload** :
```json
{
  "vivariumId": 1
}
```

#### `leave_vivarium`
**Description** : Quitter un vivarium
**Payload** :
```json
{
  "vivariumId": 1
}
```

---

## 📝 **TYPES DE DONNÉES**

### Types de Capteurs (`SensorType`)
- `TEMPERATURE` - Température
- `HUMIDITY` - Humidité
- `LIGHT` - Luminosité
- `WATER_LEVEL` - Niveau d'eau
- `PH_LEVEL` - Niveau de pH
- `CO2_LEVEL` - Niveau de CO2
- `MOTION` - Détection de mouvement
- `PRESSURE` - Pression
- `CUSTOM` - Capteur personnalisé

### Types de Commandes (`CommandType`)
- `PUMP_ON` / `PUMP_OFF` - Pompe
- `LIGHT_ON` / `LIGHT_OFF` - Éclairage
- `HEATER_ON` / `HEATER_OFF` - Chauffage
- `FAN_ON` / `FAN_OFF` - Ventilation
- `FEEDING` - Nourrissage
- `WATER_CHANGE` - Changement d'eau
- `CUSTOM` - Commande personnalisée

### Statuts de Commandes (`CommandStatus`)
- `PENDING` - En attente
- `SENT` - Envoyée
- `EXECUTED` - Exécutée
- `FAILED` - Échouée
- `CANCELLED` - Annulée

---

## 🔒 **AUTHENTIFICATION**

### Headers requis pour les endpoints protégés
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Exemple d'obtention du token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## 🚀 **EXEMPLES D'UTILISATION**

### 1. Créer un utilisateur et un vivarium
```bash
# 1. Inscription
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vivarium.com","password":"password123","firstName":"Test","lastName":"User"}'

# 2. Créer un vivarium (avec le token obtenu)
curl -X POST http://localhost:3000/vivarium \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mon Vivarium","location":"Salon","deviceId":"ESP32_001"}'
```

### 2. Envoyer des données depuis l'ESP32
```bash
curl -X POST http://localhost:3000/vivarium/device/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"ESP32_001","sensorType":"TEMPERATURE","value":25.5,"unit":"°C"}'
```

### 3. Créer une commande depuis l'application mobile
```bash
curl -X POST http://localhost:3000/vivarium/1/commands \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"PUMP_ON","payload":{"duration":30,"intensity":80}}'
```

### 4. Récupérer les commandes depuis l'ESP32
```bash
curl http://localhost:3000/vivarium/device/ESP32_001/commands
```

---

**🎉 Votre API Vivarium est maintenant complètement documentée et prête à être utilisée !**

