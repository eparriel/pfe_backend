import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JsonWebTokenError } from 'jsonwebtoken';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user when user is authenticated', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is not authenticated', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        'Please provide a valid token',
      );
    });

    it('should throw UnauthorizedException when there is an error', () => {
      const mockError = new Error('Some error');

      expect(() => guard.handleRequest(mockError, null, null)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.handleRequest(mockError, null, null)).toThrow(
        'Please provide a valid token',
      );
    });

    it('should throw UnauthorizedException with specific message for JWT errors', () => {
      const mockJwtError = new JsonWebTokenError('Invalid token');

      expect(() => guard.handleRequest(null, null, mockJwtError)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.handleRequest(null, null, mockJwtError)).toThrow(
        'Invalid token',
      );
    });

    it('should return empty user object when user object is empty', () => {
      const result = guard.handleRequest(null, {}, null);
      expect(result).toEqual({});
    });

    it('should throw UnauthorizedException when user object is null', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        'Please provide a valid token',
      );
    });
  });
});
