// Constants
const YT_INITIAL_PLAYER_RESPONSE_RE =
  /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;

let ANTHROPIC_API_KEY = '';
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

let AKASH_API_KEY = '';
const AKASH_API_URL = "https://chatapi.akash.network/api/v1/chat/completions"; 
// DOM Elements
const summarizeBtn = document.getElementById("summarizeBtn");
const summaryDiv = document.getElementById("summary");
const poweredByProp= document.getElementById("poweredByProp");
const transcriptInput = document.getElementById("transcriptInput");
const autoTranscribeAndSummarizeBtn = document.getElementById("autoTranscribeAndSummarize");
const processBtn = document.getElementById("processBtn");
const extractTranscriptBtn = document.getElementById("extractTranscriptBtn");
const extractHtmlTextBtn = document.getElementById("extractHtmlTextBtn");
const promptTypeSelect = document.getElementById("promptTypeSelect");
const apiSelect = document.getElementById("apiSelect");
const optionsLink = document.getElementById("optionsLink");


// Main Functions

function loadApiKeys(callback) {
  console.log('Starting to load API keys');
  chrome.storage.sync.get(['ANTHROPIC_API_KEY', 'AKASH_API_KEY'], function(result) {
    console.log('Retrieved API keys from storage');
    ANTHROPIC_API_KEY = result.ANTHROPIC_API_KEY || '';
    AKASH_API_KEY = result.AKASH_API_KEY || '';
    console.log('ANTHROPIC_API_KEY set:', ANTHROPIC_API_KEY ? 'Yes' : 'No');
    console.log('AKASH_API_KEY set:', AKASH_API_KEY ? 'Yes' : 'No');
    callback();
    console.log('Callback executed');
  });
}

function getSelectedAPI() {
    const apiSelect = document.getElementById("apiSelect");
    return apiSelect.value; // 'claude' or 'akash'
}

// Event Listener for select html element

// Event listener that gets triggers as soon as popup loads 
//TODO: adapt when needed
document.addEventListener('DOMContentLoaded', function() {
  loadApiKeys(function() {
    renderPoweredByProp();
  });
});

document.getElementById("apiSelect").addEventListener('change', function() {
  const selectedAPI = this.value;
  renderPoweredByProp();
});

document.getElementById("promptTypeSelect").addEventListener('change', function() {
  const selectedPromptType = this.value;
  console.log("Selected prompt type:", selectedPromptType);
  transcriptInput.placeholder = selectedPromptType;
  switch (selectedPromptType) {
    case "manualPrompt":
      console.log("Handling manual prompt");
      transcriptInput.placeholder = "Type your custom prompt here...";
      break;
    case "autoTranscribeAndSummarize":
      console.log("Handling auto-transcribe");
      transcriptInput.placeholder = "YouTube video transcript will be fetched and summarized automatically";
      break;
    case "bulletPoints":
      console.log("Handling bullet points");
      transcriptInput.placeholder = "Paste your text here to generate bullet points";
      break;
    case "keyInsights":
      console.log("Handling key insights");
      transcriptInput.placeholder = "Enter text to extract key insights from";
      break;
    case "explainSimply":
      console.log("Handling explain simply");
      transcriptInput.placeholder = "Paste complex text here for a simplified explanation";
      break;
    case "questionAnswering":
      console.log("Handling question answering");
      transcriptInput.placeholder = "Ask your question here...";
      break;
    case "topicAnalysis":
      console.log("Handling topic analysis");
      transcriptInput.placeholder = "Input text for topic analysis here";
      break;
    case "sentimentAnalysis":
      console.log("Handling sentiment analysis");
      transcriptInput.placeholder = "Paste text here for sentiment analysis";
      break;
    case "keywordExtraction":
      console.log("Handling keyword extraction");
      transcriptInput.placeholder = "Enter text to extract keywords from";
      break;
    case "languageTranslation":
      console.log("Handling language translation");
      transcriptInput.placeholder = "Type or paste text here for translation";
      break;
    default:
      console.log("Handling default case");
      transcriptInput.placeholder = "Type or paste your text here...";
  }
});

optionsLink.addEventListener('click', function(e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});


