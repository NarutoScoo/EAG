# Webpage Summarizer Extension

A Firefox browser extension that provides intelligent webpage summarization capabilities.

## Features

- Context menu integration for easy access
- Support for both full page and selected text summarization
- Multiple AI provider support:
  - OpenAI (GPT-3.5, GPT-4)
  - Ollama (local models)
- Interactive summary interface:
  - Keyword highlighting and navigation
  - Clean, modern UI design
  - Dark mode support
- Progressive loading states with user-friendly messages
- Robust error handling with fallback summaries
- Configurable settings:
  - Model selection
  - API configuration
  - Custom model support

## Installation

1. Load the extension in Firefox:
   - Open Firefox
   - Navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from the extension directory

2. Configure the extension:
   - Click the extension icon
   - Select "Options"
   - Choose your preferred AI provider
   - Configure API settings if needed

## Usage

1. Right-click on any webpage or selected text
2. Choose "Summarize Page" or "Summarize Selection"
3. View the generated summary with:
   - Key terms (clickable for highlighting)
   - Comprehensive summary
   - Clean text formatting

## Development

- Extension files:
  - `manifest.json`: Extension configuration
  - `summarizer.js`: Main summarization logic
  - `background.js`: Background script for API handling
  - `options.js`: Settings management
  - `options.html`: Settings interface

## Recent Changes

### [2024-03-13]
- Enhanced user experience:
  - Updated loading message to use neutral terminology
  - Improved text display formatting
  - Better keyword extraction and highlighting
- Reliability improvements:
  - Enhanced error handling
  - Better API response validation
  - Improved fallback behavior
- UI enhancements:
  - Cleaner loading states
  - More intuitive progress indication
  - Better dark mode support 