# Meaning Getter Extension

Firefox extension for instant word definitions with LLM integration.

## Features
- Instant word definitions on text selection
- Integration with local LLM backend
- Fallback to online dictionary
- Clean tooltip interface
- Error handling with visual feedback

## Installation
1. Ensure backend server is running
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select `manifest.json` from this directory

## Usage
1. Select any word on a webpage
2. A tooltip appears with:
   - Word and pronunciation (if available)
   - Part of speech
   - Definitions
   - Error messages if word not found

## Files
- `manifest.json`: Extension configuration and permissions
- `content.js`: Core functionality
  - Text selection handling
  - API communication
  - Tooltip display
- `icons/`: Extension icons (48px and 96px)

## Error Handling
- Red highlighted messages for:
  - Unknown words
  - Network errors
  - API failures

## Development
- Modify `content.js` for tooltip behavior
- Update `manifest.json` for permissions
- Backend communication on localhost:8050 