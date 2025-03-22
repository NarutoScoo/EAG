# Meaning Getter Project

A Firefox extension with a local LLM backend for instant word definitions.

## Project Structure 

Meaning Getter/
├── Extension/ # Firefox extension files
│ ├── manifest.json # Extension configuration
│ ├── content.js # Core extension functionality
│ ├── icons/ # Extension icons
│ └── README.md # Extension documentation
├── Backend/ # Local LLM server
│ ├── app.py # Dash/Flask backend server
│ ├── requirements.txt # Python dependencies
│ └── README.md # Backend documentation
└── README.md # This file

## Quick Start
1. Set up the backend server (see Backend/README.md)
2. Install the Firefox extension (see Extension/README.md)
3. Select any word on a webpage to see its definition

## Architecture
- Frontend: Firefox extension that captures text selection
- Backend: Python server with:
  - Primary: Local LLM for offline definitions
  - Fallback: Dictionary API integration
- Error Handling: Graceful fallbacks and user-friendly messages

## Development
- Backend runs on port 8050
- Extension communicates with backend via HTTP
- Modular structure for easy maintenance