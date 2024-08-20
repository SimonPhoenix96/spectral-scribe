// Constants
const YT_INITIAL_PLAYER_RESPONSE_RE =
  /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;

let ANTHROPIC_API_KEY = '';
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

let AKASH_API_KEY = '';
const AKASH_API_URL = "https://chatapi.akash.network/api/v1/chat/completions";
// DOM Elements
const summarizeBtn = document.getElementById("summarizeBtn");
const promptAnswerDiv = document.getElementById("promptAnswer");
const poweredByProp= document.getElementById("poweredByProp");
const promptInput = document.getElementById("promptInput");
const autoTranscribeAndSummarizeBtn = document.getElementById("autoTranscribeAndSummarize");
const processPromptBtn = document.getElementById("processPromptBtn");
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

// Event Listeners

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('promptInput').focus();
});

// Event listener that gets triggers as soon as popup loads
//TODO: adapt when needed
document.addEventListener('DOMContentLoaded', function() {
  loadApiKeys(function() {
    renderPoweredByProp();
    checkApiKeysAndPulsate();
    updatePromptTypeSelectIcon();
  });
});

document.getElementById('promptTypeSelect').addEventListener('change', updatePromptTypeSelectIcon);

document.getElementById("apiSelect").addEventListener('change', function() {
  const selectedAPI = this.value;
  const akashModelSelect = document.getElementById("akashModelSelect");
  const claudeModelSelect = document.getElementById("claudeModelSelect");
  
  if (selectedAPI === 'akash') {
    akashModelSelect.style.display = 'inline-block';
    claudeModelSelect.style.display = 'none';
  } else if (selectedAPI === 'claude') {
    akashModelSelect.style.display = 'none';
    claudeModelSelect.style.display = 'inline-block';
  }
  
  renderPoweredByProp();
});


document.getElementById("promptTypeSelect").addEventListener('change', function() {
  const selectedPromptType = this.value;
  console.log("Selected prompt type:", selectedPromptType);
  promptInput.placeholder = selectedPromptType;
  switch (selectedPromptType) {
    case "manualPrompt":
      console.log("Handling manual prompt");
      promptInput.placeholder = "Type your custom prompt here...";
      break;
    case "autoTranscribeAndSummarize":
      console.log("Handling auto-transcribe");
      promptInput.placeholder = "YouTube video transcript will be fetched and summarized automatically";
      break;
    case "bulletPoints":
      console.log("Handling bullet points");
      promptInput.placeholder = "Paste your text here to generate bullet points";
      break;
    case "keyInsights":
      console.log("Handling key insights");
      promptInput.placeholder = "Enter text to extract key insights from";
      break;
    case "explainSimply":
      console.log("Handling explain simply");
      promptInput.placeholder = "Paste complex text here for a simplified explanation";
      break;
    case "questionAnswering":
      console.log("Handling question answering");
      promptInput.placeholder = "Ask your question here...";
      break;
    case "topicAnalysis":
      console.log("Handling topic analysis");
      promptInput.placeholder = "Input text for topic analysis here";
      break;
    case "sentimentAnalysis":
      console.log("Handling sentiment analysis");
      promptInput.placeholder = "Paste text here for sentiment analysis";
      break;
    case "keywordExtraction":
      console.log("Handling keyword extraction");
      promptInput.placeholder = "Enter text to extract keywords from";
      break;
    case "languageTranslation":
      console.log("Handling language translation");
      promptInput.placeholder = "Type or paste text here for translation";
      break;
    default:
      console.log("Handling default case");
      promptInput.placeholder = "Type or paste your text here...";
  }
});

optionsLink.addEventListener('click', function(e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});


