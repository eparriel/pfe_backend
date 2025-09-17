# 🐠 API Vivarium - Documentation

## 📋 Vue d'ensemble

Cette API permet de gérer des vivariums équipés de capteurs ESP32. Elle offre :
- **Stockage des données** de capteurs dans InfluxDB
- **Envoi de commandes** vers l'ESP32
- **Communication temps réel** via WebSocket
- **Gestion des utilisateurs** et vivariums

## 🏗️ Architecture

```
Application Mobile ←→ API NestJS ←→ ESP32 (Vivarium)
                           ↓
                    PostgreSQL + InfluxDB
```

## 🔌 Endpoints Principaux

### 1. Gestion des Vivariums

#### Créer un vivarium
```http
POST /vivarium
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Mon Vivarium",
  "location": "Salon",
  "deviceId": "ESP32_001"
}
```

#### Lister les vivariums d'un utilisateur
```http
GET /vivarium
Authorization: Bearer <jwt_token>
```

#### Obtenir un vivarium spécifique
```http
GET /vivarium/{id}
Authorization: Bearer <jwt_token>
```

#### Mettre à jour un vivarium
```http
PUT /vivarium/{id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Nouveau nom",
  "isOnline": true
}
```

#### Supprimer un vivarium
```http
DELETE /vivarium/{id}
Authorization: Bearer <jwt_token>
```

### 2. Données des Capteurs (ESP32 → API)

#### Envoyer une donnée de capteur
```http
POST /vivarium/device/sensor-data
Content-Type: application/json

{
  "deviceId": "ESP32_001",
  "sensorType": "TEMPERATURE",
  "value": 25.5,
  "unit": "°C",
  "metadata": {
    "sensorId": "temp_001"
  }
}
```

#### Envoyer plusieurs données de capteurs
```http
POST /vivarium/device/bulk-sensor-data
Content-Type: application/json

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

#### Mettre à jour le statut de l'appareil
```http
POST /vivarium/device/status
Content-Type: application/json

{
  "deviceId": "ESP32_001",
  "status": "online",
  "lastSeen": 1640995200,
  "systemInfo": {
    "uptime": 3600,
    "freeMemory": 2048
  }
}
```

### 3. Commandes (API → ESP32)

#### Créer une commande
```http
POST /vivarium/{vivariumId}/commands
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "PUMP_ON",
  "payload": {
    "duration": 30,
    "intensity": 80
  }
}
```

#### Lister les commandes d'un vivarium
```http
GET /vivarium/{vivariumId}/commands
Authorization: Bearer <jwt_token>
```

#### Récupérer les commandes en attente (ESP32)
```http
GET /vivarium/device/{deviceId}/commands
```

### 4. Données Historiques

#### Récupérer les données d'un capteur
```http
GET /vivarium/{vivariumId}/sensor-data/{sensorType}?timeRange=24
Authorization: Bearer <jwt_token>
```

### 5. Gestion des Capteurs

#### Ajouter un capteur
```http
POST /vivarium/{vivariumId}/sensors
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Capteur de température",
  "type": "TEMPERATURE",
  "unit": "°C",
  "minValue": 15,
  "maxValue": 35
}
```

#### Mettre à jour un capteur
```http
PUT /vivarium/sensors/{sensorId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Nouveau nom",
  "isActive": false
}
```

## 🔌 WebSocket Events

### Connexion ESP32

#### S'enregistrer comme appareil
```javascript
socket.emit('device_register', {
  deviceId: 'ESP32_001'
});
```

#### Envoyer un heartbeat
```javascript
socket.emit('device_heartbeat', {
  deviceId: 'ESP32_001'
});
```

#### Confirmer l'exécution d'une commande
```javascript
socket.emit('command_executed', {
  commandId: 123,
  success: true,
  errorMessage: null
});
```

### Connexion Application Mobile

#### Rejoindre un vivarium
```javascript
socket.emit('join_vivarium', {
  vivariumId: 1
});
```

#### Quitter un vivarium
```javascript
socket.emit('leave_vivarium', {
  vivariumId: 1
});
```

### Events Reçus

#### Nouvelles données de capteurs
```javascript
socket.on('sensor_data_update', (data) => {
  console.log('Nouvelles données:', data);
  // data.vivariumId, data.sensorData, data.timestamp
});
```

#### Nouvelle commande
```javascript
socket.on('new_command', (data) => {
  console.log('Nouvelle commande:', data);
  // data.vivariumId, data.command, data.timestamp
});
```

#### Statut de l'appareil
```javascript
socket.on('device_online', (data) => {
  console.log('Appareil en ligne:', data);
});

