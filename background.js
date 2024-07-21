// Constants
const ANTHROPIC_API_KEY = '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';
const API_URL = 'https://api.anthropic.com/v1/messages';
const YT_INITIAL_PLAYER_RESPONSE_RE = /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;


// DOM Elements
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryDiv = document.getElementById('summary');
const transcriptInput = document.getElementById('transcriptInput');
const autoTranscribeAndSummarizeBtn = document.getElementById('autoTranscribeAndSummarize');
const processBtn = document.getElementById('processBtn');
const extractTranscriptBtn = document.getElementById('extractTranscriptBtn');
const promptTypeSelect = document.getElementById('promptTypeSelect');

// Main Functions

// Event Listener for select html element
processBtn.addEventListener('click', async function() {
    const selectedOption = promptTypeSelect.value;
    const textInput = transcriptInput.value.trim();
    console.log('Selected option:', selectedOption);
    try {
        console.log('Showing loading spinner');
        showLoadingSpinner();
        switch(selectedOption) {
            case 'manualPrompt':
                console.log('Handling manual prompt');
                transcriptInput.placeholder = "Enter your manual prompt here";
                await generateManualPrompt(textInput);
                break;
            case 'autoTranscribeAndSummarize':
                console.log('Handling auto-transcribe');
                transcriptInput.placeholder = "Will fetch the transcript from the current YouTube video and summarise it";
                await generateAutoTranscribeAndSummarize();
                break;
            case 'bulletPoints':
                console.log('Handling bullet points');
                transcriptInput.placeholder = "Enter the text to generate bullet points";
                await generateBulletPoints(textInput);
                break;
            case 'keyInsights':
                console.log('Handling key insights');
                transcriptInput.placeholder = "Enter the text to extract key insights";
                await generateKeyInsights(textInput);
                break;
            case 'explainSimply':
                console.log('Handling explain simply');
                transcriptInput.placeholder = "Enter the text to explain simply";
                await generateExplainSimply(textInput);
                break;
            case 'questionAnswering':
                console.log('Handling question answering');
                transcriptInput.placeholder = "Enter your question here";
                await questionAnswering(textInput);
                break;
            case 'topicAnalysis':
                console.log('Handling topic analysis');
                transcriptInput.placeholder = "Enter the text for topic analysis";
                await topicAnalysis(textInput);
                break;
            case 'sentimentAnalysis':
                console.log('Handling sentiment analysis');
                transcriptInput.placeholder = "Enter the text for sentiment analysis";
                await sentimentAnalysis(textInput);
                break;
            case 'keywordExtraction':
                console.log('Handling keyword extraction');
                transcriptInput.placeholder = "Enter the text for keyword extraction";
                await keywordExtraction(textInput);
                break;
            case 'languageTranslation':
                console.log('Handling language translation');
                transcriptInput.placeholder = "Enter the text to translate";
                await languageTranslation(textInput);
                break;
            default:
                console.log('Handling default case');
                transcriptInput.placeholder = "Enter your text here";
                await generateManualPrompt(textInput);
        }
        console.log('Switch case completed');
    } catch (error) {
        console.error('Error in processBtn click handler:', error);
        handleError(error);
    }
});


// listener for extract video transcript button
extractTranscriptBtn.addEventListener('click', async function() {
    try {
        const currentUrl = await getCurrentTabUrl();
        if (!currentUrl.includes('youtube.com/watch')) {
            throw new Error('Not a valid YouTube video URL');
        }
        const transcript = await retrieveTranscript(currentUrl);
        transcriptInput.value = transcript;
    } catch (error) {
        console.error('Error extracting transcript:', error);
        handleError(error);
    }
});


// Helper Functions
async function getCurrentTabUrl() {
    try {
        const tabs = await new Promise((resolve) => {
            chrome.tabs.query({active: true, currentWindow: true}, resolve);
        });
        if (!tabs || tabs.length === 0) {
            throw new Error('No active tab found');
        }
        return tabs[0].url;
    } catch (error) {
        throw new Error('Failed to get current tab URL: ' + error.message);
    }
}