function processPrompt() {
  const selectedOption = promptTypeSelect.value;
  const textInput = promptInput.value.trim();
  console.log("Selected option:", selectedOption);
  try {
    console.log("Showing loading spinner");
    showLoadingSpinner();
    switch (selectedOption) {
      case "manualPrompt":
        console.log("Handling manual prompt");
        promptInput.placeholder = "Enter your manual prompt here";
        return generateManualPrompt(textInput);
      case "autoTranscribeAndSummarize":
        console.log("Handling auto-transcribe");
        promptInput.placeholder =
          "Will fetch the transcript from the current YouTube video and summarise it";
        return generateAutoTranscribeAndSummarize();
      case "bulletPoints":
        console.log("Handling bullet points");
        promptInput.placeholder =
          "Enter the text to generate bullet points";
        return generateBulletPoints(textInput);
      case "keyInsights":
        console.log("Handling key insights");
        promptInput.placeholder = "Enter the text to extract key insights";
        return generateKeyInsights(textInput);
      case "explainSimply":
        console.log("Handling explain simply");
        promptInput.placeholder = "Enter the text to explain simply";
        return generateExplainSimply(textInput);
      case "questionAnswering":
        console.log("Handling question answering");
        promptInput.placeholder = "Enter your question here";
        return questionAnswering(textInput);
      case "topicAnalysis":
        console.log("Handling topic analysis");
        promptInput.placeholder = "Enter the text for topic analysis";
        return topicAnalysis(textInput);
      case "sentimentAnalysis":
        console.log("Handling sentiment analysis");
        promptInput.placeholder = "Enter the text for sentiment analysis";
        return sentimentAnalysis(textInput);
      case "keywordExtraction":
        console.log("Handling keyword extraction");
        promptInput.placeholder = "Enter the text for keyword extraction";
        return keywordExtraction(textInput);
      case "languageTranslation":
        console.log("Handling language translation");
        promptInput.placeholder = "Enter the text to translate";
        return languageTranslation(textInput);
      default:
        console.log("Handling default case");
        promptInput.placeholder = "Enter your text here";
        return generateManualPrompt(textInput);
    }
  } catch (error) {
    console.error("Error in processText:", error);
    handleError(error);
  }
}

processPromptBtn.addEventListener("click", processPrompt);

document.addEventListener('keydown', function(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    processPrompt();
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
    promptInput.value = transcript;
  } catch (error) {
    console.error("Error extracting transcript:", error);
    handleError(error);
  }
});
document.getElementById('apiSelect').addEventListener('change', function() {
  const selectedOption = this.options[this.selectedIndex];
  this.style.backgroundImage = `url('${selectedOption.dataset.icon}')`;
});

// listener for extract html text button// listener for extract html text button
extractHtmlTextBtn.addEventListener("click", async function () {
  try {
    if (!chrome.scripting) {
      throw new Error("chrome.scripting API is not available");
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error("No active tab found");
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const bodyText = document.body.innerText;
        return bodyText.replace(/\s+/g, ' ').trim();
      },
    });

    if (!result || result.length === 0) {
      throw new Error("Script execution failed");
    }

    const htmlText = result[0].result;
    promptInput.value = htmlText;
  } catch (error) {
    console.error("Error extracting text from HTML:", error);
    handleError(error);
  }
});

// Helper Functions

