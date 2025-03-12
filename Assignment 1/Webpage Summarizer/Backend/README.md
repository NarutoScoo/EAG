# Webpage Summarizer Backend

A Flask/Dash application providing both a web interface and REST API for AI-powered text summarization.

## Features

- **Web Interface**
  - Interactive model selection
  - Real-time summarization
  - Temperature control
  - Dark mode support

- **REST API**
  - `/api/models` - List available models
  - `/api/generate` - Generate summaries
  - CORS support for cross-origin requests
  - Proper error handling and responses

- **Ollama Integration**
  - Direct model management
  - Multiple model support
  - Configurable parameters
  - Error handling and recovery

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python app.py
   ```

3. Access the interfaces:
   - Web UI: `http://localhost:8050`
   - API: `http://localhost:8050/api`

## API Endpoints

### GET /api/models
Lists available Ollama models.

Response:
```json
{
    "status": "success",
    "models": ["mistral", "llama2", ...]
}
```

### POST /api/generate
Generates a summary using specified model.

Request:
```json
{
    "model": "mistral",
    "prompt": "Text to summarize",
    "temperature": 0.7
}
```

Response:
```json
{
    "status": "success",
    "response": "Generated summary..."
}
```

## Error Handling

- Proper HTTP status codes
- Detailed error messages
- Graceful failure handling
- CORS error prevention

## Recent Updates

### [2024-03-12]
- Enhanced CORS support
- Improved error handling
- Added detailed logging
- Updated documentation 