// Validation Library - Schema Builder
// A robust, type-safe validation library for JavaScript that supports primitive types,
// complex objects, arrays, and nested validation with custom error messages.

/**
 * Base Validator class that provides common functionality for all validators.
 * All specific validator types extend this class to inherit common behavior
 * like optional field handling and custom error messages.
 */
class Validator {
  constructor() {
    // Flag to indicate if this field is optional (can be null/undefined)
    this._optional = false;
    // Custom error message to override default validation messages
    this._customMessage = null;
  }

  /**
   * Marks this validator as optional, allowing null/undefined values to pass validation
   * @returns {Validator} Returns this instance for method chaining
   */
  optional() {
    this._optional = true;
    return this;
  }

  /**
   * Sets a custom error message that will be used instead of default error messages
   * @param {string} message - The custom error message to display on validation failure
   * @returns {Validator} Returns this instance for method chaining
   */
  withMessage(message) {
    this._customMessage = message;
    return this;
  }

  /**
   * Main validation method that handles null/undefined checks and delegates to _validate
   * @param {any} value - The value to validate
   * @returns {Object} Validation result with 'valid' boolean and 'value' or 'error'
   */
  validate(value) {
    // Handle null and undefined values - fail if required, pass if optional
    if (value === undefined || value === null) {
      if (this._optional) {
        return { valid: true, value: value };
      }
      return { 
        valid: false, 
        error: this._customMessage || 'Value is required' 
      };
    }
    // Delegate actual validation logic to subclass implementation
    return this._validate(value);
  }

  /**
   * Abstract method that must be implemented by subclasses to define validation logic
   * @param {any} value - The value to validate (guaranteed not null/undefined)
   * @throws {Error} If not implemented by subclass
   */
  _validate(value) {
    throw new Error('_validate method must be implemented by subclass');
  }
}

/**
 * String Validator class for validating string values with various constraints
 * Supports minimum/maximum length validation and regex pattern matching
 */
class StringValidator extends Validator {
  constructor() {
    super();
    // Minimum required string length (null = no minimum)
    this._minLength = null;
    // Maximum allowed string length (null = no maximum)
    this._maxLength = null;
    // Regular expression pattern to match (null = no pattern requirement)
    this._pattern = null;
  }

  /**
   * Sets the minimum required length for the string
   * @param {number} length - Minimum length (inclusive)
   * @returns {StringValidator} Returns this instance for method chaining
   */
  minLength(length) {
    this._minLength = length;
    return this;
  }

  /**
   * Sets the maximum allowed length for the string
   * @param {number} length - Maximum length (inclusive)
   * @returns {StringValidator} Returns this instance for method chaining
   */
  maxLength(length) {
    this._maxLength = length;
    return this;
  }

  /**
   * Sets a regular expression pattern that the string must match
   * @param {RegExp} regex - Regular expression pattern to validate against
   * @returns {StringValidator} Returns this instance for method chaining
   */
  pattern(regex) {
    this._pattern = regex;
    return this;
  }

  /**
   * Validates that the value is a string and meets all configured constraints
   * @param {any} value - The value to validate
   * @returns {Object} Validation result with success/failure and error details
   */
  _validate(value) {
    // First check if the value is actually a string
    if (typeof value !== 'string') {
      return { 
        valid: false, 
        error: this._customMessage || 'Value must be a string' 
      };
    }

    // Check minimum length constraint if configured
    if (this._minLength !== null && value.length < this._minLength) {
      return { 
        valid: false, 
        error: this._customMessage || `String must be at least ${this._minLength} characters long` 
      };
    }

    // Check maximum length constraint if configured
    if (this._maxLength !== null && value.length > this._maxLength) {
      return { 
        valid: false, 
        error: this._customMessage || `String must be at most ${this._maxLength} characters long` 
      };
    }

    // Check regex pattern constraint if configured
    if (this._pattern !== null && !this._pattern.test(value)) {
      return { 
        valid: false, 
        error: this._customMessage || 'String does not match required pattern' 
      };
    }

    // All validations passed - return the validated string
    return { valid: true, value: value };
  }
}