processBtn.addEventListener("click", async function () {
  const selectedOption = promptTypeSelect.value;
  const textInput = transcriptInput.value.trim();
  console.log("Selected option:", selectedOption);
  try {
    console.log("Showing loading spinner");
    showLoadingSpinner();
    switch (selectedOption) {
      case "manualPrompt":
        console.log("Handling manual prompt");
        transcriptInput.placeholder = "Enter your manual prompt here";
        await generateManualPrompt(textInput);
        break;
      case "autoTranscribeAndSummarize":
        console.log("Handling auto-transcribe");
        transcriptInput.placeholder =
          "Will fetch the transcript from the current YouTube video and summarise it";
        await generateAutoTranscribeAndSummarize();
        break;
      case "bulletPoints":
        console.log("Handling bullet points");
        transcriptInput.placeholder =
          "Enter the text to generate bullet points";
        await generateBulletPoints(textInput);
        break;
      case "keyInsights":
        console.log("Handling key insights");
        transcriptInput.placeholder = "Enter the text to extract key insights";
        await generateKeyInsights(textInput);
        break;
      case "explainSimply":
        console.log("Handling explain simply");
        transcriptInput.placeholder = "Enter the text to explain simply";
        await generateExplainSimply(textInput);
        break;
      case "questionAnswering":
        console.log("Handling question answering");
        transcriptInput.placeholder = "Enter your question here";
        await questionAnswering(textInput);
        break;
      case "topicAnalysis":
        console.log("Handling topic analysis");
        transcriptInput.placeholder = "Enter the text for topic analysis";
        await topicAnalysis(textInput);
        break;
      case "sentimentAnalysis":
        console.log("Handling sentiment analysis");
        transcriptInput.placeholder = "Enter the text for sentiment analysis";
        await sentimentAnalysis(textInput);
        break;
      case "keywordExtraction":
        console.log("Handling keyword extraction");
        transcriptInput.placeholder = "Enter the text for keyword extraction";
        await keywordExtraction(textInput);
        break;
      case "languageTranslation":
        console.log("Handling language translation");
        transcriptInput.placeholder = "Enter the text to translate";
        await languageTranslation(textInput);
        break;
      default:
        console.log("Handling default case");
        transcriptInput.placeholder = "Enter your text here";
        await generateManualPrompt(textInput);
    }
    console.log("Switch case completed");
  } catch (error) {
    console.error("Error in processBtn click handler:", error);
    handleError(error);
  }
});

// listener for extract video transcript button
extractTranscriptBtn.addEventListener("click", async function () {
  try {
    const currentUrl = await getCurrentTabUrl();
    if (!currentUrl.includes("youtube.com/watch")) {
      throw new Error("Not a valid YouTube video URL");
    }
    const transcript = await retrieveTranscript(currentUrl);
    transcriptInput.value = transcript;
  } catch (error) {
    console.error("Error extracting transcript:", error);
    handleError(error);
  }
});

// listener for extract html text button
extractHtmlTextBtn.addEventListener("click", async function () {
  try {
    const htmlText = extractTextFromPage();
  } catch (error) {
    console.error("Error extracting text from HTML:", error);
    handleError(error);
  }
});

// Helper Functions
async function getCurrentTabUrl() {
  try {
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
    if (!tabs || tabs.length === 0) {
      throw new Error("No active tab found");
    }
    return tabs[0].url;
  } catch (error) {
    throw new Error("Failed to get current tab URL: " + error.message);
  }
}
async function extractTextFromPage() {
  chrome.runtime.sendMessage({ action: "extractText" }, function (response) {
    // const extractedHTML = response.text;
    console.log(response.html);
    transcriptInput.value = response.text;
  });
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
      throw new Error("Unable to parse playerResponse");
    }

    const player = JSON.parse(playerResponse[1]);
    if (!player.captions || !player.captions.playerCaptionsTracklistRenderer) {
      throw new Error("Transcript data not found in video");
    }

    const tracks =
      player.captions.playerCaptionsTracklistRenderer.captionTracks;
    if (!tracks || tracks.length === 0) {
      throw new Error("No caption tracks found");
    }
    tracks.sort(compareTracks);

    const transcriptResponse = await fetch(tracks[0].baseUrl + "&fmt=json3");
    if (!transcriptResponse.ok) {
      throw new Error(
        `Failed to fetch transcript: ${transcriptResponse.status}`
      );
    }
    const transcript = await transcriptResponse.json();

    if (!transcript.events || transcript.events.length === 0) {
      throw new Error("Transcript is empty");
    }

    return transcript.events
      .filter((x) => x.segs)
      .flatMap((x) => x.segs.map((y) => y.utf8))
      .join(" ")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ");
  } catch (error) {
    throw new Error("Failed to retrieve transcript: " + error.message);
  }
}

