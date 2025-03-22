# Meaning Getter

A Firefox extension that instantly shows word definitions when text is selected.

## Features
- Get definitions by simply selecting any word
- Clean tooltip interface with pronunciation and meanings
- Clear error messages for unknown words or connection issues
- Works on any webpage
- Offline-friendly
- Uses free Dictionary API

## Installation
1. Clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select `manifest.json`

## Development
The extension consists of:
- `manifest.json`: Extension configuration
- `content.js`: Core functionality for word selection and meaning display
- `icons/`: Extension icons in different sizes

## API
Uses the free Dictionary API (api.dictionaryapi.dev) to fetch word definitions.

## Error Handling
- Shows user-friendly messages when words are not found
- Displays error messages for network or API issues 