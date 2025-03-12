# Webpage Summarizer

A Firefox browser extension that provides quick and efficient webpage summarization. The extension uses both built-in algorithms and AI models to generate comprehensive summaries of web content.

## Features

- Right-click context menu integration for easy access
- Summarize entire pages or selected text
- Interactive summary interface with clickable keywords
- Support for multiple AI models:
  - OpenAI (GPT-3.5, GPT-4)
  - Ollama (Local models like Llama 2, Mistral)
- Dark mode support
- Configurable settings for AI providers

## Changelog

### Features
- Initial extension setup with basic summarization
- Add AI-powered summarization with OpenAI/Ollama support
- Add context menu integration
- Add selection/full page summarization choice
- Add interactive keyword highlighting
- Add loading indicator for summarization progress
- Add settings page with model configuration
- Add custom model support for Ollama

### Bug Fixes
- Fix double modal issue in summarization
- Fix options page model switching and visibility
- Fix settings page layout and restore functionality

## Setup

1. Configure your preferred AI provider in the extension settings
2. For OpenAI: Enter your API key
3. For Ollama: Ensure your local instance is running (default: http://localhost:11434)

## Usage

1. Right-click anywhere on a webpage
2. Select "Summarize" from the context menu
3. If text is selected, choose between summarizing selection or entire page
4. View the generated summary with interactive keywords and sections 