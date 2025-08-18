# 🧪 Tests Unitaires - PFE Backend

Ce document explique comment utiliser et maintenir les tests unitaires du projet PFE Backend.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Structure des tests](#structure-des-tests)
- [Exécution des tests](#exécution-des-tests)
- [Écriture de nouveaux tests](#écriture-de-nouveaux-tests)
- [Bonnes pratiques](#bonnes-pratiques)
- [Dépannage](#dépannage)

## 🎯 Vue d'ensemble

Le projet utilise **Jest** comme framework de test principal avec **@nestjs/testing** pour les tests d'intégration. Tous les composants critiques sont testés :

- ✅ **Services** : Logique métier et interactions avec la base de données
- ✅ **Contrôleurs** : Gestion des requêtes HTTP et validation
- ✅ **Guards** : Authentification et autorisation
- ✅ **Stratégies** : Validation JWT
- ✅ **DTOs** : Validation des données d'entrée
- ✅ **Services Prisma** : Connexion et opérations de base de données

## 🏗️ Structure des tests

```
src/
├── auth/
│   ├── auth.service.spec.ts          # Tests du service d'authentification
│   ├── auth.controller.spec.ts       # Tests du contrôleur d'authentification
│   ├── jwt.strategy.spec.ts          # Tests de la stratégie JWT
│   ├── jwt-auth.guard.spec.ts       # Tests du guard JWT
│   ├── admin.guard.spec.ts          # Tests du guard admin
│   └── dto/
│       ├── login.dto.spec.ts         # Tests de validation du DTO de connexion
│       └── register.dto.spec.ts      # Tests de validation du DTO d'inscription
├── users/
│   ├── users.service.spec.ts         # Tests du service des utilisateurs
│   └── users.controller.spec.ts      # Tests du contrôleur des utilisateurs
├── influx/
│   ├── influx.service.spec.ts        # Tests du service InfluxDB
│   └── influx.controller.spec.ts     # Tests du contrôleur InfluxDB
└── prisma/
    └── prisma.service.spec.ts        # Tests du service Prisma
```

## 🚀 Exécution des tests

### Script personnalisé (recommandé)

```bash
# Exécuter tous les tests
./scripts/run-tests.sh

# Tests avec couverture
./scripts/run-tests.sh --coverage

# Tests en mode watch
./scripts/run-tests.sh --watch

# Tests en mode debug
./scripts/run-tests.sh --debug

# Tests en mode verbeux
./scripts/run-tests.sh --verbose

# Afficher l'aide
./scripts/run-tests.sh --help
```

### Commandes npm directes

```bash
# Tests basiques
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests en mode debug
npm run test:debug

# Tests e2e
npm run test:e2e
```

## ✍️ Écriture de nouveaux tests

### 1. Structure d'un test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = await service.methodName(input);
      
      // Assert
      expect(result).toBe('expected');
    });

    it('should throw error when invalid input', async () => {
      // Arrange
      const invalidInput = '';
      
      // Act & Assert
      await expect(service.methodName(invalidInput)).rejects.toThrow('Error message');
    });
  });
});
```

### 2. Mocking des dépendances

```typescript
const mockDependency = {
  method: jest.fn(),
  property: 'value',
};

const module: TestingModule = await Test.createTestingModule({
  providers: [
    YourService,
    {
      provide: DependencyService,
      useValue: mockDependency,
    },
  ],
}).compile();
```

### 3. Tests de validation DTO

```typescript
import { validate } from 'class-validator';
import { YourDto } from './your.dto';

