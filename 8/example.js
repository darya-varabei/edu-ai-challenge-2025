const { Schema } = require('./schema.js');

console.log('🚀 Robust Validation Library Demo\n');

// Example 1: Basic validations
console.log('📝 Example 1: Basic Validations');
console.log('================================');

const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please enter a valid email address');

const ageValidator = Schema.number()
  .min(0)
  .max(150)
  .integer()
  .withMessage('Age must be between 0 and 150');

console.log('✅ Valid email:', emailValidator.validate('user@example.com'));
console.log('❌ Invalid email:', emailValidator.validate('invalid-email'));
console.log('✅ Valid age:', ageValidator.validate(25));
console.log('❌ Invalid age:', ageValidator.validate(-5));

// Example 2: Complex object validation
console.log('\n🏗️ Example 2: Complex Object Validation');
console.log('=========================================');

const addressSchema = Schema.object({
  street: Schema.string().minLength(5).withMessage('Street address is too short'),
  city: Schema.string().minLength(2).withMessage('City name is too short'),
  zipCode: Schema.string().pattern(/^\d{5}$/).withMessage('ZIP code must be 5 digits'),
  country: Schema.string().minLength(2).withMessage('Country name is too short')
});

const userSchema = Schema.object({
  id: Schema.string().withMessage('User ID is required'),
  name: Schema.string().minLength(2).maxLength(100).withMessage('Name must be 2-100 characters'),
  email: emailValidator,
  age: ageValidator.optional(),
  isActive: Schema.boolean().withMessage('Active status must be true or false'),
  tags: Schema.array(Schema.string().minLength(1))
    .minItems(1)
    .maxItems(10)
    .withMessage('Must have 1-10 tags'),
  address: addressSchema.optional(),
  preferences: Schema.object({
    newsletter: Schema.boolean(),
    theme: Schema.string().pattern(/^(light|dark)$/).withMessage('Theme must be light or dark')
  }).optional()
});

// Valid user data
const validUser = {
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

console.log('✅ Valid user validation:');
const validResult = userSchema.validate(validUser);
console.log('Valid:', validResult.valid);
if (validResult.valid) {
  console.log('User name:', validResult.value.name);
  console.log('User email:', validResult.value.email);
}

// Invalid user data
const invalidUser = {
  id: "user456",
  name: "J", // Too short
  email: "invalid-email", // Invalid format
  age: -5, // Invalid age
  isActive: "yes", // Should be boolean
  tags: [], // No tags
  address: {
    street: "123", // Too short
    city: "SF",
    zipCode: "123", // Invalid format
    country: "US"
  }
};

console.log('\n❌ Invalid user validation:');
const invalidResult = userSchema.validate(invalidUser);
console.log('Valid:', invalidResult.valid);
if (!invalidResult.valid) {
  console.log('Errors:', JSON.stringify(invalidResult.errors, null, 2));
}

// Example 3: Array validation
console.log('\n📚 Example 3: Array Validation');
console.log('==============================');

const productSchema = Schema.object({
  id: Schema.number().integer().min(1),
  name: Schema.string().minLength(1),
  price: Schema.number().min(0),
  inStock: Schema.boolean(),
  categories: Schema.array(Schema.string()).minItems(1).maxItems(5)
});

const productsValidator = Schema.array(productSchema).minItems(1);

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 999.99,
    inStock: true,
    categories: ["electronics", "computers"]
  },
  {
    id: 2,
    name: "Coffee Mug",
    price: 15.99,
    inStock: false,
    categories: ["kitchen", "drinkware"]
  }
];

console.log('✅ Valid products:', productsValidator.validate(products).valid);

// Example 4: Date validation
console.log('\n📅 Example 4: Date Validation');
console.log('=============================');

const eventSchema = Schema.object({
  title: Schema.string().minLength(3),
  startDate: Schema.date().after(new Date()).withMessage('Event must be in the future'),
  endDate: Schema.date(),
  isPublic: Schema.boolean()
});

const futureEvent = {
  title: "Conference 2025",
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-06-03'),
  isPublic: true
};

const pastEvent = {
  title: "Old Conference",
  startDate: new Date('2020-01-01'), // In the past
  endDate: new Date('2020-01-03'),
  isPublic: true
};

console.log('✅ Future event validation:', eventSchema.validate(futureEvent).valid);
console.log('❌ Past event validation:', eventSchema.validate(pastEvent));

// Example 5: Optional fields and chaining
console.log('\n🔗 Example 5: Optional Fields and Method Chaining');
console.log('=================================================');

const profileSchema = Schema.object({
  username: Schema.string().minLength(3).maxLength(20),
  email: emailValidator,
  bio: Schema.string().maxLength(500).optional(),
  website: Schema.string().pattern(/^https?:\/\/.+/).optional(),
  socialMedia: Schema.object({
    twitter: Schema.string().optional(),
    linkedin: Schema.string().optional(),
    github: Schema.string().optional()
  }).optional()
});

const minimalProfile = {
  username: "johndoe",
  email: "john@example.com"
};

const fullProfile = {
  username: "janedoe",
  email: "jane@example.com",
  bio: "Software developer passionate about JavaScript and open source.",
  website: "https://janedoe.dev",
  socialMedia: {
    twitter: "@janedoe",
    github: "janedoe"
  }
};

console.log('✅ Minimal profile (optional fields omitted):', profileSchema.validate(minimalProfile).valid);
console.log('✅ Full profile (with optional fields):', profileSchema.validate(fullProfile).valid);

console.log('\n🎉 Demo completed! All examples show the flexibility and power of the validation library.');
console.log('📖 Check README.md for complete documentation and more examples.'); 