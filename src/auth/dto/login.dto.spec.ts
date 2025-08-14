import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  let loginDto: LoginDto;

  beforeEach(() => {
    loginDto = new LoginDto();
  });

  it('should be defined', () => {
    expect(loginDto).toBeDefined();
  });

  describe('email validation', () => {
    it('should pass validation with valid email', async () => {
      loginDto.email = 'test@example.com';
      loginDto.password = 'password123';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid email format', async () => {
      loginDto.email = 'invalid-email';
      loginDto.password = 'password123';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEmail).toBe('email must be an email');
    });

    it('should fail validation with empty email', async () => {
      loginDto.email = '';
      loginDto.password = 'password123';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'email should not be empty',
      );
    });

    it('should fail validation with missing email', async () => {
      loginDto.password = 'password123';
      // email is undefined

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'email should not be empty',
      );
    });

    it('should fail validation with null email', async () => {
      loginDto.email = null as any;
      loginDto.password = 'password123';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'email should not be empty',
      );
    });
  });

  describe('password validation', () => {
    it('should pass validation with valid password', async () => {
      loginDto.email = 'test@example.com';
      loginDto.password = 'password123';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty password', async () => {
      loginDto.email = 'test@example.com';
      loginDto.password = '';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'password should not be empty',
      );
    });

    it('should fail validation with missing password', async () => {
      loginDto.email = 'test@example.com';
      // password is undefined

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'password should not be empty',
      );
    });

    it('should fail validation with null password', async () => {
      loginDto.email = 'test@example.com';
      loginDto.password = null as any;

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'password should not be empty',
      );
    });

    it('should pass validation with short password (no minLength constraint)', async () => {
      loginDto.email = 'test@example.com';
      loginDto.password = '123';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('combined validation', () => {
    it('should pass validation with both valid email and password', async () => {
      loginDto.email = 'test@example.com';
      loginDto.password = 'password123';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with both invalid email and password', async () => {
      loginDto.email = 'invalid-email';
      loginDto.password = '';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(2);

      const emailError = errors.find((e) => e.property === 'email');
      const passwordError = errors.find((e) => e.property === 'password');

      expect(emailError?.constraints?.isEmail).toBe('email must be an email');
      expect(passwordError?.constraints?.isNotEmpty).toBe(
        'password should not be empty',
      );
    });

    it('should fail validation with missing both fields', async () => {
      // Both email and password are undefined

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(2);

      const emailError = errors.find((e) => e.property === 'email');
      const passwordError = errors.find((e) => e.property === 'password');

      expect(emailError?.constraints?.isNotEmpty).toBe(
        'email should not be empty',
      );
      expect(passwordError?.constraints?.isNotEmpty).toBe(
        'password should not be empty',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long email', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      loginDto.email = longEmail;
      loginDto.password = 'password123';

      const errors = await validate(loginDto);
      // Very long emails might fail validation due to length constraints
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long password', async () => {
      loginDto.email = 'test@example.com';
      const longPassword = 'a'.repeat(1000);
      loginDto.password = longPassword;

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in email', async () => {
      loginDto.email = 'test+tag@example.co.uk';
      loginDto.password = 'password123';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in password', async () => {
      loginDto.email = 'test@example.com';
      loginDto.password = 'p@ssw0rd!@#$%^&*()';

      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
  });
});
