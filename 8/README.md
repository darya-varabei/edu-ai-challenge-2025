# Robust Validation Library

A powerful, flexible, and type-safe JavaScript validation library for complex data structures. Built with modern JavaScript practices and designed for ease of use and extensibility.

## Features

- ✅ **Type-safe validation** for primitive types (string, number, boolean, date)
- 🏗️ **Complex data structures** support (objects, arrays)
- 🔗 **Chainable API** for building complex validation rules
- 🎯 **Custom error messages** with detailed validation feedback
- 📦 **Optional fields** support
- 🧩 **Nested validation** for deeply structured data
- 🚀 **Zero dependencies** - lightweight and fast
- 📝 **Comprehensive test coverage** with detailed edge case handling

## Installation

```bash
npm install robust-validation-library
```

Or clone this repository:

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

## Quick Start

```javascript
const { Schema } = require('./schema.js');

// Simple validation
const nameValidator = Schema.string().minLength(2).maxLength(50);
const result = nameValidator.validate("John Doe");

if (result.valid) {
  console.log("Valid name:", result.value);
} else {
  console.log("Validation error:", result.error);
}
```

## API Reference

### Schema Builder

The `Schema` class provides static methods to create validators for different data types.

#### Schema.string()

Creates a string validator with optional constraints.

```javascript
const validator = Schema.string()
  .minLength(3)           // Minimum length
  .maxLength(100)         // Maximum length
  .pattern(/^[a-zA-Z]+$/) // Regex pattern
  .optional()             // Allow undefined/null
  .withMessage('Custom error message');

// Example: Email validation
const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please enter a valid email address');
```

**Methods:**
- `minLength(length)` - Set minimum string length
- `maxLength(length)` - Set maximum string length
- `pattern(regex)` - Set regex pattern to match
- `optional()` - Make field optional
- `withMessage(message)` - Set custom error message

#### Schema.number()

Creates a number validator with optional constraints.

```javascript
const validator = Schema.number()
  .min(0)          // Minimum value
  .max(100)        // Maximum value
  .integer()       // Must be integer
  .optional()      // Allow undefined/null
  .withMessage('Custom error message');

// Example: Age validation
const ageValidator = Schema.number()
  .min(0)
  .max(150)
  .integer()
  .withMessage('Age must be a valid number between 0 and 150');
```

**Methods:**
- `min(value)` - Set minimum value
- `max(value)` - Set maximum value
- `integer()` - Require integer values
- `optional()` - Make field optional
- `withMessage(message)` - Set custom error message

#### Schema.boolean()

Creates a boolean validator.

```javascript
const validator = Schema.boolean()
  .optional()      // Allow undefined/null
  .withMessage('Custom error message');

// Example: Terms acceptance
const termsValidator = Schema.boolean()
  .withMessage('You must accept the terms and conditions');
```

#### Schema.date()

Creates a date validator with optional constraints.

```javascript
const validator = Schema.date()
  .before(new Date('2025-01-01'))  // Must be before date
  .after(new Date('2020-01-01'))   // Must be after date
  .optional()                      // Allow undefined/null
  .withMessage('Custom error message');

// Example: Birth date validation
const birthDateValidator = Schema.date()
  .before(new Date())
  .after(new Date('1900-01-01'))
  .withMessage('Please enter a valid birth date');
```

**Methods:**
- `before(date)` - Set maximum date
- `after(date)` - Set minimum date
- `optional()` - Make field optional
- `withMessage(message)` - Set custom error message

#### Schema.object(schema)

Creates an object validator with field-level validation.

```javascript
const userValidator = Schema.object({
  name: Schema.string().minLength(2),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(0).optional(),
  isActive: Schema.boolean()
});

// Nested objects
const addressValidator = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  zipCode: Schema.string().pattern(/^\d{5}$/)
});

const personValidator = Schema.object({
  name: Schema.string(),
  address: addressValidator
});
```

#### Schema.array(itemValidator)

Creates an array validator with item-level validation.

```javascript
const validator = Schema.array(Schema.string())
  .minItems(1)     // Minimum array length
  .maxItems(10)    // Maximum array length
  .optional()      // Allow undefined/null
  .withMessage('Custom error message');

// Example: Tags validation
const tagsValidator = Schema.array(Schema.string().minLength(1))
  .minItems(1)
  .maxItems(10)
  .withMessage('Please provide 1-10 tags');

// Array of objects
const usersValidator = Schema.array(
  Schema.object({
    id: Schema.number(),
    name: Schema.string()
  })
);
```

**Methods:**
- `minItems(count)` - Set minimum array length
- `maxItems(count)` - Set maximum array length
- `optional()` - Make field optional
- `withMessage(message)` - Set custom error message

## Usage Examples

### Basic Validation

```javascript
const { Schema } = require('./schema.js');

// String validation
const nameResult = Schema.string()
  .minLength(2)
  .maxLength(50)
  .validate("John Doe");

console.log(nameResult); // { valid: true, value: "John Doe" }

// Number validation with constraints
const ageResult = Schema.number()
  .min(0)
  .max(150)
  .integer()
  .validate(25);

console.log(ageResult); // { valid: true, value: 25 }
```

### Complex Object Validation

