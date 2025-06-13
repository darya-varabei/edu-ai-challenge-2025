const { 
  Schema, 
  Validator, 
  StringValidator, 
  NumberValidator, 
  BooleanValidator, 
  DateValidator, 
  ObjectValidator, 
  ArrayValidator 
} = require('./schema.js');

describe('Validation Library Tests', () => {

  describe('Base Validator', () => {
    test('should handle required values', () => {
      const validator = new StringValidator();
      const result = validator.validate(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Value is required');
    });

    test('should handle optional values', () => {
      const validator = new StringValidator().optional();
      const result = validator.validate(undefined);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(undefined);
    });

    test('should use custom error messages', () => {
      const validator = new StringValidator().withMessage('Custom error');
      const result = validator.validate(123);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Custom error');
    });
  });

  describe('StringValidator', () => {
    test('should validate valid strings', () => {
      const validator = Schema.string();
      const result = validator.validate('hello');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('hello');
    });

    test('should reject non-strings', () => {
      const validator = Schema.string();
      const result = validator.validate(123);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Value must be a string');
    });

    test('should validate minLength', () => {
      const validator = Schema.string().minLength(5);
      
      const validResult = validator.validate('hello');
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate('hi');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('at least 5 characters');
    });

    test('should validate maxLength', () => {
      const validator = Schema.string().maxLength(5);
      
      const validResult = validator.validate('hello');
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate('hello world');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('at most 5 characters');
    });

    test('should validate pattern', () => {
      const validator = Schema.string().pattern(/^[a-zA-Z]+$/);
      
      const validResult = validator.validate('hello');
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate('hello123');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('does not match required pattern');
    });

    test('should validate email pattern', () => {
      const validator = Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      
      const validResult = validator.validate('test@example.com');
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate('invalid-email');
      expect(invalidResult.valid).toBe(false);
    });

    test('should chain validations', () => {
      const validator = Schema.string()
        .minLength(3)
        .maxLength(10)
        .pattern(/^[a-zA-Z]+$/);
      
      const validResult = validator.validate('hello');
      expect(validResult.valid).toBe(true);
      
      const tooShortResult = validator.validate('hi');
      expect(tooShortResult.valid).toBe(false);
      
      const tooLongResult = validator.validate('verylongstring');
      expect(tooLongResult.valid).toBe(false);
      
      const patternFailResult = validator.validate('hello123');
      expect(patternFailResult.valid).toBe(false);
    });
  });

  describe('NumberValidator', () => {
    test('should validate valid numbers', () => {
      const validator = Schema.number();
      const result = validator.validate(42);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42);
    });

    test('should reject non-numbers', () => {
      const validator = Schema.number();
      const result = validator.validate('123');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Value must be a number');
    });

    test('should reject NaN', () => {
      const validator = Schema.number();
      const result = validator.validate(NaN);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Value must be a number');
    });

    test('should validate minimum value', () => {
      const validator = Schema.number().min(10);
      
      const validResult = validator.validate(15);
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate(5);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('at least 10');
    });

    test('should validate maximum value', () => {
      const validator = Schema.number().max(100);
      
      const validResult = validator.validate(50);
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate(150);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('at most 100');
    });

    test('should validate integer constraint', () => {
      const validator = Schema.number().integer();
      
      const validResult = validator.validate(42);
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate(42.5);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('must be an integer');
    });

    test('should chain validations', () => {
      const validator = Schema.number().min(1).max(100).integer();
      
      const validResult = validator.validate(50);
      expect(validResult.valid).toBe(true);
      
      const tooSmallResult = validator.validate(0);
      expect(tooSmallResult.valid).toBe(false);
      
      const tooLargeResult = validator.validate(101);
      expect(tooLargeResult.valid).toBe(false);
      
      const notIntegerResult = validator.validate(50.5);
      expect(notIntegerResult.valid).toBe(false);
    });
  });

  describe('BooleanValidator', () => {
    test('should validate true', () => {
      const validator = Schema.boolean();
      const result = validator.validate(true);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    test('should validate false', () => {
      const validator = Schema.boolean();
      const result = validator.validate(false);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(false);
    });

    test('should reject non-booleans', () => {
      const validator = Schema.boolean();
      
      const stringResult = validator.validate('true');
      expect(stringResult.valid).toBe(false);
      expect(stringResult.error).toBe('Value must be a boolean');
      
      const numberResult = validator.validate(1);
      expect(numberResult.valid).toBe(false);
      expect(numberResult.error).toBe('Value must be a boolean');
    });
  });

  describe('DateValidator', () => {
    test('should validate Date objects', () => {
      const validator = Schema.date();
      const date = new Date('2023-01-01');
      const result = validator.validate(date);
      expect(result.valid).toBe(true);
      expect(result.value).toEqual(date);
    });

    test('should validate date strings', () => {
      const validator = Schema.date();
      const result = validator.validate('2023-01-01');
      expect(result.valid).toBe(true);
      expect(result.value).toEqual(new Date('2023-01-01'));
    });

    test('should reject invalid dates', () => {
      const validator = Schema.date();
      const result = validator.validate('invalid-date');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid date');
    });

    test('should reject non-date types', () => {
      const validator = Schema.date();
      const result = validator.validate(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Date object or valid date string');
    });

    test('should validate before constraint', () => {
      const cutoffDate = new Date('2023-12-31');
      const validator = Schema.date().before(cutoffDate);
      
      const validResult = validator.validate(new Date('2023-06-01'));
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate(new Date('2024-01-01'));
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('must be before');
    });

    test('should validate after constraint', () => {
      const startDate = new Date('2023-01-01');
      const validator = Schema.date().after(startDate);
      
      const validResult = validator.validate(new Date('2023-06-01'));
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate(new Date('2022-12-31'));
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('must be after');
    });
  });

  describe('ObjectValidator', () => {
    test('should validate simple objects', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      });
      
      const result = validator.validate({
        name: 'John',
        age: 30
      });
      
      expect(result.valid).toBe(true);
      expect(result.value).toEqual({ name: 'John', age: 30 });
    });

    test('should reject non-objects', () => {
      const validator = Schema.object({});
      
      const stringResult = validator.validate('not an object');
      expect(stringResult.valid).toBe(false);
      expect(stringResult.error).toBe('Value must be an object');
      
      const arrayResult = validator.validate([]);
      expect(arrayResult.valid).toBe(false);
      expect(arrayResult.error).toBe('Value must be an object');
      
      const nullResult = validator.validate(null);
      expect(nullResult.valid).toBe(false);
      expect(nullResult.error).toBe('Value is required');
    });

    test('should handle field validation errors', () => {
      const validator = Schema.object({
        name: Schema.string().minLength(5),
        age: Schema.number().min(18)
      });
      
      const result = validator.validate({
        name: 'Jo',
        age: 15
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Object validation failed');
      expect(result.errors.name).toContain('at least 5 characters');
      expect(result.errors.age).toContain('at least 18');
    });

    test('should handle optional fields', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number().optional()
      });
      
      const result = validator.validate({
        name: 'John'
      });
      
      expect(result.valid).toBe(true);
      expect(result.value.name).toBe('John');
      expect(result.value.age).toBe(undefined);
    });

    test('should validate nested objects', () => {
      const addressValidator = Schema.object({
        street: Schema.string(),
        city: Schema.string()
      });
      
      const personValidator = Schema.object({
        name: Schema.string(),
        address: addressValidator
      });
      
      const validResult = personValidator.validate({
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Anytown'
        }
      });
      
      expect(validResult.valid).toBe(true);
      
      const invalidResult = personValidator.validate({
        name: 'John',
        address: {
          street: 123,
          city: 'Anytown'
        }
      });
      
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('ArrayValidator', () => {
    test('should validate arrays of strings', () => {
      const validator = Schema.array(Schema.string());
      const result = validator.validate(['a', 'b', 'c']);
      expect(result.valid).toBe(true);
      expect(result.value).toEqual(['a', 'b', 'c']);
    });

    test('should reject non-arrays', () => {
      const validator = Schema.array(Schema.string());
      const result = validator.validate('not an array');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Value must be an array');
    });

    test('should validate item constraints', () => {
      const validator = Schema.array(Schema.string().minLength(3));
      
      const validResult = validator.validate(['hello', 'world']);
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate(['hello', 'hi']);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toBe('Array validation failed');
      expect(invalidResult.errors[0].index).toBe(1);
    });

    test('should validate minItems constraint', () => {
      const validator = Schema.array(Schema.string()).minItems(2);
      
      const validResult = validator.validate(['a', 'b']);
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate(['a']);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('at least 2 items');
    });

    test('should validate maxItems constraint', () => {
      const validator = Schema.array(Schema.string()).maxItems(2);
      
      const validResult = validator.validate(['a', 'b']);
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate(['a', 'b', 'c']);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('at most 2 items');
    });

    test('should validate arrays of objects', () => {
      const itemValidator = Schema.object({
        id: Schema.number(),
        name: Schema.string()
      });
      const validator = Schema.array(itemValidator);
      
      const validResult = validator.validate([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]);
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validator.validate([
        { id: 1, name: 'John' },
        { id: 'two', name: 'Jane' }
      ]);
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('Complex Schema Validation', () => {
    test('should validate complex user schema', () => {
      const addressSchema = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        postalCode: Schema.string().pattern(/^\d{5}$/),
        country: Schema.string()
      });

      const userSchema = Schema.object({
        id: Schema.string(),
        name: Schema.string().minLength(2).maxLength(50),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        age: Schema.number().min(0).max(150).optional(),
        isActive: Schema.boolean(),
        tags: Schema.array(Schema.string()).minItems(1),
        address: addressSchema.optional(),
        metadata: Schema.object({}).optional()
      });

      const validUser = {
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        isActive: true,
        tags: ["developer", "designer"],
        address: {
          street: "123 Main St",
          city: "Anytown",
          postalCode: "12345",
          country: "USA"
        },
        metadata: {}
      };

      const result = userSchema.validate(validUser);
      expect(result.valid).toBe(true);
    });

    test('should handle validation errors in complex schema', () => {
      const userSchema = Schema.object({
        name: Schema.string().minLength(2),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        age: Schema.number().min(0)
      });

      const invalidUser = {
        name: "J",
        email: "invalid-email",
        age: -5
      };

      const result = userSchema.validate(invalidUser);
      expect(result.valid).toBe(false);
      expect(result.errors.name).toContain('at least 2 characters');
      expect(result.errors.email).toContain('does not match required pattern');
      expect(result.errors.age).toContain('at least 0');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty objects', () => {
      const validator = Schema.object({});
      const result = validator.validate({});
      expect(result.valid).toBe(true);
    });

    test('should handle empty arrays', () => {
      const validator = Schema.array(Schema.string());
      const result = validator.validate([]);
      expect(result.valid).toBe(true);
    });

    test('should handle null and undefined consistently', () => {
      const stringValidator = Schema.string();
      const optionalStringValidator = Schema.string().optional();
      
      expect(stringValidator.validate(null).valid).toBe(false);
      expect(stringValidator.validate(undefined).valid).toBe(false);
      expect(optionalStringValidator.validate(null).valid).toBe(true);
      expect(optionalStringValidator.validate(undefined).valid).toBe(true);
    });

    test('should handle special number values', () => {
      const validator = Schema.number();
      
      expect(validator.validate(Infinity).valid).toBe(true);
      expect(validator.validate(-Infinity).valid).toBe(true);
      expect(validator.validate(0).valid).toBe(true);
      expect(validator.validate(-0).valid).toBe(true);
    });

    test('should validate date edge cases', () => {
      const validator = Schema.date();
      
      // Valid date strings
      expect(validator.validate('2023-02-28').valid).toBe(true);
      expect(validator.validate('2023-12-31T23:59:59.999Z').valid).toBe(true);
      
      // Invalid date strings
      expect(validator.validate('not-a-date').valid).toBe(false);
      expect(validator.validate('').valid).toBe(false);
    });
  });
}); 