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
  - Markdown to HTML conversion
  - Structured logging system
  - Modular code organization

### Browser Extension
- Firefox extension for webpage summarization
- Features include:
  - Context menu integration
  - Enhanced text selection handling:
    - Centered modal dialog for selection options
    - Backdrop blur effect for focus
    - Click-outside dismissal
    - Smooth animations
  - Full page or selection summarization
  - Multiple AI provider support:
    - OpenAI (latest GPT-4 and GPT-3.5 models)
    - Ollama (dynamic model loading)
  - Adaptive UI that matches webpage styles:
    - Inherits fonts, colors, and text styles
    - Matches background and heading styles
    - Maintains visual consistency with the page
  - Interactive summary interface with:
    - Instant keyword extraction and display
    - Keyword highlighting and interaction
    - Resizable side panel
    - Dark mode support
    - Progressive UI updates
  - Robust error handling and fallback behavior
  - HTML-formatted summaries with proper markdown rendering
  - Clean text formatting with preserved line breaks
  - Simplified UI with neutral terminology
  - Dynamic settings management

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

### [2024-03-14]
- Enhanced keyword extraction and display:
  - Immediate keyword display while summary generates
  - Improved keyword frequency analysis
  - Better common word filtering
  - Console logging for keyword debugging
  - Maintained keyword highlighting during summary update
- Previous changes:
  - Added automatic style inheritance
  - Improved visual consistency
  - Added markdown to HTML conversion
  - Enhanced error handling
  - Modular backend structure
  - Dynamic model loading

### Recent Updates

- Enhanced keyword extraction to ensure only terms present in the original text are selected
- Improved fallback mechanism for keyword generation
- Added verbatim keyword matching from source text 