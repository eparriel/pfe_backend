import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      access_token: 'jwt.token.here',
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
    };

    it('should return login response when credentials are valid', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockLoginDto);

      expect(authService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(mockError);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
    });
  });

  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    const mockRegisterResponse = {
      access_token: 'jwt.token.here',
      user: {
        id: 2,
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
      },
    };

    it('should return user data when registration is successful', async () => {
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      const result = await controller.register(mockRegisterDto);

      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(result).toEqual(mockRegisterResponse);
    });

    it('should handle registration errors', async () => {
      const mockError = new Error('Email already exists');
      mockAuthService.register.mockRejectedValue(mockError);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
    });
  });
});