async function retrieveTranscript(youtubeLink) {
    try {
        const response = await fetch(youtubeLink);
        if (!response.ok) {
            throw new Error(`Failed to fetch YouTube page: ${response.status}`);
        }
        const body = await response.text();
        const playerResponse = body.match(YT_INITIAL_PLAYER_RESPONSE_RE);
        if (!playerResponse) {
            throw new Error('Unable to parse playerResponse');
        }
        
        const player = JSON.parse(playerResponse[1]);
        if (!player.captions || !player.captions.playerCaptionsTracklistRenderer) {
            throw new Error('Transcript data not found in video');
        }
        
        const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
        if (!tracks || tracks.length === 0) {
            throw new Error('No caption tracks found');
        }
        tracks.sort(compareTracks);
        
        const transcriptResponse = await fetch(tracks[0].baseUrl + '&fmt=json3');
        if (!transcriptResponse.ok) {
            throw new Error(`Failed to fetch transcript: ${transcriptResponse.status}`);
        }
        const transcript = await transcriptResponse.json();
        
        if (!transcript.events || transcript.events.length === 0) {
            throw new Error('Transcript is empty');
        }
        
        return transcript.events
            .filter(x => x.segs)
            .flatMap(x => x.segs.map(y => y.utf8))
            .join(' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/\s+/g, ' ');
    } catch (error) {
        throw new Error('Failed to retrieve transcript: ' + error.message);
    }
}

function compareTracks(track1, track2) {
    if (track1.languageCode === 'en' && track2.languageCode !== 'en') return -1;
    if (track1.languageCode !== 'en' && track2.languageCode === 'en') return 1;
    if (track1.kind !== 'asr' && track2.kind === 'asr') return -1;
    if (track1.kind === 'asr' && track2.kind !== 'asr') return 1;
    return 0;
}

function showLoadingSpinner() {
    summaryDiv.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
}

function displayClaudeAnswer(summary) {
    summaryDiv.innerHTML = summary;
}

function displayError(message) {
    summaryDiv.textContent = 'Error: ' + message;
}

function handleError(error) {
    console.error('Error:', error);
    displayError(error.message);
}

async function promptClaude(text) {
    try {
        const requestOptions = {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                messages: [
                    {role: "user", content: text}
                ]
            })
        };

        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!data.content || !data.content[0] || !data.content[0].text) {
            throw new Error('Invalid API response format');
        }
        return data.content[0].text.replace(/\n/g, '<br>');
    } catch (error) {
        throw new Error('Failed to prompt  Claude: ' + error.message);
    }
}

// Additional functions (stubs)
async function generateBulletPoints(bulletPointPrompt) {
    if (bulletPointPrompt) {
        try {
            const answer = await promptClaude("Generate bullet points for this simply: " + bulletPointPrompt);
            displayClaudeAnswer(answer);
        } catch (error) {
            handleError(error);
        }
    } else {
        displayError('Please enter a bullet point worthy prompt');
    }
}

async function generateKeyInsights(keyInsightPrompt) {
    // Implementation for extracting key insights
    if (keyInsightPrompt) {
        try {
            const answer = await promptClaude("Extract key insights from: " + keyInsightPrompt);
            displayClaudeAnswer(answer);
        } catch (error) {
            handleError(error);
        }
    } else {
        displayError('Please enter a bullet point worthy prompt');
    }
}

async function generateExplainSimply(explainSimplyPrompt) {
    // Implementation for explaining simply
    if (explainSimplyPrompt) {
        try {
            const answer = await promptClaude("Explain this simply: " + explainSimplyPrompt);
            displayClaudeAnswer(answer);
        } catch (error) {
            handleError(error);
        }
    } else {
        displayError('Please enter a bullet point worthy prompt');
    }
}

async function generateAutoTranscribeAndSummarize() {
    console.log('Starting generateAutoTranscribeAndSummarize function');
    showLoadingSpinner();
    try {
        const currentUrl = await getCurrentTabUrl();
        console.log('Current URL:', currentUrl);
        if (!currentUrl.includes('youtube.com/watch')) {
            console.log('Invalid URL: Not a YouTube video');
            throw new Error('Not a valid YouTube video URL');
        }
        console.log('Retrieving transcript...');
        const transcript = await retrieveTranscript(currentUrl);
        console.log('Transcript retrieved, length:', transcript.length);
        console.log('Sending transcript to Claude for summarization...');
        const summary = await promptClaude("Summarise with the most detail possible:   " + transcript);
        console.log('Summary received from Claude, length:', summary.length);
        displayClaudeAnswer(summary)
    } catch (error) {
        console.error('Error in generateAutoTranscribeAndSummarize:', error);
        throw new Error('Auto-transcribe failed: ' + error.message);
    }
}


async function generateManualPrompt(manualPrompt) {
    if (manualPrompt) {
        try {
            const answer = await promptClaude(manualPrompt);
            displayClaudeAnswer(answer);
        } catch (error) {
            handleError(error);
        }
    } else {
        displayError('Please enter a manualPrompt');
    }
}


async function topicAnalysis(text) {
    if (text) {
        try {
            const answer = await promptClaude("Analyze the main topics in this text: " + text);
            displayClaudeAnswer(answer);
        } catch (error) {
            handleError(error);
        }
    } else {
        displayError('Please enter text for topic analysis');
    }
}

async function sentimentAnalysis(text) {
    if (text) {
        try {
            const answer = await promptClaude("Analyze the sentiment of this text: " + text);
            displayClaudeAnswer(answer);
        } catch (error) {
            handleError(error);
        }
    } else {
        displayError('Please enter text for sentiment analysis');
    }
}

async function keywordExtraction(text) {
  
    if (text) {
        try {
            const answer = await promptClaude("Extract the key words from this text: " + text);
            displayClaudeAnswer(answer);
        } catch (error) {
            handleError(error);
        }
    } else {
        displayError('Please enter text for keyword extraction');
    }
}

async function languageTranslation() {
    const text = elements.transcriptInput.value.trim();
    if (text) {
        try {
            const answer = await promptClaude("Translate this text to English if it's not already in English: " + text);
            displayClaudeAnswer(answer);
        } catch (error) {
            handleError(error);
        }
    } else {
        displayError('Please enter text for translation');
    }
}