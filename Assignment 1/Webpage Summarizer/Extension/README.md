# Webpage Summarizer Extension

A Firefox browser extension that provides intelligent webpage summarization using either OpenAI's GPT models or local Ollama models.

## Features

### Summarization
- Summarize entire webpages or selected text
- Multiple AI provider support:
  - OpenAI (GPT-4 and GPT-3.5)
  - Ollama (local models)
- Intelligent keyword extraction
- Important details highlighting
- Key points identification

### User Interface
- Enhanced selection dialog:
  - Centered modal with backdrop blur
  - Click-outside dismissal
  - Smooth animations and transitions
  - Clear visual hierarchy
  - Dark mode support
- Adaptive styling that matches webpage design:
  - Inherits webpage's font family and size
  - Matches text colors and styles
  - Adapts heading styles for consistency
  - Uses webpage's background color
  - Maintains visual harmony with the host page
- Side panel display with:
  - Resizable width (drag handle)
  - Smooth animations
  - Clear visual separation
  - Proper shadow effects
- Interactive elements:
  - Clickable keywords for highlighting
  - Smooth scrolling to matches
  - Hover effects for better UX
- Loading indicators
- Clean, modern design

### Technical Features
- HTML-formatted summaries
- Markdown rendering support
- Error handling with fallbacks
- Debug logging
- Cross-origin request handling
- Dynamic model loading
- Settings persistence

## Installation

1. Load the extension in Firefox:
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

2. Configure the extension:
   - Click the extension icon
   - Open settings
   - Choose AI provider (OpenAI or Ollama)
   - Configure API settings

## Usage

1. Select text on any webpage (optional)
2. Right-click to open the context menu
3. Choose "Summarize" from the context menu
4. If text is selected:
   - A centered modal appears with options
   - Choose between summarizing selection or full page
   - Click outside to dismiss if needed
5. View the summary in the adaptive side panel
6. Use keywords to highlight relevant content
7. Resize the panel as needed
8. Close with the × button when done

## Development

The extension consists of several key files:
- `manifest.json`: Extension configuration
- `summarizer.js`: Main content script
- `background.js`: Background service worker
- `options.js`: Settings management
- `options.html`: Settings UI

### Building

No build step required. The extension can be loaded directly into Firefox.

### Testing

1. Make changes to the code
2. Reload the extension in `about:debugging`
3. Test on various websites to ensure:
   - Selection dialog appears centered
   - Backdrop blur works correctly
   - Click-outside dismissal functions
   - Animations are smooth
   - Style adaptation works
   - Dark mode compatibility
4. Check error handling scenarios

## Recent Changes

### [2024-03-14]
- Enhanced settings interface:
  - Dynamic Ollama model loading
  - Updated OpenAI model list
  - Real-time model refresh
  - Improved visual feedback
  - Better error handling
- Previous updates:
  - Improved text display
  - Enhanced error handling
  - Better response validation 