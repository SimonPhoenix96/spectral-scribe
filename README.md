# Spectral Scribe <i> ![alt text](https://github.com/SimonPhoenix96/spectral-scribe/blob/main/resources/spectralscribe-logo100x.png)

## Install
The extension can easily be installed via the [Chrome Webstore](https://chromewebstore.google.com/detail/spectral-scribe/mikpmbedokmdadmgbcphbkgjmlidpldd) - This version is a bit outdated wait 7 days for google to review the latest update (Last Update: 08/26/2024)

## Overview

No External Libraries only pure Javascript, HTML and Claude or Akash Networks (FREE) LLM RESTAPI 

This Chrome extension provides a powerful suite of AI-driven text analysis tools, leveraging Akash Network powered Llama3-8b or Anthropics Claude models . 

It offers various functionalities for processing and analyzing text from YouTube video transcripts, Twitter Threads, Webpages, user input and more.

## Shortcuts

CTRL - I opens/closes the extension

## Screenshots

UI             |  Prompt Types | Adding Custom Prompts |
:-------------------------:|:-------------------------:|:-------------------------:
![alt text](https://github.com/SimonPhoenix96/spectral-scribe/blob/main/resources/spectralscribe-screenshot-01.png)  |  ![alt text](https://github.com/SimonPhoenix96/spectral-scribe/blob/main/resources/spectralscribe-screenshot-02.png) |  ![alt text](https://github.com/SimonPhoenix96/spectral-scribe/blob/main/resources/spectralscribe-screenshot-03.png)

## Features
- **Prompt Saving - Prompt History**
- **YouTube Transcript Extraction**: Automatically fetches and processes transcripts from YouTube videos.
- **Ergonomic Shortcuts**: For Example CTRL-I opens Spectral Scribe Extension, CTRL-ENTER processes the prompt
- **Web Page Text Extraction**: Extracts text content from the current web page.
- **Multi-Model AI Processing**: Utilizes both Claude (Anthropic) or {so far} a Akash Network ($AKT) powered llama3-8b model for text analysis.
- **Multiple Analysis Types**:
  - Manual Prompt
  - Find Bot Posts
  - Find Sources to claims
  - Fact Check
  - Summarize Thread
  - Bullet Point Generation
  - Key Insights Extraction
  - Simple Explanations
  - Topic Analysis
  - Sentiment Analysis
  - Keyword Extraction
  - Language Translation
  - and more by adding custom prompts
- **Options Page**: Allows users to securely set and store API keys for different AI providers.

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
- Utilizes Chrome's storage API for securely storing API keys.

## Setup

1. Clone the repository.
2. Load the extension in Chrome's developer mode.
3. Access the options page to set your Anthropic (Claude) and Akash API keys.
   
https://chatapi.akash.network/
https://console.anthropic.com/settings/keys


## Usage

1. Click the extension icon in Chrome.
2. Select the desired analysis type.
3. Input text or use the extraction features.
4. Click the "Process" button to analyze the text.

## Note

This extension requires valid API keys for Claude (Anthropic) and Akash AI services to function properly. API keys can be securely set and managed through the extension's options page.
