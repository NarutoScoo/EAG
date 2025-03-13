# Webpage Summarizer Project

A comprehensive web page summarization solution consisting of a browser extension and a backend service. This project combines local AI capabilities through Ollama with a user-friendly browser interface for efficient webpage content summarization.

## Project Structure

```
Webpage Summarizer/
├── Backend/           # Flask/Dash backend service
│   ├── app.py        # Main application entry point
│   ├── api_routes.py # API endpoint definitions
│   ├── llm_service.py # LLM integration and management
│   └── ui_components.py # Dash UI components
├── Extension/         # Firefox browser extension
└── Test/             # API test interface
```

## Components

### Backend Service
- Modular Flask/Dash application with clean separation of concerns:
  - `app.py`: Application setup and configuration
  - `api_routes.py`: REST API endpoint definitions and handlers
  - `llm_service.py`: LLM integration and response management
  - `ui_components.py`: Dash UI component definitions
- Features include:
  - Interactive web interface
  - Model selection and management
  - Temperature control for responses
  - REST API endpoints for external access
  - CORS support for cross-origin requests
  - Debug logging for development
  - Modular code organization

### Browser Extension
- Firefox extension for webpage summarization
- Features include:
  - Context menu integration
  - Full page or selection summarization
  - Multiple AI provider support (OpenAI, Ollama)
  - Interactive summary interface with keyword highlighting
  - Dark mode support
  - Progressive UI updates with loading indicators
  - Robust error handling and fallback behavior
  - Keyword extraction and interactive highlighting
  - Clean text formatting with preserved line breaks
  - Simplified UI with clear content sections

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

### [2024-03-13]
- refactor(backend): Improved code organization and modularity
  - Split backend into logical modules
  - Added debug logging
  - Improved error handling
  - Better separation of concerns
- fix(extension): Improved UI/UX and error handling
  - Enhanced text display with proper line breaks
  - Removed markdown rendering for simpler text display
  - Improved keyword extraction and highlighting
  - Fixed loading state behavior
  - Enhanced error handling for API responses
  - Updated content security policy
  - Improved response handling from backend
  - Added better console logging for debugging
  - Fixed basic summary fallback behavior 