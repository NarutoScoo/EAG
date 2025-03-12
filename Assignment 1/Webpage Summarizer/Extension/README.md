# Webpage Summarizer Extension

A Firefox extension that provides intelligent webpage summarization using both local and AI-powered analysis.

## Features

- Instant basic summarization using keyword frequency analysis
- AI-enhanced summaries using Ollama or OpenAI
- Interactive keyword highlighting
- Dark mode support
- Context menu integration
- Configurable AI providers and models

## Recent Changes

### [2024-03-12]
- Fixed network connectivity issues with Ollama API
- Improved error handling and fallback behavior
- Enhanced UI response with progressive updates
- Added proper keyword extraction from AI responses
- Implemented dual-path API communication (direct and background script)
- Added detailed console logging for debugging

## Setup

1. Install the extension in Firefox
2. Configure your preferred AI provider in the extension settings:
   - For OpenAI: Enter your API key
   - For Ollama: Ensure local Ollama instance is running
3. Access the summarizer through:
   - Context menu (right-click)
   - Page actions menu

## Configuration

### OpenAI Settings
- API Key required
- Supports multiple models (GPT-3.5, GPT-4, etc.)
- Default endpoint: api.openai.com

### Ollama Settings
- No API key required
- Local instance must be running
- Default endpoint: localhost:8050 (through backend server)
- Supports various models (Mistral, Llama2, etc.)

## Usage

1. Navigate to any webpage
2. Right-click and select "Summarize Page" or select text to summarize
3. View the instant basic summary while AI processing occurs
4. Interact with keywords to highlight relevant sections
5. Dark mode automatically adapts to system preferences 