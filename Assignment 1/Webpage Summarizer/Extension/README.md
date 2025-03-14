# Webpage Summarizer Extension

A Firefox browser extension that provides intelligent webpage summarization with a focus on user experience and visual integration.

## Features

### Summarization Capabilities
- Full webpage summarization
- Selected text summarization
- AI-powered content analysis
- Key points extraction
- Important details identification

### User Interface
- Adaptive styling that matches webpage design:
  - Inherits webpage fonts and colors
  - Adjusts to dark/light modes
  - Maintains visual consistency
- Interactive side panel:
  - Resizable width
  - Smooth animations
  - Keyboard shortcuts
  - Click-outside dismissal

### Keyword Features
- Instant keyword extraction:
  - Shows keywords immediately while summary generates
  - Frequency-based analysis
  - Intelligent common word filtering
  - Console logging for debugging
- Interactive keyword system:
  - Click to highlight occurrences
  - Visual feedback on interaction
  - Maintained during summary updates
  - Smooth scrolling to matches

### Technical Features
- Multiple AI provider support:
  - OpenAI integration (GPT-4, GPT-3.5)
  - Local Ollama support
  - Automatic fallback handling
- Progressive enhancement:
  - Initial quick summary
  - Asynchronous AI enhancement
  - Maintained interactivity
- Robust error handling:
  - Graceful degradation
  - Clear error messages
  - Automatic retries
- Performance optimizations:
  - Efficient DOM updates
  - Smooth animations
  - Resource cleanup

## Installation

1. Download or clone the repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the Extension directory

## Configuration

1. Click the extension icon to access settings
2. Choose your preferred AI provider:
   - OpenAI: Enter your API key
   - Ollama: Configure local instance URL
3. Select preferred model and options
4. Save settings

## Usage

1. Select text on any webpage (optional)
2. Right-click and choose "Summarize" or use keyboard shortcut
3. For selected text:
   - Choose between summarizing selection or full page
   - View keywords immediately while summary generates
   - Interact with keywords to highlight content
4. View the generated summary in the side panel
5. Click keywords to highlight relevant content
6. Resize panel as needed
7. Close with 'X' or click outside

## Development

- Built with vanilla JavaScript
- Uses browser extension APIs
- Modular code organization
- Clear separation of concerns
- Extensive error handling
- Progressive enhancement pattern

## Recent Changes

### [2024-03-14]
- Enhanced keyword system:
  - Immediate keyword display while waiting for summary
  - Improved frequency-based extraction
  - Better common word filtering
  - Added console logging for debugging
  - Maintained keyword state during updates
- Previous updates:
  - Added adaptive styling
  - Improved visual consistency
  - Enhanced error handling
  - Added keyboard shortcuts
  - Improved animation system 