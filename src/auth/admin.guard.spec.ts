import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user when user is admin', () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      };

      const result = guard.handleRequest(null, mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should return user when user has admin role', () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      };

      const result = guard.handleRequest(null, mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should throw ForbiddenException when user is not admin', () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
      };

      expect(() => guard.handleRequest(null, mockUser)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.handleRequest(null, mockUser)).toThrow(
        'Only administrators can access this resource',
      );
    });

    it('should throw ForbiddenException when user role is undefined', () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'User',
        // role is undefined
      };

      expect(() => guard.handleRequest(null, mockUser)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.handleRequest(null, mockUser)).toThrow(
        'Only administrators can access this resource',
      );
    });

    it('should throw ForbiddenException when user role is null', () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'User',
        role: null,
      };

      expect(() => guard.handleRequest(null, mockUser)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.handleRequest(null, mockUser)).toThrow(
        'Only administrators can access this resource',
      );
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(ForbiddenException);
      expect(() => guard.handleRequest(null, null)).toThrow('Access denied');
    });

    it('should throw ForbiddenException when user object is empty', () => {
      expect(() => guard.handleRequest(null, {})).toThrow(ForbiddenException);
      expect(() => guard.handleRequest(null, {})).toThrow(
        'Only administrators can access this resource',
      );
    });

    it('should throw error when there is an authentication error', () => {
      const mockError = new Error('Authentication failed');

      expect(() => guard.handleRequest(mockError, null)).toThrow(
        'Authentication failed',
      );
    });
  });
});
