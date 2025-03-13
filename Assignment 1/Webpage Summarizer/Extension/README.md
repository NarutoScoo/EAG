# Webpage Summarizer Extension

A Firefox browser extension that provides AI-powered webpage summarization with support for both OpenAI and Ollama models.

## Features

- Context menu integration for easy access
- Support for both full page and selected text summarization
- Multiple AI provider support:
  - OpenAI (GPT-3.5, GPT-4)
  - Ollama (local models)
- Interactive summary interface:
  - Keyword highlighting and filtering
  - Dark mode support
  - Clean text formatting
  - Preserved line breaks
  - Progressive loading states
- Robust error handling:
  - Fallback to basic summarization
  - Clear error messages
  - Network error recovery
- Configurable settings:
  - Model selection
  - API configuration
  - Temperature control

## Installation

1. Load the extension in Firefox:
   - Open Firefox
   - Go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select any file from the extension directory

2. Configure the extension:
   - Click the extension icon
   - Open settings
   - Choose your preferred AI provider
   - Configure API settings if needed

## Usage

1. Right-click on any webpage or selected text
2. Choose "Summarize" from the context menu
3. View the generated summary with:
   - Key terms (clickable for highlighting)
   - Formatted text content
   - Interactive keyword filtering

## Recent Changes

### [2024-03-13]
- Improved text display:
  - Removed markdown rendering for better reliability
  - Added proper line break preservation
  - Enhanced text formatting and readability
- Enhanced error handling:
  - Better API response validation
  - Improved error messaging
  - Robust fallback behavior
- UI improvements:
  - Cleaner content sections
  - Better keyword highlighting
  - Improved loading states
- Security updates:
  - Updated content security policy
  - Improved API request handling
  - Enhanced response validation

## Development

- The extension uses vanilla JavaScript for better performance
- Content script handles webpage interaction
- Background script manages API communication
- Options page provides configuration interface

## Files

- `manifest.json`: Extension configuration
- `background.js`: Background script for API handling
- `summarizer.js`: Main content script
- `options.js`: Settings management
- `options.html`: Settings interface 