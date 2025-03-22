# Meaning Getter Backend

Local Ollama-powered backend server for the Meaning Getter extension.

## Features
- Local Ollama integration for word definitions
- Built-in fallback to Dictionary API
- RESTful API endpoint
- Comprehensive logging
- Error handling and validation

## Prerequisites
1. Install Ollama from https://ollama.ai/
2. Pull the Mistral model:
   ```bash
   ollama pull mistral
   ```

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Ensure Ollama is running:
   ```bash
   ollama serve
   ```

3. Start the server:
   ```bash
   python app.py
   ```

## API Endpoints

### GET /api/meaning/<word>
Returns word definition using the following flow:
1. Attempts definition using local Ollama model
2. Falls back to Dictionary API if Ollama fails
3. Returns error if both sources fail

#### Response Format
Success:
```json
{
    "word": "example",
    "meanings": [{
        "partOfSpeech": "definition",
        "definitions": [{
            "definition": "Ollama or API response"
        }]
    }]
}
```

Error:
```json
{
    "error": "Error type",
    "message": "Error details"
}
```

## Configuration
- Server runs on port 8050
- Uses Ollama's Mistral model (default)
- Ollama runs on localhost:11434
- Comprehensive logging enabled

## Dependencies
- dash==2.14.2
- flask==3.0.2
- requests==2.31.0

## Debugging
- Check logs for detailed information about:
  - Incoming requests
  - Ollama model responses
  - API fallback attempts
  - Error messages and stack traces
- Logs include timestamps and severity levels 