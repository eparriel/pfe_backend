import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user payload when token is valid', async () => {
      const mockPayload = {
        sub: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        name: mockPayload.name,
        role: mockPayload.role,
      });
    });

    it('should handle payload with missing fields gracefully', async () => {
      const mockPayload = {
        sub: 1,
        email: 'test@example.com',
        // Missing name and role
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        name: undefined,
        role: undefined,
      });
    });

    it('should handle empty payload', async () => {
      const mockPayload = {};

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: undefined,
        email: undefined,
        name: undefined,
        role: undefined,
      });
    });
  });
});