function updatePromptTypeSelectIcon() {
  const select = document.getElementById('promptTypeSelect');
  const selectedOption = select.options[select.selectedIndex];
  const icon = selectedOption.getAttribute('data-icon');
  select.style.backgroundImage = `url('${icon}')`;
}

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
    promptInput.value = response.text;
  });
}
function checkApiKeysAndPulsate() {
  chrome.storage.sync.get(['ANTHROPIC_API_KEY', 'AKASH_API_KEY'], function(result) {
      const settingsButton = document.getElementById('settingsButton');
      if (!result.ANTHROPIC_API_KEY && !result.AKASH_API_KEY) {
          settingsButton.classList.add('pulsate');
      } else {
          settingsButton.classList.remove('pulsate');
      }
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
  promptAnswerDiv.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
  const spinnerContainer = promptAnswerDiv.querySelector('.spinner-container');
  spinnerContainer.style.display = 'flex';
  spinnerContainer.style.justifyContent = 'center';
  spinnerContainer.style.alignItems = 'center';
  spinnerContainer.style.height = '100%';
  spinnerContainer.style.width = '100%';
  spinnerContainer.style.padding = '5px';
  spinnerContainer.style.padding = '20px 5px 5px 5px';
  spinnerContainer.style.opacity = '0';
  spinnerContainer.style.transition = 'opacity 0.5s ease-in-out';
  setTimeout(() => {
    spinnerContainer.style.opacity = '1';
  }, 50);
  return {
    hide: () => {
      spinnerContainer.style.opacity = '0';
      return new Promise(resolve => setTimeout(() => {
        promptAnswerDiv.innerHTML = '';
        resolve();
      }, 500));
    }
  };
}

function displayPromptAnswer(promptAnswer) {
  promptAnswerDiv.innerHTML = '';
  const answerElement = document.createElement('div');
  answerElement.innerHTML = promptAnswer;
  promptAnswerDiv.appendChild(answerElement);
}

function renderPoweredByProp() {
  poweredByProp.innerHTML = '';
  const answerElement = document.createElement('div');

  answerElement.style.display = 'flex';
  answerElement.style.justifyContent = 'center';
  answerElement.style.alignItems = 'center';

  const selectedAPI = getSelectedAPI();
  if (selectedAPI === 'akash') {
    const link = document.createElement('a');
    link.href = 'https://akash.network/';
    link.target = '_blank';
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';
    link.style.display = 'flex';
    link.style.alignItems = 'center';

    const logo = document.createElement('img');
    logo.src = 'resources/akash_small_icon.jpg';
    logo.alt = 'Akash Logo';
    logo.style.width = '20px';
    logo.style.marginLeft = '5px';
    logo.style.verticalAlign = 'middle';

    const titleSpan = document.createElement('span');
    titleSpan.textContent = "Powered by Akash Network";
    
    link.appendChild(titleSpan);
    link.appendChild(logo);
    answerElement.appendChild(link);
  } else if (selectedAPI === 'claude') {
    const link = document.createElement('a');
    link.href = 'https://www.anthropic.com/';
    link.target = '_blank';
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';
    link.style.display = 'flex';
    link.style.alignItems = 'center';

    const logo = document.createElement('img');
    logo.src = 'resources/anthropic_small_icon.jpg';
    logo.alt = 'Claude Logo';
    logo.style.width = '20px';
    logo.style.marginLeft = '5px';
    logo.style.verticalAlign = 'middle';

    const titleSpan = document.createElement('span');
    titleSpan.textContent = "Powered by Claude";
    
    link.appendChild(titleSpan);
    link.appendChild(logo);
    answerElement.appendChild(link);
  }

  answerElement.style.opacity = '0';
  answerElement.style.transition = 'opacity 0.5s ease-in';
  poweredByProp.appendChild(answerElement);

  setTimeout(() => {
    answerElement.style.opacity = '1';
  }, 50);
}
function displayError(message) {
  promptAnswerDiv.textContent = "Error: " + message;
}

function handleError(error) {
  console.error("Error:", error);
  displayError(error.message);
}

async function promptClaude(text, claudeModel) {
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: claudeModel,
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
    throw new Error("Failed to prompt Claude: " + error.message);
  }
}

async function promptAkash(text, akashModel) {
  console.log("Entering promptAkash function");
  console.log("Input text:", text);
  console.log("Selected Akash model:", akashModel);
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AKASH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: akashModel,
        messages: [{ role: "user", content: text }],
        max_tokens: 1024,
      }),
    };

    console.log("Request options:", JSON.stringify(requestOptions, null, 2));

    const response = await fetch(AKASH_API_URL, requestOptions);
    console.log("API response status:", response.status);
    if (!response.ok) {
      throw new Error(
        `Akash API request failed with status ${response.status}`
      );
    }
    const data = await response.json();
    console.log("API response data:", JSON.stringify(data, null, 2));

    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error("Invalid Akash API response format");
    }
    const result = data.choices[0].message.content.replace(/\n/g, "<br>");
    console.log("Processed result:", result);
    return result;
  } catch (error) {
    console.error("Error in promptAkash:", error);
    throw new Error("Failed to prompt Akash: " + error.message);
  } finally {
    console.log("Exiting promptAkash function");
  }
}

async function promptAI(text) {
  console.log("Entering promptAI function");
  const selectedAPI = getSelectedAPI();
  console.log(`Selected API: ${selectedAPI}`);

  try {
    if (selectedAPI === "claude") {
      console.log("Using Claude API");
      const claudeModel = document.getElementById("claudeModelSelect").value;
      return await promptClaude(text, claudeModel);
    } else if (selectedAPI === "akash") {
      console.log("Using Akash API");
      const akashModel = document.getElementById("akashModelSelect").value;
      return await promptAkash(text, akashModel);
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
    const promptAnswer = await promptAI(
      "Summarise with the most detail possible:   " + transcript
    );
    console.log("promptAnswer received from Claude, length:", promptAnswer.length);
    displayPromptAnswer(promptAnswer);
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
  const text = elements.promptInput.value.trim();
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
