import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      // Mock the $connect method
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      // Mock the $connect method to throw an error
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockRejectedValue(new Error('Connection failed'));

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database', async () => {
      // Mock the $disconnect method
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should handle disconnection errors', async () => {
      // Mock the $disconnect method to throw an error
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockRejectedValue(new Error('Disconnection failed'));

      await expect(service.onModuleDestroy()).rejects.toThrow(
        'Disconnection failed',
      );
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('database operations', () => {
    it('should have user model available', () => {
      expect(service.user).toBeDefined();
      expect(typeof service.user.findMany).toBe('function');
      expect(typeof service.user.findUnique).toBe('function');
      expect(typeof service.user.create).toBe('function');
      expect(typeof service.user.update).toBe('function');
      expect(typeof service.user.delete).toBe('function');
    });

    it('should have role model available', () => {
      expect(service.role).toBeDefined();
      expect(typeof service.role.findMany).toBe('function');
      expect(typeof service.role.findUnique).toBe('function');
      expect(typeof service.role.create).toBe('function');
      expect(typeof service.role.update).toBe('function');
      expect(typeof service.role.delete).toBe('function');
    });

    it('should have transaction support', () => {
      expect(service.$transaction).toBeDefined();
      expect(typeof service.$transaction).toBe('function');
    });

    it('should have query support', () => {
      expect(service.$queryRaw).toBeDefined();
      expect(typeof service.$queryRaw).toBe('function');
    });

    it('should have execute support', () => {
      expect(service.$executeRaw).toBeDefined();
      expect(typeof service.$executeRaw).toBe('function');
    });
  });
});



