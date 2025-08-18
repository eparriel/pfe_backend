# 📚 Documentation des APIs - PFE Backend

## 📋 Vue d'ensemble

Cette documentation décrit les endpoints disponibles dans l'API PFE Backend, organisés par service et fonctionnalité.

## 🔐 Authentification

### Base URL
```
http://localhost:3000
```

### Endpoints d'authentification

#### POST /auth/register
**Inscription d'un nouvel utilisateur**

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Réponse:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /auth/login
**Connexion utilisateur**

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Réponse:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## 👥 Gestion des utilisateurs

### Endpoints utilisateurs (protégés par JWT)

#### GET /users/profile
**Récupérer le profil de l'utilisateur connecté**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Réponse:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /users/profile
**Mettre à jour le profil utilisateur**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated"
}
```

**Réponse:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 📊 Service InfluxDB

### Endpoints de données temps réel

#### POST /influx/data
**Envoyer des données vers InfluxDB**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "measurement": "sensor_data",
  "tags": {
    "sensor_id": "temp_001",
    "location": "room_a"
  },
  "fields": {
    "temperature": 23.5,
    "humidity": 45.2
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Data sent to InfluxDB successfully",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### GET /influx/data
**Récupérer des données depuis InfluxDB**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
?measurement=sensor_data&start=-1h&limit=100
```

**Réponse:**
```json
{
  "data": [
    {
      "measurement": "sensor_data",
      "tags": {
        "sensor_id": "temp_001",
        "location": "room_a"
      },
      "fields": {
        "temperature": 23.5,
        "humidity": 45.2
      },
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

## 🔒 Sécurité et autorisation

### JWT Token
- **Format**: Bearer token
- **Expiration**: Configurable (par défaut 24h)
- **Algorithme**: HS256

### Headers requis
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Codes de statut HTTP
- **200**: Succès
- **201**: Créé
- **400**: Requête invalide
- **401**: Non autorisé
- **403**: Interdit
- **404**: Non trouvé
- **500**: Erreur serveur

## 📝 Validation des données

### DTOs (Data Transfer Objects)
Tous les endpoints utilisent des DTOs NestJS avec validation automatique :

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;
}
```

### Messages d'erreur
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

## 🧪 Test des APIs

### Avec cURL
```bash
# Test de santé
curl http://localhost:3000

# Inscription
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Connexion
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Avec Postman
1. Importez la collection fournie
2. Configurez l'environnement avec la base URL
3. Testez les endpoints dans l'ordre (register → login → autres)

### Tests automatisés
```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e
```

## 📊 Monitoring et logs

### Endpoint de santé
```
GET /health
```

**Réponse:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Logs
Les logs sont disponibles via Docker :
```bash
docker-compose logs app
```

## 🚨 Gestion des erreurs

### Erreurs communes
1. **Token expiré** : Renouvelez le token via /auth/login
2. **Données invalides** : Vérifiez le format des données
3. **Service indisponible** : Vérifiez l'état des services Docker

### Dépannage
```bash
# Vérifier l'état des services
docker-compose ps

# Vérifier les logs
docker-compose logs -f app

# Redémarrer l'application
docker-compose restart app
```

## 🔮 Évolutions futures

### APIs planifiées
- **WebSocket** pour les données temps réel
- **GraphQL** pour des requêtes plus flexibles
- **Rate limiting** configurable par utilisateur
- **Webhooks** pour les notifications

### Améliorations
- **Documentation Swagger** interactive
- **Tests de charge** automatisés
- **Monitoring** des performances
- **Cache** Redis pour améliorer les performances

## 📚 Ressources

- [Documentation NestJS](https://docs.nestjs.com/)
- [Guide des DTOs](https://docs.nestjs.com/controllers#request-payloads)
- [Validation des données](https://docs.nestjs.com/techniques/validation)
- [Gestion des erreurs](https://docs.nestjs.com/exception-filters)

---

**Cette documentation est mise à jour régulièrement. Consultez le README pour les dernières informations.** 🚀