/**
 * Number Validator class for validating numeric values with range and type constraints
 * Supports minimum/maximum value validation and integer-only validation
 */
class NumberValidator extends Validator {
  constructor() {
    super();
    // Minimum allowed numeric value (null = no minimum)
    this._min = null;
    // Maximum allowed numeric value (null = no maximum)
    this._max = null;
    // Whether the number must be an integer (no decimal places)
    this._integer = false;
  }

  /**
   * Sets the minimum allowed value for the number
   * @param {number} value - Minimum value (inclusive)
   * @returns {NumberValidator} Returns this instance for method chaining
   */
  min(value) {
    this._min = value;
    return this;
  }

  /**
   * Sets the maximum allowed value for the number
   * @param {number} value - Maximum value (inclusive)
   * @returns {NumberValidator} Returns this instance for method chaining
   */
  max(value) {
    this._max = value;
    return this;
  }

  /**
   * Requires the number to be an integer (whole number without decimal places)
   * @returns {NumberValidator} Returns this instance for method chaining
   */
  integer() {
    this._integer = true;
    return this;
  }

  /**
   * Validates that the value is a number and meets all configured constraints
   * @param {any} value - The value to validate
   * @returns {Object} Validation result with success/failure and error details
   */
  _validate(value) {
    // Check if value is a valid number (not NaN, not a string, etc.)
    if (typeof value !== 'number' || isNaN(value)) {
      return { 
        valid: false, 
        error: this._customMessage || 'Value must be a number' 
      };
    }

    // Check integer constraint if required
    if (this._integer && !Number.isInteger(value)) {
      return { 
        valid: false, 
        error: this._customMessage || 'Value must be an integer' 
      };
    }

    // Check minimum value constraint if configured
    if (this._min !== null && value < this._min) {
      return { 
        valid: false, 
        error: this._customMessage || `Number must be at least ${this._min}` 
      };
    }

    // Check maximum value constraint if configured
    if (this._max !== null && value > this._max) {
      return { 
        valid: false, 
        error: this._customMessage || `Number must be at most ${this._max}` 
      };
    }

    // All validations passed - return the validated number
    return { valid: true, value: value };
  }
}

/**
 * Boolean Validator class for validating boolean values (true/false)
 * Ensures the value is strictly a boolean type, not truthy/falsy values
 */
class BooleanValidator extends Validator {
  /**
   * Validates that the value is strictly a boolean (true or false)
   * @param {any} value - The value to validate
   * @returns {Object} Validation result with success/failure and error details
   */
  _validate(value) {
    // Use strict type checking - only true/false are valid, not truthy/falsy values
    if (typeof value !== 'boolean') {
      return { 
        valid: false, 
        error: this._customMessage || 'Value must be a boolean' 
      };
    }
    // Boolean validation passed - return the validated boolean
    return { valid: true, value: value };
  }
}

/**
 * Date Validator class for validating date values with temporal constraints
 * Accepts Date objects or valid date strings, supports before/after constraints
 */
class DateValidator extends Validator {
  constructor() {
    super();
    // Latest allowed date (null = no upper bound)
    this._before = null;
    // Earliest allowed date (null = no lower bound)
    this._after = null;
  }

  /**
   * Sets the latest allowed date (value must be before this date)
   * @param {Date} date - The upper bound date (exclusive)
   * @returns {DateValidator} Returns this instance for method chaining
   */
  before(date) {
    this._before = date;
    return this;
  }

  /**
   * Sets the earliest allowed date (value must be after this date)
   * @param {Date} date - The lower bound date (exclusive)
   * @returns {DateValidator} Returns this instance for method chaining
   */
  after(date) {
    this._after = date;
    return this;
  }

