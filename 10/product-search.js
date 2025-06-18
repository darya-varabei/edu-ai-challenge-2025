import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load products dataset
function loadProducts() {
  try {
    const data = fs.readFileSync('products.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading products.json:', error.message);
    process.exit(1);
  }
}

// Function schema for OpenAI function calling
const filterProductsFunction = {
  name: "filter_products",
  description: "Filter products based on user preferences including category, price range, rating, and stock availability",
  parameters: {
    type: "object",
    properties: {
      categories: {
        type: "array",
        items: {
          type: "string",
          enum: ["Electronics", "Fitness", "Kitchen", "Books", "Clothing"]
        },
        description: "Product categories to include in the search"
      },
      max_price: {
        type: "number",
        description: "Maximum price limit for products"
      },
      min_price: {
        type: "number",
        description: "Minimum price limit for products"
      },
      min_rating: {
        type: "number",
        description: "Minimum rating requirement (0-5 scale)"
      },
      in_stock_only: {
        type: "boolean",
        description: "Whether to include only products that are in stock"
      },
      keywords: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Keywords to search for in product names"
      }
    },
    required: []
  }
};

// Extract filtering criteria using OpenAI function calling
async function extractFilterCriteria(userInput) {
  try {
    console.log('🤖 Analyzing your request...');
    
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that extracts product filtering criteria from natural language. Analyze the user's request and determine what filtering parameters they want to apply."
      },
      {
        role: "user",
        content: userInput
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
      functions: [filterProductsFunction],
      function_call: { name: "filter_products" }
    });

    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.name === "filter_products") {
      return JSON.parse(functionCall.arguments);
    }
    
    throw new Error("Failed to extract filter criteria");
  } catch (error) {
    console.error('❌ Error extracting filter criteria:', error.message);
    throw error;
  }
}

// Apply filters to products based on extracted criteria
function applyFilters(products, criteria) {
  let filteredProducts = [...products];

  // Filter by categories
  if (criteria.categories && criteria.categories.length > 0) {
    filteredProducts = filteredProducts.filter(product => 
      criteria.categories.includes(product.category)
    );
  }

  // Filter by price range
  if (criteria.max_price !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.price <= criteria.max_price
    );
  }

  if (criteria.min_price !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.price >= criteria.min_price
    );
  }

  // Filter by minimum rating
  if (criteria.min_rating !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.rating >= criteria.min_rating
    );
  }

  // Filter by stock availability
  if (criteria.in_stock_only) {
    filteredProducts = filteredProducts.filter(product => 
      product.in_stock === true
    );
  }

  // Filter by keywords (search in name only, since description doesn't exist)
  if (criteria.keywords && criteria.keywords.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      const searchText = product.name.toLowerCase();
      return criteria.keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    });
  }

  return filteredProducts;
}

// Format and display filtered products
function displayResults(products, criteria) {
  console.log('\n' + '='.repeat(50));
  console.log('🔍 SEARCH RESULTS');
  console.log('='.repeat(50));
  
  if (criteria) {
    console.log('📋 Applied Filters:');
    if (criteria.categories) console.log(`   Categories: ${criteria.categories.join(', ')}`);
    if (criteria.max_price) console.log(`   Max Price: $${criteria.max_price}`);
    if (criteria.min_price) console.log(`   Min Price: $${criteria.min_price}`);
    if (criteria.min_rating) console.log(`   Min Rating: ${criteria.min_rating}⭐`);
    if (criteria.in_stock_only) console.log(`   In Stock Only: Yes`);
    if (criteria.keywords) console.log(`   Keywords: ${criteria.keywords.join(', ')}`);
    console.log();
  }

  if (products.length === 0) {
    console.log('❌ No products found matching your criteria.');
    return;
  }

  console.log(`✅ Found ${products.length} product(s):\n`);
  
  products.forEach((product, index) => {
    const stockStatus = product.in_stock ? '✅ In Stock' : '❌ Out of Stock';
    const stars = '⭐'.repeat(Math.floor(product.rating));
    
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   💰 Price: $${product.price}`);
    console.log(`   ${stars} Rating: ${product.rating}/5`);
    console.log(`   📦 ${stockStatus}`);
    console.log(`   📂 Category: ${product.category}`);
    console.log();
  });
}

// Main search function
async function searchProducts(userInput) {
  try {
    const products = loadProducts();
    
    // Extract filter criteria using OpenAI function calling
    const criteria = await extractFilterCriteria(userInput);
    
    console.log('✅ Understanding your preferences...');
    
    // Apply filters to products
    const filteredProducts = applyFilters(products, criteria);
    
    // Display results
    displayResults(filteredProducts, criteria);
    
    return filteredProducts;
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    throw error;
  }
}

// Console interface
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Main application loop
async function main() {
  console.log('🛍️  Welcome to AI Product Search!');
  console.log('Type your search request in natural language, or "quit" to exit.\n');
  
  // Test API connection
  try {
    console.log('🔍 Testing OpenAI API connection...');
    await openai.models.list();
    console.log('✅ API connection successful!\n');
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    console.log('Please check your OPENAI_API_KEY in .env file\n');
    return;
  }

  const rl = createInterface();
  
  while (true) {
    try {
      const userInput = await new Promise((resolve) => {
        rl.question('🔍 What are you looking for? ', resolve);
      });
      
      if (userInput.toLowerCase().trim() === 'quit') {
        console.log('👋 Goodbye!');
        break;
      }
      
      if (userInput.trim() === '') {
        console.log('Please enter a search request.\n');
        continue;
      }
      
      await searchProducts(userInput);
      console.log('─'.repeat(50) + '\n');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('Please try again.\n');
    }
  }
  
  rl.close();
}

// Export functions for testing
export {
  searchProducts,
  loadProducts,
  extractFilterCriteria,
  applyFilters
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 