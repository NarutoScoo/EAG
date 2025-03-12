# Webpage Summarizer Extension

A Firefox browser extension that provides AI-powered webpage summarization with an interactive user interface.

## Features

- **Multiple AI Provider Support**
  - OpenAI integration (requires API key)
  - Local Ollama integration
  - Configurable model selection

- **Summarization Options**
  - Full page summarization
  - Selected text summarization
  - Context menu integration
  - Progressive loading indicators

- **Interactive UI**
  - Keyword highlighting and filtering
  - Dark mode support
  - Responsive modal interface
  - Interactive keyword tags
  - Frequency-based keyword extraction

- **Error Handling**
  - Robust API error handling
  - Fallback to basic summarization
  - Multiple API endpoint attempts
  - Detailed error messages

- **Development Features**
  - Keyword frequency debugging
  - Essential error logging
  - Clean console output
  - Dual-path API communication

## Installation

1. Load the extension in Firefox:
   - Open Firefox
   - Navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from the extension directory

2. Configure the extension:
   - Click the extension icon
   - Open settings
   - Choose AI provider (OpenAI or Ollama)
   - Configure API settings:
     - For OpenAI: Enter API key
     - For Ollama: Verify localhost:11434 is accessible

## Usage

1. **Basic Usage**
   - Right-click on any webpage
   - Select "Summarize Page"
   - Wait for AI-enhanced summary

2. **Text Selection**
   - Select specific text
   - Right-click selection
   - Choose summarization option
   - View targeted summary

3. **Keyword Interaction**
   - Click keywords to highlight in summary
   - Click again to remove highlighting
   - Keywords are sorted by frequency

4. **Error Recovery**
   - Automatic fallback to basic summary
   - Clear error messages
   - Retry mechanisms for API failures

## Recent Updates

### [2024-03-12]
- Fixed AI summary display issues
- Enhanced loading state behavior
- Improved keyword extraction and display
- Streamlined console logging
- Added keyword frequency debugging
- Fixed basic summary fallback
- Enhanced error handling
- Updated documentation

## Development

- Extension uses Firefox WebExtensions API
- Modular code structure
- Event-driven architecture
- Progressive enhancement approach

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