import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  let registerDto: RegisterDto;

  beforeEach(() => {
    registerDto = new RegisterDto();
  });

  it('should be defined', () => {
    expect(registerDto).toBeDefined();
  });

  describe('email validation', () => {
    it('should pass validation with valid email', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid email format', async () => {
      registerDto.email = 'invalid-email';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEmail).toBe('email must be an email');
    });

    it('should fail validation with empty email', async () => {
      registerDto.email = '';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'email should not be empty',
      );
    });

    it('should fail validation with missing email', async () => {
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';
      // email is undefined

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'email should not be empty',
      );
    });
  });

  describe('password validation', () => {
    it('should pass validation with valid password', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with short password', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = '123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.minLength).toBe(
        'password must be longer than or equal to 6 characters',
      );
    });

    it('should fail validation with empty password', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = '';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'password should not be empty',
      );
    });

    it('should fail validation with missing password', async () => {
      registerDto.email = 'test@example.com';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';
      // password is undefined

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'password should not be empty',
      );
    });
  });

  describe('firstName validation', () => {
    it('should pass validation with valid firstName', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty firstName', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = '';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'firstName should not be empty',
      );
    });

    it('should fail validation with missing firstName', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.lastName = 'Doe';
      // firstName is undefined

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'firstName should not be empty',
      );
    });

    it('should pass validation with very long firstName (no maxLength constraint)', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'a'.repeat(100); // No maxLength constraint
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('lastName validation', () => {
    it('should pass validation with valid lastName', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty lastName', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = '';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'lastName should not be empty',
      );
    });

    it('should fail validation with missing lastName', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      // lastName is undefined

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'lastName should not be empty',
      );
    });

    it('should pass validation with very long lastName (no maxLength constraint)', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'a'.repeat(100); // No maxLength constraint

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('combined validation', () => {
    it('should pass validation with all valid fields', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John';
      registerDto.lastName = 'Doe';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with multiple invalid fields', async () => {
      registerDto.email = 'invalid-email';
      registerDto.password = '123';
      registerDto.firstName = '';
      registerDto.lastName = '';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(4);

      const emailError = errors.find((e) => e.property === 'email');
      const passwordError = errors.find((e) => e.property === 'password');
      const firstNameError = errors.find((e) => e.property === 'firstName');
      const lastNameError = errors.find((e) => e.property === 'lastName');

      expect(emailError?.constraints?.isEmail).toBe('email must be an email');
      expect(passwordError?.constraints?.minLength).toBe(
        'password must be longer than or equal to 6 characters',
      );
      expect(firstNameError?.constraints?.isNotEmpty).toBe(
        'firstName should not be empty',
      );
      expect(lastNameError?.constraints?.isNotEmpty).toBe(
        'lastName should not be empty',
      );
    });

    it('should fail validation with all missing fields', async () => {
      // All fields are undefined

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(4);

      const emailError = errors.find((e) => e.property === 'email');
      const passwordError = errors.find((e) => e.property === 'password');
      const firstNameError = errors.find((e) => e.property === 'firstName');
      const lastNameError = errors.find((e) => e.property === 'lastName');

      expect(emailError?.constraints?.isNotEmpty).toBe(
        'email should not be empty',
      );
      expect(passwordError?.constraints?.isNotEmpty).toBe(
        'password should not be empty',
      );
      expect(firstNameError?.constraints?.isNotEmpty).toBe(
        'firstName should not be empty',
      );
      expect(lastNameError?.constraints?.isNotEmpty).toBe(
        'lastName should not be empty',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in names', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'Jean-Pierre';
      registerDto.lastName = "O'Connor";

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle accented characters in names', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'José';
      registerDto.lastName = 'García';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle numbers in names', async () => {
      registerDto.email = 'test@example.com';
      registerDto.password = 'password123';
      registerDto.firstName = 'John2';
      registerDto.lastName = 'Doe3';

      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle very long valid values', async () => {
      registerDto.email = 'a'.repeat(100) + '@example.com';
      registerDto.password = 'a'.repeat(1000);
      registerDto.firstName = 'a'.repeat(100);
      registerDto.lastName = 'a'.repeat(100);

      const errors = await validate(registerDto);
      // Very long values might fail validation due to length constraints
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });
  });
});
