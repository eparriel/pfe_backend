// Configuration globale pour les tests
// ConfigModule import removed for testing

// Configuration des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.INFLUXDB_URL = 'http://localhost:8086';
process.env.INFLUXDB_TOKEN = 'test-token';
process.env.INFLUXDB_ORG = 'test-org';
process.env.INFLUXDB_BUCKET = 'test-bucket';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Configuration globale pour Jest
beforeAll(() => {
  // Configuration globale avant tous les tests
});

afterAll(() => {
  // Nettoyage global après tous les tests
});

// Configuration pour chaque test
beforeEach(() => {
  // Configuration avant chaque test
});

afterEach(() => {
  // Nettoyage après chaque test
  jest.clearAllMocks();
});