```javascript
// Define address schema
const addressSchema = Schema.object({
  street: Schema.string().minLength(5),
  city: Schema.string().minLength(2),
  zipCode: Schema.string().pattern(/^\d{5}$/),
  country: Schema.string().minLength(2)
});

// Define user schema
const userSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(100),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(0).max(150).optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()).minItems(1).maxItems(10),
  address: addressSchema.optional(),
  preferences: Schema.object({
    newsletter: Schema.boolean(),
    theme: Schema.string().pattern(/^(light|dark)$/)
  }).optional()
});

// Validate user data
const userData = {
  id: "user123",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  age: 28,
  isActive: true,
  tags: ["developer", "javascript", "nodejs"],
  address: {
    street: "123 Main Street",
    city: "San Francisco",
    zipCode: "94105",
    country: "USA"
  },
  preferences: {
    newsletter: true,
    theme: "dark"
  }
};

const result = userSchema.validate(userData);

if (result.valid) {
  console.log("User data is valid:", result.value);
} else {
  console.log("Validation failed:", result.error);
  console.log("Field errors:", result.errors);
}
```

### Error Handling

```javascript
const userSchema = Schema.object({
  name: Schema.string().minLength(2).withMessage('Name must be at least 2 characters'),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage('Invalid email format'),
  age: Schema.number().min(18).withMessage('Must be at least 18 years old')
});

const invalidData = {
  name: "J",
  email: "invalid-email",
  age: 16
};

const result = userSchema.validate(invalidData);

console.log(result);
/*
Output:
{
  valid: false,
  error: "Object validation failed",
  errors: {
    name: "Name must be at least 2 characters",
    email: "Invalid email format",
    age: "Must be at least 18 years old"
  }
}
*/
```

### Optional Fields

```javascript
const profileSchema = Schema.object({
  username: Schema.string().minLength(3),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  bio: Schema.string().maxLength(500).optional(),
  website: Schema.string().pattern(/^https?:\/\/.+/).optional(),
  socialMedia: Schema.object({
    twitter: Schema.string().optional(),
    linkedin: Schema.string().optional()
  }).optional()
});

// Valid with minimal data
const minimalProfile = {
  username: "johndoe",
  email: "john@example.com"
};

const result = profileSchema.validate(minimalProfile);
console.log(result.valid); // true
```

### Array Validation

```javascript
// Simple array
const numbersValidator = Schema.array(Schema.number())
  .minItems(1)
  .maxItems(5);

console.log(numbersValidator.validate([1, 2, 3])); // { valid: true, value: [1, 2, 3] }

// Array of objects
const productsValidator = Schema.array(
  Schema.object({
    id: Schema.number(),
    name: Schema.string().minLength(1),
    price: Schema.number().min(0),
    inStock: Schema.boolean()
  })
).minItems(1);

const products = [
  { id: 1, name: "Laptop", price: 999.99, inStock: true },
  { id: 2, name: "Mouse", price: 29.99, inStock: false }
];

const result = productsValidator.validate(products);
console.log(result.valid); // true
```

## Running Tests

The library comes with comprehensive unit tests covering all functionality, edge cases, and error scenarios.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Generate coverage report file
npm run test:coverage-report
```

### Test Coverage

The test suite includes:
- ✅ All validator types (string, number, boolean, date, object, array)
- ✅ Constraint validation (min/max, length, patterns)
- ✅ Optional field handling
- ✅ Custom error messages
- ✅ Complex nested structures
- ✅ Edge cases and error conditions
- ✅ Chainable API functionality

## Error Response Format

All validation methods return a consistent response format:

### Successful Validation
```javascript
{
  valid: true,
  value: <validated-value>
}
```

### Failed Validation
```javascript
{
  valid: false,
  error: "Error message"
}
```

### Object Validation Errors
```javascript
{
  valid: false,
  error: "Object validation failed",
  errors: {
    fieldName1: "Field-specific error message",
    fieldName2: "Another field error"
  }
}
```

### Array Validation Errors
```javascript
{
  valid: false,
  error: "Array validation failed",
  errors: [
    { index: 0, error: "Item error message" },
    { index: 2, error: "Another item error" }
  ]
}
```

## Best Practices

### 1. Use Descriptive Custom Messages

```javascript
const passwordValidator = Schema.string()
  .minLength(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, and numeric characters');
```

### 2. Create Reusable Schema Components

```javascript
// Define common patterns
const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please enter a valid email address');

const phoneValidator = Schema.string()
  .pattern(/^\+?[\d\s-()]+$/)
  .withMessage('Please enter a valid phone number');

// Reuse in multiple schemas
const contactSchema = Schema.object({
  email: emailValidator,
  phone: phoneValidator.optional()
});
```

### 3. Structure Complex Validations

```javascript
// Break down complex schemas into smaller, manageable pieces
const addressValidation = Schema.object({
  street: Schema.string().minLength(5),
  city: Schema.string().minLength(2),
  zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/)
});

const userValidation = Schema.object({
  // Personal info
  firstName: Schema.string().minLength(1).maxLength(50),
  lastName: Schema.string().minLength(1).maxLength(50),
  
  // Contact info
  email: emailValidator,
  phone: phoneValidator.optional(),
  
  // Address
  address: addressValidation,
  billingAddress: addressValidation.optional()
});
```

### 4. Handle Validation Errors Gracefully

```javascript
function validateAndProcess(data, schema) {
  const result = schema.validate(data);
  
  if (!result.valid) {
    if (result.errors) {
      // Handle field-specific errors
      Object.entries(result.errors).forEach(([field, error]) => {
        console.error(`${field}: ${error}`);
      });
    } else {
      console.error(result.error);
    }
    return null;
  }
  
  return result.value;
}
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

For questions, issues, or feature requests, please open an issue on the GitHub repository. 