socket.on('device_offline', (data) => {
  console.log('Appareil hors ligne:', data);
});
```

#### Mise à jour du statut d'une commande
```javascript
socket.on('command_status_update', (data) => {
  console.log('Statut commande:', data);
  // data.commandId, data.status, data.errorMessage
});
```

## 📊 Types de Capteurs Supportés

- `TEMPERATURE` - Température
- `HUMIDITY` - Humidité
- `LIGHT` - Luminosité
- `WATER_LEVEL` - Niveau d'eau
- `PH_LEVEL` - Niveau de pH
- `CO2_LEVEL` - Niveau de CO2
- `MOTION` - Détection de mouvement
- `PRESSURE` - Pression
- `CUSTOM` - Capteur personnalisé

## 🎮 Types de Commandes Supportées

- `PUMP_ON` / `PUMP_OFF` - Pompe
- `LIGHT_ON` / `LIGHT_OFF` - Éclairage
- `HEATER_ON` / `HEATER_OFF` - Chauffage
- `FAN_ON` / `FAN_OFF` - Ventilation
- `FEEDING` - Nourrissage
- `WATER_CHANGE` - Changement d'eau
- `CUSTOM` - Commande personnalisée

## 🔧 Configuration ESP32

### Code d'exemple pour ESP32

```cpp
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

const char* ssid = "VOTRE_WIFI";
const char* password = "VOTRE_PASSWORD";
const char* serverUrl = "ws://votre-api.com/socket.io/?EIO=4&transport=websocket";

WebSocketsClient webSocket;

void setup() {
  Serial.begin(115200);
  
  // Connexion WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connexion WiFi...");
  }
  
  // Connexion WebSocket
  webSocket.begin(serverUrl);
  webSocket.onEvent(webSocketEvent);
  
  // Enregistrement de l'appareil
  registerDevice();
}

void loop() {
  webSocket.loop();
  
  // Envoyer des données de capteurs toutes les 30 secondes
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 30000) {
    sendSensorData();
    lastSend = millis();
  }
  
  // Heartbeat toutes les 5 minutes
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 300000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket déconnecté");
      break;
      
    case WStype_CONNECTED:
      Serial.println("WebSocket connecté");
      break;
      
    case WStype_TEXT:
      handleMessage((char*)payload);
      break;
  }
}

void registerDevice() {
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = "ESP32_001";
  
  String message;
  serializeJson(doc, message);
  
  webSocket.sendTXT("42[\"device_register\"," + message + "]");
}

void sendSensorData() {
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = "ESP32_001";
  doc["sensorType"] = "TEMPERATURE";
  doc["value"] = random(20, 30);
  doc["unit"] = "°C";
  
  String message;
  serializeJson(doc, message);
  
  // Envoyer via HTTP POST
  HTTPClient http;
  http.begin("http://votre-api.com/vivarium/device/sensor-data");
  http.addHeader("Content-Type", "application/json");
  http.POST(message);
  http.end();
}

void sendHeartbeat() {
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = "ESP32_001";
  
  String message;
  serializeJson(doc, message);
  
  webSocket.sendTXT("42[\"device_heartbeat\"," + message + "]");
}

void handleMessage(String message) {
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, message);
  
  String event = doc[0];
  
  if (event == "execute_command") {
    JsonObject command = doc[1];
    String commandType = command["type"];
    
    if (commandType == "PUMP_ON") {
      // Activer la pompe
      digitalWrite(PUMP_PIN, HIGH);
      
      // Confirmer l'exécution
      DynamicJsonDocument response(1024);
      response["commandId"] = command["id"];
      response["success"] = true;
      
      String responseMessage;
      serializeJson(response, responseMessage);
      webSocket.sendTXT("42[\"command_executed\"," + responseMessage + "]");
    }
  }
}
```

## 🚀 Déploiement

### Variables d'environnement requises

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vivarium_db"
INFLUXDB_URL="http://localhost:8086"
INFLUXDB_TOKEN="your_influx_token"
INFLUXDB_ORG="your_org"
JWT_SECRET="your_jwt_secret"
```

### Migration de la base de données

```bash
npx prisma migrate dev --name add_vivarium_models
```

### Démarrage

```bash
npm run start:dev
```

## 📈 Monitoring

L'API inclut :
- **Logs détaillés** pour le debugging
- **Statuts des appareils** en temps réel
- **Historique des commandes**
- **Métriques InfluxDB** pour les données de capteurs

## 🔒 Sécurité

- **Authentification JWT** pour les utilisateurs
- **Validation des données** avec class-validator
- **Rate limiting** pour éviter les abus
- **CORS configuré** pour les applications web
- **Endpoints ESP32** sans authentification (à sécuriser selon vos besoins)

---

**Cette API est maintenant prête pour gérer vos vivariums connectés ! 🐠✨**

