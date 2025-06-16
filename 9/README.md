# Service Analyzer - Comprehensive Business Analysis Tool

A lightweight console application that generates detailed, markdown-formatted analysis reports for digital services and products. The tool provides multi-perspective insights including business, technical, and user-focused analysis using OpenAI's GPT models.

## 🎯 Features

- **Dual Input Support**: Accept either known service names or detailed service descriptions
- **Comprehensive Analysis**: Generate reports with 8 key sections covering all business aspects
- **Interactive Console Interface**: User-friendly command-line experience
- **File Export**: Save generated reports as markdown files with timestamps
- **Known Services Database**: Enhanced analysis for popular services like Spotify, Notion, Netflix, etc.
- **Professional Formatting**: Clean, structured markdown output suitable for presentations

## 📋 Report Sections

Each generated report includes these comprehensive sections:

1. **Brief History** - Founding details, milestones, and key developments
2. **Target Audience** - Primary user segments and demographics
3. **Core Features** - Top 2-4 key functionalities
4. **Unique Selling Points** - Key differentiators from competitors
5. **Business Model** - Revenue generation strategies
6. **Tech Stack Insights** - Technology and platform analysis
7. **Perceived Strengths** - Advantages and standout features
8. **Perceived Weaknesses** - Limitations and improvement areas

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- OpenAI API key

### Installation

1. **Clone or download the project files**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your OpenAI API key:**
   
   Create a `.env` file in the project root:
   ```bash
   touch .env
   ```
   
   Add your API key to the `.env` file:
   ```env
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```
   
   **Important**: Replace `your_actual_openai_api_key_here` with your real OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Running the Application

Start the Service Analyzer:
```bash
npm start
```

Or run directly with Node.js:
```bash
node index.js
```

## 💡 Usage Guide

### Input Options

**Option 1: Known Service Names**
Simply enter popular service names that the system recognizes:
```
📝 Enter service name or description: Spotify
📝 Enter service name or description: Notion
📝 Enter service name or description: Netflix
```

**Option 2: Custom Service Descriptions**
Provide detailed descriptions or "About Us" text:
```
📝 Enter service name or description: A cloud-based project management tool that helps teams collaborate on tasks, track progress, and manage deadlines with Kanban boards and Gantt charts.
```

### Interactive Features

- **Continuous Operation**: Analyze multiple services in one session
- **File Saving**: Choose to save reports as markdown files
- **Graceful Exit**: Type "quit" or "exit" to close the application
- **Error Handling**: Robust error handling with helpful messages

### Sample Session

```
╔══════════════════════════════════════════════════════════════╗
║                    SERVICE ANALYZER                          ║
║              Comprehensive Business Analysis Tool            ║
╚══════════════════════════════════════════════════════════════╝

📝 Enter service name or description (or "quit" to exit): Spotify
✅ Recognized service: Spotify

🔄 Analyzing service and generating comprehensive report...

================================================================================
# Service Analysis Report

## Brief History
Spotify was founded in 2006 by Daniel Ek and Martin Lorentzon in Stockholm, Sweden...

[Full report content displayed]
================================================================================

💾 Save report to file? (y/n): y
💾 Report saved to: report_Spotify_2024-01-15T10-30-45-123Z.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

### Known Services

The application includes enhanced analysis for these popular services:
- Spotify
- Notion  
- Netflix
- Slack
- Zoom
- Discord
- Figma
- GitHub

## 📁 Project Structure

```
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Dependency lock file
├── .env                      # Environment variables (create this)
├── .gitignore               # Git ignore rules
├── index.js                 # Main application code
├── README.md                # This documentation
├── sample_outputs.md        # Sample report outputs
└── node_modules/            # Dependencies (auto-generated)
```

## 🛠️ Technical Details

### Dependencies

- **openai**: Official OpenAI API client
- **dotenv**: Environment variable management
- **readline**: Built-in Node.js module for console input
- **fs**: Built-in Node.js module for file operations

### API Usage

- **Model**: GPT-4o-mini for optimal balance of quality and speed
- **Temperature**: 0.7 for creative yet focused analysis
- **Max Tokens**: 2000 to ensure comprehensive reports

## 🔍 Troubleshooting

### Common Issues

**API Key Error**
```
❌ Error generating report: Invalid API key
```
- Verify your `.env` file exists and contains a valid OpenAI API key
- Ensure no extra spaces or quotes around the API key

**Network Issues**
```
❌ Error generating report: Network error
```
- Check your internet connection
- Verify OpenAI service status at [status.openai.com](https://status.openai.com)

**Empty Input**
```
⚠️ Please enter a service name or description.
```
- Provide either a service name or detailed description
- Avoid empty inputs

### Getting Help

If you encounter issues:
1. Check that all dependencies are installed: `npm install`
2. Verify your API key is correctly set in the `.env` file
3. Ensure you have a stable internet connection
4. Try with a simple known service name first (e.g., "Spotify")

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 🤝 Contributing

Feel free to submit issues, feature requests, or improvements to enhance the Service Analyzer tool. 