  /**
   * Validates date values, accepting both Date objects and valid date strings
   * @param {any} value - The value to validate (Date object or date string)
   * @returns {Object} Validation result with success/failure and error details
   */
  _validate(value) {
    let dateValue;
    
    // Handle Date objects directly
    if (value instanceof Date) {
      dateValue = value;
    } 
    // Try to parse string values as dates
    else if (typeof value === 'string') {
      dateValue = new Date(value);
    } 
    // Reject non-date, non-string values
    else {
      return { 
        valid: false, 
        error: this._customMessage || 'Value must be a Date object or valid date string' 
      };
    }

    // Check if the date is valid (not Invalid Date)
    if (isNaN(dateValue.getTime())) {
      return { 
        valid: false, 
        error: this._customMessage || 'Value must be a valid date' 
      };
    }

    // Check 'before' constraint if configured (date must be earlier than limit)
    if (this._before !== null && dateValue >= this._before) {
      return { 
        valid: false, 
        error: this._customMessage || `Date must be before ${this._before.toISOString()}` 
      };
    }

    // Check 'after' constraint if configured (date must be later than limit)
    if (this._after !== null && dateValue <= this._after) {
      return { 
        valid: false, 
        error: this._customMessage || `Date must be after ${this._after.toISOString()}` 
      };
    }

    // All date validations passed - return the validated Date object
    return { valid: true, value: dateValue };
  }
}

/**
 * Object Validator class for validating complex objects with field-level validation
 * Validates each field according to its own validator and aggregates results
 */
class ObjectValidator extends Validator {
  /**
   * Creates an object validator with field-specific validation rules
   * @param {Object} schema - Map of field names to their respective validators
   */
  constructor(schema) {
    super();
    // Store the validation schema (field name -> validator mappings)
    this.schema = schema;
  }

  /**
   * Validates an object by checking each field against its configured validator
   * @param {any} value - The value to validate (should be an object)
   * @returns {Object} Validation result with field-level error details
   */
  _validate(value) {
    // Ensure the value is actually an object (not array, null, or primitive)
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { 
        valid: false, 
        error: this._customMessage || 'Value must be an object' 
      };
    }

    // Initialize result tracking for field validation
    const result = { valid: true, value: {}, errors: {} };

    // Validate each field defined in the schema
    for (const [key, validator] of Object.entries(this.schema)) {
      const fieldResult = validator.validate(value[key]);
      
      if (fieldResult.valid) {
        // Field passed validation - store the validated value
        result.value[key] = fieldResult.value;
      } else {
        // Field failed validation - mark overall result as invalid and store error
        result.valid = false;
        result.errors[key] = fieldResult.error;
      }
    }

    // Return appropriate result based on whether all fields passed validation
    if (!result.valid) {
      return { valid: false, error: 'Object validation failed', errors: result.errors };
    }

    return { valid: true, value: result.value };
  }
}

/**
 * Array Validator class for validating arrays with item-level validation and length constraints
 * Validates each array item using a specified validator and enforces array length limits
 */
class ArrayValidator extends Validator {
  /**
   * Creates an array validator that validates each item with the provided validator
   * @param {Validator} itemValidator - Validator to apply to each array item
   */
  constructor(itemValidator) {
    super();
    // Validator to apply to each individual array item
    this.itemValidator = itemValidator;
    // Minimum required number of items (null = no minimum)
    this._minItems = null;
    // Maximum allowed number of items (null = no maximum)
    this._maxItems = null;
  }

  /**
   * Sets the minimum required number of array items
   * @param {number} count - Minimum number of items (inclusive)
   * @returns {ArrayValidator} Returns this instance for method chaining
   */
  minItems(count) {
    this._minItems = count;
    return this;
  }

  /**
   * Sets the maximum allowed number of array items
   * @param {number} count - Maximum number of items (inclusive)
   * @returns {ArrayValidator} Returns this instance for method chaining
   */
  maxItems(count) {
    this._maxItems = count;
    return this;
  }

