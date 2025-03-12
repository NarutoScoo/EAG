# Webpage Summarizer Project

A comprehensive web page summarization solution consisting of a browser extension and a backend service. This project combines local AI capabilities through Ollama with a user-friendly browser interface for efficient webpage content summarization.

## Project Structure

```
Webpage Summarizer/
├── Backend/           # Flask/Dash backend service
├── Extension/         # Firefox browser extension
└── Test/             # API test interface
```

## Components

### Backend Service
- Flask/Dash application providing both web UI and REST API
- Integrates with Ollama for AI model management
- Features include:
  - Interactive web interface
  - Model selection and management
  - Temperature control for responses
  - REST API endpoints for external access
  - CORS support for cross-origin requests

### Browser Extension
- Firefox extension for webpage summarization
- Features include:
  - Context menu integration
  - Full page or selection summarization
  - Multiple AI provider support (OpenAI, Ollama)
  - Interactive summary interface
  - Dark mode support
  - Configurable settings

### Test Interface
- HTML-based API testing interface
- Allows direct interaction with backend API endpoints
- Useful for development and testing

## Setup

1. Backend Setup
   - Install Python dependencies: `pip install -r Backend/requirements.txt`
   - Start the Flask server: `python Backend/app.py`
   - Server will run on `http://localhost:8050`

2. Extension Setup
   - Load the extension in Firefox
   - Configure preferred AI provider in settings
   - For Ollama: Ensure local instance is running on `http://localhost:11434`

## Development

- Backend API documentation available in Backend/README.md
- Extension development details in Extension/README.md
- Test interface available for API endpoint testing

## Recent Changes

### [2024-03-12]
- feat(api): Improve CORS handling and reduce logging verbosity
  - Simplified CORS configuration
  - Reduced logging output
  - Fixed cross-origin issues
  - Added comprehensive documentation 