# Webpage Summarizer Backend

A Flask-based backend service that provides a web interface and REST API endpoints for interacting with the Ollama API. The application is built using Dash and includes features for model selection, query submission, and response generation.

## Features

- Web interface with dark/light mode toggle
- Model selection with refresh capability
- Temperature control for response generation
- Keyboard shortcuts for query submission
- REST API endpoints for external applications
- CORS support for cross-origin requests

## API Endpoints

### GET /api/models
Returns a list of available Ollama models.

### POST /api/generate
Generates a response using the specified model and prompt.

Required parameters:
- model: The name of the Ollama model to use
- prompt: The input text to generate from
- temperature (optional): Controls randomness in the response (0.0 to 1.0, default: 0.7)

## Dependencies

- dash
- dash-mantine-components
- dash-iconify
- requests
- flask-cors
- markdown2

## Changelog

### [2024-03-12]
- feat(api): Improve CORS handling and reduce logging verbosity
  - Simplified CORS configuration by using Flask-CORS with global settings
  - Added CORS headers to all responses via after_request handler
  - Changed logging level from INFO to WARNING to reduce console output
  - Restructured Flask app initialization for better CORS support
  - Fixed cross-origin issues for API endpoints 