  /**
   * Validates an array by checking length constraints and validating each item
   * @param {any} value - The value to validate (should be an array)
   * @returns {Object} Validation result with item-level error details
   */
  _validate(value) {
    // Ensure the value is actually an array
    if (!Array.isArray(value)) {
      return { 
        valid: false, 
        error: this._customMessage || 'Value must be an array' 
      };
    }

    // Check minimum items constraint if configured
    if (this._minItems !== null && value.length < this._minItems) {
      return { 
        valid: false, 
        error: this._customMessage || `Array must have at least ${this._minItems} items` 
      };
    }

    // Check maximum items constraint if configured
    if (this._maxItems !== null && value.length > this._maxItems) {
      return { 
        valid: false, 
        error: this._customMessage || `Array must have at most ${this._maxItems} items` 
      };
    }

    // Initialize result tracking for item validation
    const result = { valid: true, value: [], errors: [] };

    // Validate each item in the array using the configured item validator
    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i]);
      
      if (itemResult.valid) {
        // Item passed validation - store the validated value
        result.value.push(itemResult.value);
      } else {
        // Item failed validation - mark overall result as invalid and store error with index
        result.valid = false;
        result.errors.push({ index: i, error: itemResult.error });
      }
    }

    // Return appropriate result based on whether all items passed validation
    if (!result.valid) {
      return { valid: false, error: 'Array validation failed', errors: result.errors };
    }

    return { valid: true, value: result.value };
  }
}

/**
 * Schema Builder Class - Main entry point for creating validators
 * Provides static factory methods for creating type-specific validators
 * This is the primary API that users interact with to build validation schemas
 */
class Schema {
  /**
   * Creates a new string validator for validating text values
   * @returns {StringValidator} A new string validator instance
   */
  static string() {
    return new StringValidator();
  }
  
  /**
   * Creates a new number validator for validating numeric values
   * @returns {NumberValidator} A new number validator instance
   */
  static number() {
    return new NumberValidator();
  }
  
  /**
   * Creates a new boolean validator for validating true/false values
   * @returns {BooleanValidator} A new boolean validator instance
   */
  static boolean() {
    return new BooleanValidator();
  }
  
  /**
   * Creates a new date validator for validating date values
   * @returns {DateValidator} A new date validator instance
   */
  static date() {
    return new DateValidator();
  }
  
  /**
   * Creates a new object validator for validating complex objects
   * @param {Object} schema - Map of field names to their respective validators
   * @returns {ObjectValidator} A new object validator instance
   */
  static object(schema) {
    return new ObjectValidator(schema);
  }
  
  /**
   * Creates a new array validator for validating arrays of items
   * @param {Validator} itemValidator - Validator to apply to each array item
   * @returns {ArrayValidator} A new array validator instance
   */
  static array(itemValidator) {
    return new ArrayValidator(itemValidator);
  }
}

// Export for Node.js module system
// This allows the library to be used with require() in Node.js applications
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    Schema,           // Main entry point for creating validators
    Validator,        // Base validator class
    StringValidator,  // String validation class
    NumberValidator,  // Number validation class
    BooleanValidator, // Boolean validation class
    DateValidator,    // Date validation class
    ObjectValidator,  // Object validation class
    ArrayValidator    // Array validation class
  };
}

// Example Usage Section (only runs in browser environment)
// This demonstrates the library usage when loaded directly in HTML
if (typeof require === 'undefined') {
  // Define a complex address validation schema
  const addressSchema = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
    country: Schema.string()
  });

  // Define a comprehensive user validation schema with nested objects and arrays
  const userSchema = Schema.object({
    id: Schema.string().withMessage('ID must be a string'),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    age: Schema.number().optional(),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()),
    address: addressSchema.optional(),
    metadata: Schema.object({}).optional()
  });

  // Sample user data to validate
  const userData = {
    id: "12345",
    name: "John Doe",
    email: "john@example.com",
    isActive: true,
    tags: ["developer", "designer"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      postalCode: "12345",
      country: "USA"
    }
  };

  // Perform validation and log the result
  const result = userSchema.validate(userData);
  console.log('Validation result:', result);
}
