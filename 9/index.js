require('dotenv').config();
const OpenAI = require('openai');
const readline = require('readline');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create readline interface for user input with better error handling
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Known services database for enhanced analysis
const knownServices = {
  'spotify': 'Spotify is a Swedish audio streaming and media services provider founded in 2006. It offers music, podcasts, and video streaming services with both free and premium subscription tiers.',
  'notion': 'Notion is an all-in-one workspace application that combines note-taking, task management, database functionality, and collaboration tools. Founded in 2016, it serves individuals and teams.',
  'netflix': 'Netflix is an American streaming entertainment service founded in 1997, originally as a DVD-by-mail service, later pivoting to streaming video content including original productions.',
  'slack': 'Slack is a business communication platform founded in 2009 that offers chat rooms organized by topic, private groups, and direct messaging for teams and organizations.',
  'zoom': 'Zoom is a video communications company founded in 2011 that provides video conferencing, online meetings, chat, and mobile collaboration services.',
  'discord': 'Discord is a VoIP and instant messaging social platform founded in 2015, originally designed for gaming communities but now used for various group communications.',
  'figma': 'Figma is a collaborative web-based design tool founded in 2012 that allows teams to create, prototype, and collaborate on user interface designs in real-time.',
  'github': 'GitHub is a web-based version control and collaboration platform for software developers founded in 2008, acquired by Microsoft in 2018.'
};

async function generateServiceReport(serviceInput, isKnownService = false) {
  try {
    console.log('\n🔄 Analyzing service and generating comprehensive report...\n');

    let contextInfo = serviceInput;
    if (isKnownService) {
      contextInfo = knownServices[serviceInput.toLowerCase()] || serviceInput;
    }

    const prompt = `
You are a business analyst tasked with creating a comprehensive analysis report. Based on the following service information, generate a detailed markdown report with the exact sections listed below.

Service Information: "${contextInfo}"

Please create a professional analysis report in markdown format with these EXACT sections (use these headings exactly):

# Service Analysis Report

## Brief History
Provide founding year, key milestones, major pivots, and important company developments.

## Target Audience
Identify and describe the primary user segments, demographics, and use cases.

## Core Features
List and explain the top 2-4 key functionalities that define this service.

## Unique Selling Points
Highlight the key differentiators that set this service apart from competitors.

## Business Model
Explain how the service generates revenue (subscription, freemium, advertising, etc.).

## Tech Stack Insights
Provide insights about the technologies, platforms, or technical approaches likely used.

## Perceived Strengths
List the main advantages, positive aspects, and standout features users appreciate.

## Perceived Weaknesses
Identify potential drawbacks, limitations, or areas for improvement that users might cite.

---

Important guidelines:
- Be specific and detailed in each section
- Use bullet points where appropriate for readability
- Base analysis on factual information when possible
- For unknown services, make reasonable inferences based on the description
- Keep the tone professional and analytical
- Ensure each section has substantial content (not just 1-2 sentences)
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
    return null;
  }
}

function saveReportToFile(report, serviceName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `report_${serviceName.replace(/\s+/g, '_')}_${timestamp}.md`;
  
  try {
    fs.writeFileSync(filename, report);
    console.log(`\n💾 Report saved to: ${filename}`);
  } catch (error) {
    console.error('❌ Error saving file:', error.message);
  }
}

function displayWelcome() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    SERVICE ANALYZER                          ║
║              Comprehensive Business Analysis Tool            ║
╚══════════════════════════════════════════════════════════════╝

This tool generates detailed markdown reports analyzing services from
multiple perspectives: business, technical, and user-focused.

📋 You can provide:
   • A known service name (e.g., "Spotify", "Notion", "Netflix")
   • A detailed service description or "About Us" text

🎯 The report will include:
   • Brief History & Milestones
   • Target Audience Analysis  
   • Core Features Overview
   • Unique Selling Points
   • Business Model Analysis
   • Tech Stack Insights
   • Strengths & Weaknesses Assessment
`);
}

function askForInput() {
  return new Promise((resolve, reject) => {
    if (rl.closed) {
      reject(new Error('readline interface is closed'));
      return;
    }
    
    rl.question('\n📝 Enter service name or description (or "quit" to exit): ', (input) => {
      resolve(input.trim());
    });
  });
}

function askToSaveReport() {
  return new Promise((resolve, reject) => {
    if (rl.closed) {
      resolve(false);
      return;
    }
    
    rl.question('\n💾 Save report to file? (y/n): ', (answer) => {
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

async function main() {
  displayWelcome();

  while (true) {
    try {
      const userInput = await askForInput();
      
      if (userInput.toLowerCase() === 'quit' || userInput.toLowerCase() === 'exit') {
        console.log('\n👋 Thank you for using Service Analyzer!');
        break;
      }

      if (!userInput) {
        console.log('⚠️  Please enter a service name or description.');
        continue;
      }

      // Check if it's a known service
      const isKnownService = knownServices.hasOwnProperty(userInput.toLowerCase());
      if (isKnownService) {
        console.log(`✅ Recognized service: ${userInput}`);
      }

      // Generate the report
      const report = await generateServiceReport(userInput, isKnownService);
      
      if (report) {
        console.log('\n' + '='.repeat(80));
        console.log(report);
        console.log('='.repeat(80));

        // Ask if user wants to save the report
        const shouldSave = await askToSaveReport();
        if (shouldSave) {
          saveReportToFile(report, userInput);
        }
      } else {
        console.log('❌ Failed to generate report. Please try again.');
      }

      console.log('\n' + '-'.repeat(60));
    } catch (error) {
      if (error.message.includes('readline')) {
        console.log('\n👋 Goodbye!');
        break;
      }
      console.error('❌ An error occurred:', error.message);
    }
  }

  rl.close();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Handle readline errors
rl.on('error', (error) => {
  console.error('❌ Readline error:', error.message);
});

// Start the application
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Application error:', error.message);
    process.exit(1);
  });
}

module.exports = { generateServiceReport, knownServices }; 