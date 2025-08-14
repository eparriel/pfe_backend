import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    const mockUpdateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    const mockUpdatedUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Updated Name',
      firstName: 'Updated',
      lastName: 'Name',
      role: { name: 'user' },
    };

    const mockRequest = {
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
    };

    it('should return updated user when update is successful', async () => {
      const userId = 1;

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update(
        userId,
        mockUpdateUserDto,
        mockRequest,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        userId,
        mockUpdateUserDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should handle update errors', async () => {
      const userId = 1;

      const mockError = new Error('Update failed');
      mockUsersService.update.mockRejectedValue(mockError);

      await expect(
        controller.update(userId, mockUpdateUserDto, mockRequest),
      ).rejects.toThrow('Update failed');
      expect(usersService.update).toHaveBeenCalledWith(
        userId,
        mockUpdateUserDto,
        mockRequest.user.id,
      );
    });
  });

  describe('remove', () => {
    // mockRequest variable removed as it's not used

    const mockDeleteResponse = {
      message: 'User deleted successfully',
    };

    it('should return success message when deletion is successful', async () => {
      const userId = 1;

      mockUsersService.remove.mockResolvedValue(mockDeleteResponse);

      const result = await controller.remove(userId);

      expect(usersService.remove).toHaveBeenCalledWith(userId, userId, true);
      expect(result).toEqual(mockDeleteResponse);
    });

    it('should handle deletion errors', async () => {
      const userId = 1;

      const mockError = new Error('Deletion failed');
      mockUsersService.remove.mockRejectedValue(mockError);

      await expect(controller.remove(userId)).rejects.toThrow(
        'Deletion failed',
      );
      expect(usersService.remove).toHaveBeenCalledWith(userId, userId, true);
    });
  });

  describe('deleteOwnAccount', () => {
    const mockRequest = {
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
    };

    const mockDeleteResponse = {
      message: 'User deleted successfully',
    };

    it('should return success message when own account deletion is successful', async () => {
      mockUsersService.remove.mockResolvedValue(mockDeleteResponse);

      const result = await controller.deleteOwnAccount(mockRequest);

      expect(usersService.remove).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockRequest.user.id,
        false,
      );
      expect(result).toEqual(mockDeleteResponse);
    });

    it('should handle own account deletion errors', async () => {
      const mockError = new Error('Deletion failed');
      mockUsersService.remove.mockRejectedValue(mockError);

      await expect(controller.deleteOwnAccount(mockRequest)).rejects.toThrow(
        'Deletion failed',
      );
      expect(usersService.remove).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockRequest.user.id,
        false,
      );
    });
  });

  describe('updateProfile', () => {
    const mockUpdateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    const mockUpdatedUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Updated Name',
      firstName: 'Updated',
      lastName: 'Name',
      role: { name: 'user' },
    };

    const mockRequest = {
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
    };

    it('should return updated user profile when update is successful', async () => {
      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateProfile(
        mockUpdateUserDto,
        mockRequest,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockUpdateUserDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should handle profile update errors', async () => {
      const mockError = new Error('Update failed');
      mockUsersService.update.mockRejectedValue(mockError);

      await expect(
        controller.updateProfile(mockUpdateUserDto, mockRequest),
      ).rejects.toThrow('Update failed');
      expect(usersService.update).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockUpdateUserDto,
        mockRequest.user.id,
      );
    });
  });
});
