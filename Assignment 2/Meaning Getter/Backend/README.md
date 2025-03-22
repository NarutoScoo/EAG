# Meaning Getter Backend

Local LLM-powered backend server for the Meaning Getter extension.

## Features
- Local LLM (flan-t5-small) for word definitions
- Singleton pattern for LLM to prevent multiple model loads
- Built-in fallback to Dictionary API
- RESTful API endpoint
- Error handling and validation

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python app.py
   ```

## API Endpoints

### GET /api/meaning/<word>
Returns word definition using the following flow:
1. Attempts definition using local LLM
2. Falls back to Dictionary API if LLM fails
3. Returns error if both sources fail

#### Response Format
Success:
```json
{
    "word": "example",
    "meanings": [{
        "partOfSpeech": "definition",
        "definitions": [{
            "definition": "LLM or API response"
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
- Uses google/flan-t5-small model (loaded once at startup)
- Maximum response length: 200 tokens
- Thread-safe LLM instance

## Dependencies
- dash==2.14.2
- flask==3.0.2
- requests==2.31.0
- transformers==4.37.2
- torch==2.2.0

## Performance Optimizations
- Single LLM instance shared across requests
- Thread-safe model access
- Graceful fallback to Dictionary API 