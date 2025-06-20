import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to transcribe audio using Whisper API
async function transcribeAudio(audioFilePath) {
  try {
    console.log('Transcribing audio file...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-1',
    });
    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error.message);
    throw error;
  }
}

// Function to generate summary using GPT-4.1-mini
async function generateSummary(transcription) {
  try {
    console.log('Generating summary...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise summaries of transcribed audio content.'
        },
        {
          role: 'user',
          content: `Please provide a clear and concise summary of the following transcription:\n\n${transcription}`
        }
      ],
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw error;
  }
}

// Function to analyze transcription and extract statistics
async function analyzeTranscription(transcription) {
  try {
    console.log('Analyzing transcription...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that analyzes transcribed audio and extracts specific statistics. Return only a valid JSON object with the following structure: {"word_count": number, "speaking_speed_wpm": number, "frequently_mentioned_topics": [{"topic": string, "mentions": number}]}. Estimate speaking speed based on typical speaking patterns (120-150 WPM is average). Identify the top 3+ most frequently mentioned topics or themes.'
        },
        {
          role: 'user',
          content: `Analyze this transcription and extract statistics:\n\n${transcription}`
        }
      ],
      temperature: 0.3,
    });
    
    const analysisText = completion.choices[0].message.content;
    return JSON.parse(analysisText);
  } catch (error) {
    console.error('Error analyzing transcription:', error.message);
    throw error;
  }
}

// Function to save transcription to file
function saveTranscription(transcription, audioFileName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `transcription_${audioFileName}_${timestamp}.md`;
  const filePath = path.join(process.cwd(), fileName);
  
  const content = `# Audio Transcription

**File:** ${audioFileName}
**Date:** ${new Date().toLocaleString()}

## Transcription

${transcription}
`;

  fs.writeFileSync(filePath, content);
  return fileName;
}

// Function to save summary to file
function saveSummary(summary, audioFileName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `summary_${audioFileName}_${timestamp}.md`;
  const filePath = path.join(process.cwd(), fileName);
  
  const content = `# Audio Summary

**File:** ${audioFileName}
**Date:** ${new Date().toLocaleString()}

## Summary

${summary}
`;

  fs.writeFileSync(filePath, content);
  return fileName;
}

// Function to save analysis to file
function saveAnalysis(analysis, audioFileName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `analysis_${audioFileName}_${timestamp}.json`;
  const filePath = path.join(process.cwd(), fileName);
  
  const content = JSON.stringify(analysis, null, 2);
  fs.writeFileSync(filePath, content);
  return fileName;
}

// Main function
async function main() {
  try {
    // Get audio file path from command line arguments
    const audioFilePath = process.argv[2];
    
    if (!audioFilePath) {
      console.error('Usage: node index.js <audio-file-path>');
      console.error('Example: node index.js audio.mp3');
      process.exit(1);
    }

    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      console.error(`Error: File '${audioFilePath}' not found.`);
      process.exit(1);
    }

    const audioFileName = path.basename(audioFilePath);
    console.log(`Processing audio file: ${audioFileName}\n`);

    // Step 1: Transcribe audio
    const transcription = await transcribeAudio(audioFilePath);
    console.log('✓ Transcription completed\n');

    // Step 2: Generate summary
    const summary = await generateSummary(transcription);
    console.log('✓ Summary generated\n');

    // Step 3: Analyze transcription
    const analysis = await analyzeTranscription(transcription);
    console.log('✓ Analysis completed\n');

    // Step 4: Save files
    const transcriptionFile = saveTranscription(transcription, audioFileName);
    const summaryFile = saveSummary(summary, audioFileName);
    const analysisFile = saveAnalysis(analysis, audioFileName);

    console.log('✓ Files saved:');
    console.log(`  - Transcription: ${transcriptionFile}`);
    console.log(`  - Summary: ${summaryFile}`);
    console.log(`  - Analysis: ${analysisFile}\n`);

    // Step 5: Display results
    console.log('=== SUMMARY ===');
    console.log(summary);
    console.log('\n=== ANALYTICS ===');
    console.log(JSON.stringify(analysis, null, 2));

  } catch (error) {
    console.error('Application error:', error.message);
    process.exit(1);
  }
}

// Run the application
main(); 