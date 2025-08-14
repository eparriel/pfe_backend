import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      role: { name: 'user' },
    };

    it('should return user without password when user exists', async () => {
      const userId = 1;

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          role: true,
        },
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      });
      // Password is removed from result in the service
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 999;

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          role: true,
        },
      });
    });
  });

  describe('update', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      role: { name: 'user' },
    };

    const mockUpdateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
      password: 'newpassword',
    };

    it('should update user successfully when updating own profile', async () => {
      const userId = 1;
      const currentUserId = 1;
      const hashedPassword = 'newHashedPassword';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...mockUpdateUserDto,
        password: hashedPassword,
        name: 'Updated Name',
      });

      await service.update(userId, mockUpdateUserDto, currentUserId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { role: true },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockUpdateUserDto.password,
        10,
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          firstName: 'Updated',
          lastName: 'Name',
          password: hashedPassword,
          name: 'Updated Name',
        },
        include: { role: true },
      });
      // Password is removed from result in the service
    });

    it('should update name when firstName or lastName changes', async () => {
      const userId = 1;
      const currentUserId = 1;
      const updateDto = { firstName: 'New' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
        name: 'New User',
      });

      await service.update(userId, updateDto, currentUserId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          firstName: 'New',
          name: 'New User',
        },
        include: { role: true },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 999;
      const currentUserId = 1;

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update(userId, mockUpdateUserDto, currentUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when updating another user profile', async () => {
      const userId = 1;
      const currentUserId = 2;

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.update(userId, mockUpdateUserDto, currentUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should not hash password when password is not provided', async () => {
      const userId = 1;
      const currentUserId = 1;
      const updateDto = { firstName: 'Updated' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
        name: 'Updated User',
      });

      await service.update(userId, updateDto, currentUserId);

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          firstName: 'Updated',
          name: 'Updated User',
        },
        include: { role: true },
      });
    });
  });

  describe('remove', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should delete user successfully when deleting own account', async () => {
      const userId = 1;
      const currentUserId = 1;
      const isAdmin = false;

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(userId, currentUserId, isAdmin);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should delete user successfully when admin deletes any account', async () => {
      const userId = 1;
      const currentUserId = 2;
      const isAdmin = true;

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(userId, currentUserId, isAdmin);

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 999;
      const currentUserId = 1;
      const isAdmin = false;

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.remove(userId, currentUserId, isAdmin),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-admin tries to delete another user', async () => {
      const userId = 1;
      const currentUserId = 2;
      const isAdmin = false;

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.remove(userId, currentUserId, isAdmin),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