describe('YourDto', () => {
  let dto: YourDto;

  beforeEach(() => {
    dto = new YourDto();
  });

  it('should pass validation with valid data', async () => {
    dto.field = 'valid value';
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid data', async () => {
    dto.field = '';
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isNotEmpty).toBe('field should not be empty');
  });
});
```

## 📊 Couverture de code

La couverture de code est configurée pour inclure :
- **Statements** : 80% minimum
- **Branches** : 80% minimum  
- **Functions** : 80% minimum
- **Lines** : 80% minimum

### Générer un rapport de couverture

```bash
./scripts/run-tests.sh --coverage
```

Le rapport sera disponible dans `coverage/lcov-report/index.html`

## 🎯 Bonnes pratiques

### 1. Nommage des tests

```typescript
// ✅ Bon
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user successfully when valid data provided', async () => {
      // test
    });
    
    it('should throw error when email already exists', async () => {
      // test
    });
  });
});

// ❌ Mauvais
describe('UserService', () => {
  it('should work', async () => {
    // test
  });
});
```

### 2. Structure AAA (Arrange-Act-Assert)

```typescript
it('should return user by id', async () => {
  // Arrange
  const userId = 1;
  const expectedUser = { id: 1, name: 'John' };
  mockUserRepository.findById.mockResolvedValue(expectedUser);
  
  // Act
  const result = await userService.findById(userId);
  
  // Assert
  expect(result).toEqual(expectedUser);
  expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
});
```

### 3. Mocking des erreurs

```typescript
it('should handle database errors gracefully', async () => {
  // Arrange
  const mockError = new Error('Database connection failed');
  mockUserRepository.findById.mockRejectedValue(mockError);
  
  // Act & Assert
  await expect(userService.findById(1)).rejects.toThrow('Database connection failed');
});
```

### 4. Tests d'intégration

```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200);
  });
});
```

## 🔧 Dépannage

### Erreurs communes

#### 1. "Cannot find module" errors

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

#### 2. Tests qui échouent à cause de mocks

```typescript
// Vérifier que les mocks sont correctement configurés
beforeEach(() => {
  jest.clearAllMocks(); // Reset tous les mocks
});

// Vérifier que les mocks sont appelés avec les bons paramètres
expect(mockService.method).toHaveBeenCalledWith(expectedParam);
```

#### 3. Erreurs de validation DTO

```typescript
// Vérifier que les décorateurs de validation sont correctement importés
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// Vérifier que la validation est appelée
const errors = await validate(dto);
console.log('Validation errors:', errors);
```

#### 4. Problèmes de couverture

```bash
# Vérifier la configuration Jest dans package.json
# S'assurer que collectCoverageFrom inclut tous les fichiers nécessaires
```

### Debug des tests

```bash
# Mode debug
./scripts/run-tests.sh --debug

# Mode verbeux
./scripts/run-tests.sh --verbose

# Tests spécifiques
npm test -- --testNamePattern="UserService"
```

## 📈 Métriques de qualité

### Indicateurs clés

- **Couverture de code** : 80% minimum
- **Temps d'exécution** : < 30 secondes pour tous les tests
- **Tests unitaires** : > 90% des composants testés
- **Tests d'intégration** : Tous les endpoints testés

### Surveillance continue

```bash
# Vérifier la couverture avant chaque commit
npm run test:cov

# Vérifier que tous les tests passent
npm test

# Vérifier la qualité du code
npm run lint
```

## 🤝 Contribution

### Ajouter de nouveaux tests

1. Créer le fichier de test avec l'extension `.spec.ts`
2. Suivre la structure et les conventions existantes
3. Tester tous les cas d'usage (succès, erreurs, cas limites)
4. Vérifier que la couverture reste au-dessus de 80%
5. Exécuter tous les tests avant de commiter

### Mettre à jour les tests existants

1. Identifier les tests qui doivent être modifiés
2. Mettre à jour les mocks si nécessaire
3. Vérifier que les nouveaux tests passent
4. S'assurer que la couverture n'a pas diminué

## 📚 Ressources

- [Documentation Jest](https://jestjs.io/docs/getting-started)
- [Documentation NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Class Validator](https://github.com/typestack/class-validator)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing/unit-testing)

---

**Note** : Maintenez toujours une couverture de code élevée et des tests rapides pour assurer la qualité et la maintenabilité du code.



