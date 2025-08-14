import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      role: { name: 'user' },
    };

    it('should return user without password when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { role: true },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
      // Password is removed from result in the service
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { role: true },
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: { name: 'user' },
    };

    const mockToken = 'jwt.token.here';

    it('should return access token and user data when login is successful', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(email, password);

      expect(service.validateUser).toHaveBeenCalledWith(email, password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role.name,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role.name,
        },
      });
    });
  });

  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    const mockUserRole = {
      id: 1,
      name: 'user',
    };

    const mockCreatedUser = {
      id: 2,
      email: 'newuser@example.com',
      password: 'hashedPassword',
      firstName: 'New',
      lastName: 'User',
      name: 'New User',
      roleId: 1,
      role: mockUserRole,
    };

    it('should create new user successfully when email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockUserRole);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      await service.register(mockRegisterDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'user' },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockRegisterDto.password,
        10,
      );
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockRegisterDto.email,
          password: 'hashedPassword',
          firstName: mockRegisterDto.firstName,
          lastName: mockRegisterDto.lastName,
          name: 'New User',
          roleId: mockUserRole.id,
        },
        include: {
          role: true,
        },
      });
      // Password is removed from result in the service
    });

    it('should create user role if it does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(null);
      mockPrismaService.role.create.mockResolvedValue(mockUserRole);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      await service.register(mockRegisterDto);

      expect(prismaService.role.create).toHaveBeenCalledWith({
        data: { name: 'user' },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'newuser@example.com',
      });

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
    });
  });
});
