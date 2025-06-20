# AI Product Search Application

An intelligent product search tool that uses OpenAI's GPT-4.1-mini with function calling to understand natural language queries and filter products from a dataset.

## Features

- 🛍️ **AI-Powered Search**: Natural language product search with OpenAI function calling
- 🏷️ **Smart Filtering**: Category, price, rating, and stock-based filtering
- 🧠 **Natural Language**: Express search needs in plain English
- 🛠️ **Easy Setup**: Simple configuration with environment variables

## Prerequisites

- Node.js 18.0.0 or higher
- OpenAI API key with access to GPT-4.1-mini and Whisper-1

## Setup

1. **Clone or download this project**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

4. **Run the application:**
   ```bash
   npm start
   ```
   
   Or alternatively:
   ```bash
   npm run search
   ```

## Usage

The product search tool uses OpenAI's function calling to understand natural language queries and filter products from a JSON dataset.

**Start the application:**
```bash
npm start
```

**Example searches:**
- "I need a smartphone under $800 with a great camera"
- "Show me fitness equipment under $50 that's in stock"
- "Find electronics with rating above 4.5"
- "I want kitchen appliances for baking"
- "Show me programming books under $30"

**Search Features:**
- 🏷️ **Category filtering**: Electronics, Fitness, Kitchen, Books, Clothing
- 💰 **Price range**: Set minimum and maximum price limits
- ⭐ **Rating filter**: Minimum rating requirements
- 📦 **Stock status**: Filter for in-stock items only
- 🔍 **Keyword search**: Search in product names and descriptions
- 🧠 **Natural language**: Express your needs in plain English





## File Structure

```
ai-product-search/
├── package.json          # Dependencies and scripts
├── product-search.js    # Main AI Product Search application
├── products.json        # Product dataset for search
├── .env.example         # Environment variables template
├── .env                 # Your actual environment variables (create this)
├── README.md           # This documentation
└── sample_outputs.md   # Example search outputs
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `GPT_MODEL` | GPT model to use | `gpt-4.1-mini` |
| `WHISPER_MODEL` | Whisper model to use | `whisper-1` |

## API Models Used

- **GPT-4.1-mini**: For text generation, chat completions, and function calling
- **Whisper-1**: For speech-to-text transcription

## Product Search Tool Details

The AI Product Search application (`product-search.js`) demonstrates advanced OpenAI API usage:

### How It Works
1. **Natural Language Processing**: User inputs their requirements in plain English
2. **Function Calling**: OpenAI extracts structured filtering criteria using function calling
3. **Product Filtering**: The extracted criteria are applied to the products dataset
4. **Formatted Results**: Matching products are displayed with detailed information

### OpenAI Function Calling Schema
The application defines a `filter_products` function schema that extracts:
- Product categories
- Price ranges (min/max)
- Rating requirements
- Stock availability preferences  
- Keywords for text search

### Dataset
The `products.json` file contains 20 sample products across 5 categories:
- Electronics (smartphones, laptops, headphones, etc.)
- Fitness (yoga mats, dumbbells, resistance bands, etc.)
- Kitchen (air fryer, coffee maker, knife set, etc.)
- Books (novels, programming guides, cookbooks, etc.)
- Clothing (jeans, jackets, t-shirts, boots, etc.)

## Error Handling

The application includes comprehensive error handling for:
- Missing API keys
- Invalid audio files
- API connection issues
- Rate limiting

## Development

To extend this application:

1. Add new functions to `index.js`
2. Import and use the exported functions in your own modules
3. Modify the examples in the `runExamples()` function

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY not found"**
   - Make sure you created a `.env` file from `.env.example`
   - Verify your API key is correctly set in the `.env` file

2. **"API connection failed"**
   - Check your internet connection
   - Verify your API key is valid and has sufficient credits
   - Ensure your API key has access to the required models

3. **"Audio file not found"**
   - Make sure the audio file path is correct
   - Verify the file exists and is in a supported format

## License

MIT License - feel free to use this code in your own projects! 