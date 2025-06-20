# Audio Transcription and Analysis Console Application

A Node.js console application that transcribes audio files using OpenAI's Whisper API, generates summaries using GPT-4.1-mini, and extracts detailed analytics including word count, speaking speed, and frequently mentioned topics.

## Features

- **Audio Transcription**: Uses OpenAI's Whisper-1 model for accurate speech-to-text conversion
- **Content Summarization**: Generates concise summaries using GPT-4.1-mini
- **Analytics Extraction**: Provides detailed statistics including:
  - Total word count
  - Speaking speed (words per minute)
  - Frequently mentioned topics with mention counts
- **File Output**: Automatically saves transcription, summary, and analysis to separate files
- **Console Display**: Shows results directly in the terminal

## Prerequisites

- Node.js (version 14 or higher)
- OpenAI API key with access to Whisper-1 and GPT-4.1-mini models
- Audio file in a supported format (MP3, MP4, M4A, WAV, etc.)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add your OpenAI API key:
   ```bash
   echo "OPENAI_API_KEY=your_actual_api_key_here" > .env
   ```
   
   **Important**: Replace `your_actual_api_key_here` with your real OpenAI API key. You can get one from https://platform.openai.com/account/api-keys

## Usage

### Basic Usage

Run the application with an audio file:

```bash
node index.js <path-to-audio-file>
```

### Examples

```bash
# Process an MP3 file
node index.js audio.mp3

# Process an audio file in a subdirectory
node index.js ./audio/meeting-recording.m4a

# Process an audio file with spaces in the name
node index.js "my audio file.wav"
```

### Testing with the provided audio file

The repository includes a sample audio file `CAR0004.mp3`. To test the application:

1. Make sure you have set up your `.env` file with a valid OpenAI API key
2. Run the application:
   ```bash
   node index.js CAR0004.mp3
   ```

### Output

The application will:

1. **Transcribe** the audio using Whisper-1
2. **Generate** a summary using GPT-4.1-mini
3. **Analyze** the content for statistics
4. **Save** three files with timestamps:
   - `transcription_<filename>_<timestamp>.md` - Full transcription
   - `summary_<filename>_<timestamp>.md` - Content summary
   - `analysis_<filename>_<timestamp>.json` - Analytics data
5. **Display** summary and analytics in the console

### Console Output Example

```
Processing audio file: meeting.mp3

Transcribing audio file...
✓ Transcription completed

Generating summary...
✓ Summary generated

Analyzing transcription...
✓ Analysis completed

✓ Files saved:
  - Transcription: transcription_meeting.mp3_2024-01-15T10-30-45-123Z.md
  - Summary: summary_meeting.mp3_2024-01-15T10-30-45-123Z.md
  - Analysis: analysis_meeting.mp3_2024-01-15T10-30-45-123Z.json

=== SUMMARY ===
[Generated summary text here]

=== ANALYTICS ===
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ]
}
```

## Supported Audio Formats

- MP3
- MP4
- M4A
- WAV
- FLAC
- And other formats supported by OpenAI Whisper API

## File Structure

```
project/
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create this)
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── CAR0004.mp3          # Sample audio file for testing
├── transcription.md     # Sample transcription output
├── summary.md           # Sample summary output
├── analysis.json        # Sample analysis output
└── [output files]       # Generated transcription, summary, and analysis files
```

## Error Handling

The application includes comprehensive error handling for:
- Missing audio file
- Invalid file paths
- OpenAI API errors
- Network connectivity issues
- File system errors

## Troubleshooting

### Common Issues

1. **"File not found" error**
   - Ensure the audio file path is correct
   - Use absolute paths if needed

2. **OpenAI API errors**
   - Verify your API key is correct
   - Ensure you have sufficient API credits
   - Check that your account has access to Whisper-1 and GPT-4.1-mini models

3. **Permission errors**
   - Ensure you have write permissions in the current directory

### Getting Help

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your OpenAI API key and account status
3. Ensure the audio file is in a supported format

## API Requirements

- **Whisper-1**: For audio transcription
- **GPT-4.1-mini**: For summary generation and content analysis

## License

This project is open source and available under the MIT License. 