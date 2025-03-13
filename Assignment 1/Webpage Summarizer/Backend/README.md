# Webpage Summarizer Backend

Flask/Dash application providing both a web interface and REST API for AI-powered text summarization.

## Structure

```
Backend/
├── app.py           # Main application entry point
├── api_routes.py    # API endpoint definitions
├── llm_service.py   # LLM integration and management
├── ui_components.py # Dash UI components
└── requirements.txt # Python dependencies
```

## Components

### app.py
- Main application configuration
- Server setup and CORS handling
- Dash initialization
- Debug logging configuration
- Route registration

### api_routes.py
- REST API endpoint definitions
- Request validation
- Response formatting
- Error handling
- CORS configuration

### llm_service.py
- LLM integration and management
- Model handling
- Response generation
- Error handling
- Debug logging

### ui_components.py
- Dash UI component definitions
- Layout creation
- Callback handling
- Style definitions
- Interactive elements

## Features

- Interactive web interface for direct use
- REST API for external integration
- Support for multiple LLM models
- Temperature control for responses
- Debug logging for development
- CORS support for cross-origin requests
- Error handling and validation
- Clean separation of concerns

## API Endpoints

- POST `/api/generate`
  - Generate summary using specified model
  - Parameters:
    - model: LLM model to use
    - prompt: Text to summarize
    - temperature: Response randomness

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python app.py
   ```

3. Access:
   - Web UI: http://localhost:8050
   - API: http://localhost:8050/api/generate

## Development

- Set logging level in app.py for debugging
- Add new routes in api_routes.py
- Extend LLM functionality in llm_service.py
- Modify UI components in ui_components.py

## Recent Changes

### [2024-03-13]
- Modular code organization
  - Split functionality into logical modules
  - Better separation of concerns
  - Improved maintainability
- Enhanced logging
  - Added debug logging
  - Better error tracking
  - Improved development experience
- Improved error handling
  - Better validation
  - Clearer error messages
  - Robust API responses 