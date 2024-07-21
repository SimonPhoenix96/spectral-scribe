# AI-Powered Browser Analysis Chrome Extension

## Overview

This Chrome extension provides a powerful suite of AI-driven text analysis tools, leveraging both Claude (Anthropic) and Akash AI (Llama-3) models. It offers various functionalities for processing and analyzing text from web pages, YouTube videos, and user input.

## Features

- **YouTube Transcript Extraction**: Automatically fetches and processes transcripts from YouTube videos.
- **Web Page Text Extraction**: Extracts text content from the current web page.
- **Multi-Model AI Processing**: Utilizes both Claude (Anthropic) or {so far} a Akash Network ($AKT) powered llama3-8b model for text analysis.
- **Multiple Analysis Types**:
  - Manual Prompt
  - Auto-Transcribe and Summarize (YouTube)
  - Bullet Point Generation
  - Key Insights Extraction
  - Simple Explanations
  - Question Answering
  - Topic Analysis
  - Sentiment Analysis
  - Keyword Extraction
  - Language Translation

## How It Works

1. Users can select the type of analysis they want to perform from a dropdown menu.
2. Text can be input manually, extracted from the current web page, or automatically fetched from YouTube videos.
3. The extension sends the text to the selected AI model (Claude or Akash) for processing.
4. Results are displayed within the extension popup.

## Technical Details

- Built as a Chrome extension using JavaScript.
- Integrates with Chrome's tabs and runtime APIs for web page interaction.
- Uses fetch API for making requests to AI services.
- Implements error handling and loading indicators for a smooth user experience.

## Setup

1. Clone the repository.
2. Add your Anthropic (Claude) and Akash API keys to the respective constants.
3. Load the extension in Chrome's developer mode.

## Usage

1. Click the extension icon in Chrome.
2. Select the desired analysis type.
3. Input text or use the extraction features.
4. Click the "Process" button to analyze the text.

## Note

This extension requires valid API keys for Claude (Anthropic) and Akash AI services to function properly.