function compareTracks(track1, track2) {
  if (track1.languageCode === "en" && track2.languageCode !== "en") return -1;
  if (track1.languageCode !== "en" && track2.languageCode === "en") return 1;
  if (track1.kind !== "asr" && track2.kind === "asr") return -1;
  if (track1.kind === "asr" && track2.kind !== "asr") return 1;
  return 0;
}

function showLoadingSpinner() {
  summaryDiv.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
  const spinnerContainer = summaryDiv.querySelector('.spinner-container');
  spinnerContainer.style.opacity = '0';
  spinnerContainer.style.transition = 'opacity 0.5s ease-in-out';
  setTimeout(() => {
    spinnerContainer.style.opacity = '1';
  }, 50);
  return {
    hide: () => {
      spinnerContainer.style.opacity = '0';
      return new Promise(resolve => setTimeout(() => {
        summaryDiv.innerHTML = '';
        resolve();
      }, 500));
    }
  };
}

function displayPromptAnswer(summary) {
  summaryDiv.innerHTML = '';
  const answerElement = document.createElement('div');
  answerElement.innerHTML = summary;
  summaryDiv.appendChild(answerElement);
}

function renderPoweredByProp() {
  poweredByProp.innerHTML = '';
  const answerElement = document.createElement('div');
  
  answerElement.style.display = 'flex';
  answerElement.style.justifyContent = 'center';
  answerElement.style.alignItems = 'center';
  
  const selectedAPI = getSelectedAPI();
  if (selectedAPI === 'akash') {
    const logo = document.createElement('img');
    logo.src = 'resources/akash_small_icon.jpg';
    logo.alt = 'Akash Logo';
    logo.style.width = '20px';
    logo.style.marginLeft = '5px';
    logo.style.verticalAlign = 'middle';

    const titleSpan = document.createElement('span');
    titleSpan.textContent = "Powered by Akash Network";
    answerElement.appendChild(titleSpan);
    answerElement.appendChild(logo);
  } else if (selectedAPI === 'claude') {
    const logo = document.createElement('img');
    logo.src = 'resources/anthropic_small_icon.jpg';
    logo.alt = 'Claude Logo';
    logo.style.width = '20px';
    logo.style.marginLeft = '5px';
    logo.style.verticalAlign = 'middle';
    const titleSpan = document.createElement('span');
    titleSpan.textContent = "Powered by Claude";
    answerElement.appendChild(titleSpan);
    answerElement.appendChild(logo);
  }
  
  answerElement.style.opacity = '0';
  answerElement.style.transition = 'opacity 0.5s ease-in';
  poweredByProp.appendChild(answerElement);
  
  setTimeout(() => {
    answerElement.style.opacity = '1';
  }, 50);
}

function displayError(message) {
  summaryDiv.textContent = "Error: " + message;
}

function handleError(error) {
  console.error("Error:", error);
  displayError(error.message);
}

async function promptClaude(text) {
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [{ role: "user", content: text }],
      }),
    };

    const response = await fetch(ANTHROPIC_API_URL, requestOptions);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Invalid API response format");
    }
    return data.content[0].text.replace(/\n/g, "<br>");
  } catch (error) {
    throw new Error("Failed to prompt  Claude: " + error.message);
  }
}

async function promptAkash(text) {
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AKASH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b", // Replace with the appropriate model name
        messages: [{ role: "user", content: text }],
        max_tokens: 1024,
      }),
    };

    const response = await fetch(AKASH_API_URL, requestOptions);
    if (!response.ok) {
      throw new Error(
        `Akash API request failed with status ${response.status}`
      );
    }
    const data = await response.json();

    // Adjust this based on the actual Akash API response structure
    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error("Invalid Akash API response format");
    }
    return data.choices[0].message.content.replace(/\n/g, "<br>");
  } catch (error) {
    throw new Error("Failed to prompt Akash: " + error.message);
  }
}

async function promptAI(text) {
  console.log("Entering promptAI function");
  const selectedAPI = getSelectedAPI();
  console.log(`Selected API: ${selectedAPI}`);

  try {
    if (selectedAPI === "claude") {
      console.log("Using Claude API");
      return await promptClaude(text);
    } else if (selectedAPI === "akash") {
      console.log("Using Akash API");
      return await promptAkash(text);
    } else {
      console.error(`Invalid API selected: ${selectedAPI}`);
      throw new Error("Invalid API selected");
    }
  } catch (error) {
    console.error("Error in promptAI:", error);
    throw error;
  } finally {
    console.log("Exiting promptAI function");
  }
}

// Additional functions (stubs)
async function generateBulletPoints(bulletPointPrompt) {
  if (bulletPointPrompt) {
    try {
      const answer = await promptAI(
        "Generate bullet points for this simply: " + bulletPointPrompt
      );
      displayPromptAnswer(answer);
    } catch (error) {
      handleError(error);
    }
  } else {
    displayError("Please enter a bullet point worthy prompt");
  }
}

async function generateKeyInsights(keyInsightPrompt) {
  // Implementation for extracting key insights
  if (keyInsightPrompt) {
    try {
      const answer = await promptAI(
        "Extract key insights from: " + keyInsightPrompt
      );
      displayPromptAnswer(answer);
    } catch (error) {
      handleError(error);
    }
  } else {
    displayError("Please enter a bullet point worthy prompt");
  }
}

async function generateExplainSimply(explainSimplyPrompt) {
  // Implementation for explaining simply
  if (explainSimplyPrompt) {
    try {
      const answer = await promptAI(
        "Explain this simply: " + explainSimplyPrompt
      );
      displayPromptAnswer(answer);
    } catch (error) {
      handleError(error);
    }
  } else {
    displayError("Please enter a bullet point worthy prompt");
  }
}

async function generateAutoTranscribeAndSummarize() {
  console.log("Starting generateAutoTranscribeAndSummarize function");
  showLoadingSpinner();
  try {
    const currentUrl = await getCurrentTabUrl();
    console.log("Current URL:", currentUrl);
    if (!currentUrl.includes("youtube.com/watch")) {
      console.log("Invalid URL: Not a YouTube video");
      throw new Error("Not a valid YouTube video URL");
    }
    console.log("Retrieving transcript...");
    const transcript = await retrieveTranscript(currentUrl);
    console.log("Transcript retrieved, length:", transcript.length);
    console.log("Sending transcript to Claude for summarization...");
    const summary = await promptAI(
      "Summarise with the most detail possible:   " + transcript
    );
    console.log("Summary received from Claude, length:", summary.length);
    displayPromptAnswer(summary);
  } catch (error) {
    console.error("Error in generateAutoTranscribeAndSummarize:", error);
    throw new Error("Auto-transcribe failed: " + error.message);
  }
}

async function generateManualPrompt(manualPrompt) {
  if (manualPrompt) {
    try {
      const answer = await promptAI(manualPrompt);
      displayPromptAnswer(answer);
    } catch (error) {
      handleError(error);
    }
  } else {
    displayError("Please enter a manualPrompt");
  }
}

async function topicAnalysis(text) {
  if (text) {
    try {
      const answer = await promptAI(
        "Analyze the main topics in this text: " + text
      );
      displayPromptAnswer(answer);
    } catch (error) {
      handleError(error);
    }
  } else {
    displayError("Please enter text for topic analysis");
  }
}

async function sentimentAnalysis(text) {
  if (text) {
    try {
      const answer = await promptAI(
        "Analyze the sentiment of this text: " + text
      );
      displayPromptAnswer(answer);
    } catch (error) {
      handleError(error);
    }
  } else {
    displayError("Please enter text for sentiment analysis");
  }
}

async function keywordExtraction(text) {
  if (text) {
    try {
      const answer = await promptAI(
        "Extract the key words from this text: " + text
      );
      displayPromptAnswer(answer);
    } catch (error) {
      handleError(error);
    }
  } else {
    displayError("Please enter text for keyword extraction");
  }
}

async function languageTranslation() {
  const text = elements.transcriptInput.value.trim();
  if (text) {
    try {
      const answer = await promptAI(
        "Translate this text to English if it's not already in English: " + text
      );
      displayPromptAnswer(answer);
    } catch (error) {
      handleError(error);
    }
  } else {
    displayError("Please enter text for translation");
  }
}

//TODO: add dynamic list of custom prompts for use with ai models
