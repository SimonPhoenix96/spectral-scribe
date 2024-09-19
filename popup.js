// Constants
const YT_INITIAL_PLAYER_RESPONSE_RE =
  /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;

let OPENROUTER_API_KEY = "";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

let ANTHROPIC_API_KEY = "";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

let AKASH_API_KEY = "";
const AKASH_API_URL = "https://chatapi.akash.network/api/v1/chat/completions";
// DOM Elements
const summarizeBtn = document.getElementById("summarizeBtn");
const promptAnswerDiv = document.getElementById("promptAnswer");
const poweredByProp = document.getElementById("poweredByProp");
const promptInput = document.getElementById("promptInput");
const autoTranscribeAndSummarizeBtn = document.getElementById(
  "autoTranscribeAndSummarize"
);
const processPromptBtn = document.getElementById("processPromptBtn");
const extractTranscriptBtn = document.getElementById("extractTranscriptBtn");
const extractHtmlTextBtn = document.getElementById("extractHtmlTextBtn");
const promptTypeSelect = document.getElementById("promptTypeSelect");
const apiSelect = document.getElementById("apiSelect");
const optionsLink = document.getElementById("optionsLink");

// Main Functions

function loadApiKeys(callback) {
  console.log("Starting to load API keys");
  chrome.storage.sync.get(
    ["ANTHROPIC_API_KEY", "AKASH_API_KEY", "OPENROUTER_API_KEY"],
    function (result) {
      console.log("Retrieved API keys from storage");
      ANTHROPIC_API_KEY = result.ANTHROPIC_API_KEY || "";
      AKASH_API_KEY = result.AKASH_API_KEY || "";
      OPENROUTER_API_KEY = result.OPENROUTER_API_KEY || "";
      console.log("ANTHROPIC_API_KEY set:", ANTHROPIC_API_KEY ? "Yes" : "No");
      console.log("AKASH_API_KEY set:", AKASH_API_KEY ? "Yes" : "No");
      console.log("OPENROUTER_API_KEY set:", OPENROUTER_API_KEY ? "Yes" : "No");
      checkApiKeysAndPulsate();
      callback();
      console.log("Callback executed");
    }
  );
}

function getSelectedAPI() {
  const apiSelect = document.getElementById("apiSelect");
  return apiSelect.value; // 'claude' or 'akash'
}

// Event Listeners
// Event listener that gets triggers as soon as popup closes
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") {
    saveSessionData();
  }
});

// Event listener that gets triggers as soon as popup loads
//TODO: adapt when needed
document.addEventListener("DOMContentLoaded", function () {
  loadApiKeys(function () {});
  document.getElementById("promptInput").focus();
  renderPoweredByProp();
  updatePlaceholder();
  loadCustomPrompts();
  loadSessionData();
  updatePromptTypeSelectIcon();
});

const clearButton = document.getElementById("clearButton");
clearButton.addEventListener("click", () => {
  promptInput.value = "";
  promptAnswerDiv.innerHTML = "";
  const promptTitle = document.querySelector("h3");
  if (promptTitle) {
    promptTitle.remove();
  }
});

document
  .getElementById("promptTypeSelect")
  .addEventListener("change", updatePromptTypeSelectIcon);

document.getElementById("apiSelect").addEventListener("change", function () {
  const selectedAPI = this.value;
  const akashModelSelect = document.getElementById("akashModelSelect");
  const claudeModelSelect = document.getElementById("claudeModelSelect");
  const openrouterModelSelect = document.getElementById(
    "openrouterModelSelect"
  );

  akashModelSelect.style.display = "none";
  claudeModelSelect.style.display = "none";
  openrouterModelSelect.style.display = "none";

  if (selectedAPI === "akash") {
    akashModelSelect.style.display = "inline-block";
  } else if (selectedAPI === "claude") {
    claudeModelSelect.style.display = "inline-block";
  } else if (selectedAPI === "openrouter") {
    openrouterModelSelect.style.display = "inline-block";
  }

  renderPoweredByProp();
});

optionsLink.addEventListener("click", function (e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// TODO: finish implementation of last few added cases
function processPrompt() {
  const selectedOption = promptTypeSelect.value;
  const textInput = promptInput.value.trim();
  console.log("Selected option:", selectedOption);
  try {
    console.log("Showing loading spinner");
    displayPromptTypeTitle();
    showLoadingSpinner();

    // Check if it's a custom prompt
    chrome.storage.sync.get("customPrompts", (result) => {
      const customPrompts = result.customPrompts || {};
      if (customPrompts[selectedOption]) {
        // It's a custom prompt
        const customInstruction = customPrompts[selectedOption];
        return promptAI(customInstruction + ": " + textInput);
      } else {
        // It's a predefined prompt
        switch (selectedOption) {
          case "manualPrompt":
            console.log("Handling manual prompt");
            return promptAI(textInput);
          case "bulletPoints":
            console.log("Handling bullet points");
            return promptAI("Generate bullet points for this: " + textInput);
          case "keyInsights":
            console.log("Handling key insights");
            promptInput.placeholder = "Enter the text to extract key insights";
            return promptAI(
              "Extract key insights from this text: " + textInput
            );
          case "explainSimply":
            console.log("Handling explain simply");
            promptInput.placeholder = "Enter the text to explain simply";
            return promptAI("Explain this simply: " + textInput);
          case "topicAnalysis":
            console.log("Handling topic analysis");
            promptInput.placeholder = "Enter the text for topic analysis";
            return promptAI(
              "Analyze the main topics in this text: " + textInput
            );
          case "sentimentAnalysis":
            console.log("Handling sentiment analysis");
            promptInput.placeholder = "Enter the text for sentiment analysis";
            return promptAI("Analyze the sentiment of this text: " + textInput);
          case "keywordExtraction":
            console.log("Handling keyword extraction");
            promptInput.placeholder = "Enter the text for keyword extraction";
            return promptAI(
              "Extract the key words from this text: " + textInput
            );
          case "languageTranslation":
            console.log("Handling language translation");
            promptInput.placeholder = "Enter the text to translate";
            return promptAI(
              "Translate this text to English if it's not already in English: " +
                textInput
            );
          case "summarizeText":
            console.log("Handling summarizeText");
            promptInput.placeholder = "Paste your text here to summarize";
            return promptAI("Summarize this text: " + textInput);
          case "generateQuiz":
            console.log("Handling quiz generation");
            promptInput.placeholder =
              "Enter a topic to generate a quiz about it";
            return promptAI("Generate a quiz about this topic: " + textInput);
          case "explainLikeImFive":
            console.log("Handling ELI5 explanations");
            promptInput.placeholder =
              "Enter a complex topic to explain like I'm five";
            return promptAI(
              "Explain this topic as if I'm five years old: " + textInput
            );
          case "findLogicalFallacies":
            console.log("Handling logical fallacy detection");
            promptInput.placeholder =
              "Enter an argument to identify potential logical fallacies";
            return promptAI(
              "Identify potential logical fallacies in this argument: " +
                textInput
            );
          case "generateAnalogy":
            console.log("Handling analogy generation");
            promptInput.placeholder =
              "Enter a concept to create an analogy for it";
            return promptAI("Create an analogy for this concept: " + textInput);
          case "historicalContext":
            console.log("Handling historical context explanation");
            promptInput.placeholder =
              "Enter a historical event for context and analysis";
            return promptAI(
              "Provide historical context and analysis for this event: " +
                textInput
            );
          case "generateEssayOutline":
            console.log("Handling essay outline generation");
            promptInput.placeholder =
              "Enter an essay topic to generate an outline";
            return promptAI(
              "Generate an essay outline for this topic: " + textInput
            );
          case "generateProductSheet":
            console.log("Handling product sheet generation");
            promptInput.placeholder =
              "Enter product details to generate a product sheet";
            return promptAI(
              "Generate a product sheet based on these details: " + textInput
            );
          case "timeManagement":
            console.log("Handling time management");
            promptInput.placeholder =
              "Describe your daily tasks for time management suggestions";
            return promptAI(
              "Provide time management suggestions for these daily tasks: " +
                textInput
            );
          case "recipeSuggestions":
            console.log("Handling recipe suggestions");
            promptInput.placeholder =
              "Enter ingredients or dietary preferences for recipe ideas";
            return promptAI(
              "Suggest recipes based on these ingredients or dietary preferences: " +
                textInput
            );
          case "summarizeThread":
            console.log("Handling Summarize thread");
            promptInput.placeholder = "Enter thread text to summarize";
            return promptAI("Summarize this thread: " + textInput);
          case "checkIfAIGenerated":
            console.log("Handling AI-generated content check");
            promptInput.placeholder =
              "Enter text to check if it's AI-generated";
            return promptAI(
              "Analyze this text and determine if it's likely to be AI-generated: " +
                textInput
            );
          case "findBotPosts":
            console.log("Handling bot post detection");
            promptInput.placeholder =
              "Enter text to identify potential bot posts";
            return promptAI(
              "Analyze this text and identify potential bot-generated posts: " +
                textInput
            );

          case "findTrollPosts":
            console.log("Handling troll post detection");
            promptInput.placeholder =
              "Enter text to identify potential troll posts";
            return promptAI(
              "Analyze this text and identify potential troll posts: " +
                textInput
            );

          case "findMisinformation":
            console.log("Handling misinformation detection");
            promptInput.placeholder =
              "Enter text to check for potential misinformation";
            return promptAI(
              "Analyze this text and identify potential misinformation: " +
                textInput
            );

          case "findSourcestoClaims":
            console.log("Handling source finding for claims");
            promptInput.placeholder = "Enter claims to find potential sources";
            return promptAI(
              "*BE UNBIASED* Analyze these claims and suggest potential sources or references: " +
                textInput
            );
          default:
            console.log("Handling default case");
            return promptAI(textInput);
        }
      }
    });
  } catch (error) {
    console.error("Error in processText:", error);
    handleError(error);
  }
}

function updatePlaceholder() {
  const selectedValue = promptTypeSelect.value;

  chrome.storage.sync.get("customPrompts", (result) => {
    const customPrompts = result.customPrompts || {};

    if (customPrompts[selectedValue]) {
      promptInput.placeholder = customPrompts[selectedValue];
    } else {
      switch (selectedValue) {
        case "manualPrompt":
          promptInput.placeholder = "Enter your manual prompt here";
          break;
        case "autoTranscribeAndSummarize":
          promptInput.placeholder =
            "Will fetch the transcript from the current YouTube video and summarise it";
          break;
        case "bulletPoints":
          promptInput.placeholder = "Enter the text to generate bullet points";
          break;
        case "keyInsights":
          promptInput.placeholder = "Enter the text to extract key insights";
          break;
        case "explainSimply":
          promptInput.placeholder = "Enter the text to explain simply";
          break;
        case "topicAnalysis":
          promptInput.placeholder = "Enter the text for topic analysis";
          break;
        case "sentimentAnalysis":
          promptInput.placeholder = "Enter the text for sentiment analysis";
          break;
        case "keywordExtraction":
          promptInput.placeholder = "Enter the text for keyword extraction";
          break;
        case "languageTranslation":
          promptInput.placeholder = "Enter the text to translate";
          break;
        case "summarizeText":
          promptInput.placeholder = "Paste your text here to summarize";
          break;
        case "generateQuiz":
          promptInput.placeholder = "Enter a topic to generate a quiz about it";
          break;
        case "explainLikeImFive":
          promptInput.placeholder =
            "Enter a complex topic to explain like I'm five";
          break;
        case "findLogicalFallacies":
          promptInput.placeholder =
            "Enter an argument to identify potential logical fallacies";
          break;
        case "generateAnalogy":
          promptInput.placeholder =
            "Enter a concept to create an analogy for it";
          break;
        case "historicalContext":
          promptInput.placeholder =
            "Enter a historical event for context and analysis";
          break;
        case "generateEssayOutline":
          promptInput.placeholder =
            "Enter an essay topic to generate an outline";
          break;
        case "generateProductSheet":
          promptInput.placeholder =
            "Enter product details to generate a product sheet";
          break;
        case "timeManagement":
          promptInput.placeholder =
            "Describe your daily tasks for time management suggestions";
          break;
        case "recipeSuggestions":
          promptInput.placeholder =
            "Enter ingredients or dietary preferences for recipe ideas";
          break;
        case "summarizeThread":
          promptInput.placeholder = "Enter the thread text to summarize";
          break;
        case "checkIfAIGenerated":
          promptInput.placeholder = "Enter text to check if it's AI-generated";
          break;
        case "findBotPosts":
          promptInput.placeholder =
            "Enter text to identify potential bot posts";
          break;
        case "findTrollPosts":
          promptInput.placeholder =
            "Enter text to identify potential troll posts";
          break;
        case "findMisinformation":
          promptInput.placeholder =
            "Enter text to check for potential misinformation";
          break;
        case "findSourcestoClaims":
          promptInput.placeholder = "Enter claims to find potential sources";
          break;
        default:
          promptInput.placeholder = "Enter your text here";
      }
    }
  });
}

processPromptBtn.addEventListener("click", processPrompt);

promptTypeSelect.addEventListener("change", updatePlaceholder);

document.addEventListener("keydown", function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    processPrompt();
  }
});

// customprompt listener
const promptSettingsBtn = document.getElementById("promptSettingsBtn");

promptSettingsBtn.addEventListener("click", openPromptSettingsPopup);

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
document.getElementById("apiSelect").addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  this.style.backgroundImage = `url('${selectedOption.dataset.icon}')`;
});

// listener for extract html text button// listener for extract html text button
extractHtmlTextBtn.addEventListener("click", async function () {
  try {
    if (!chrome.scripting) {
      throw new Error("chrome.scripting API is not available");
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab) {
      throw new Error("No active tab found");
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const bodyText = document.body.innerText;
        return bodyText.replace(/\s+/g, " ").trim();
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

// Add this with your other constant declarations at the top
const copyButton = document.getElementById("copyButton");

// Add this event listener with your other event listeners
copyButton.addEventListener("click", copyPromptAnswer);

// Add this function to your existing code
function copyPromptAnswer() {
  const promptAnswerText = promptAnswerDiv.innerText;

  if (promptAnswerText) {
    navigator.clipboard
      .writeText(promptAnswerText)
      .then(() => {
        // Temporarily change button text to indicate successful copy
        const originalText = copyButton.textContent;
        setTimeout(() => {
          copyButton.textContent = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy text. Please try again.");
      });
  } else {
    alert("There is no text to copy.");
  }
}

// Helper Functions
function loadCustomPrompts() {
  chrome.storage.sync.get("customPrompts", (result) => {
    const customPrompts = result.customPrompts || {};
    const firstDefaultOption = promptTypeSelect.firstChild;

    for (const [value, instruction] of Object.entries(customPrompts)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      option.dataset.icon = "resources/custom_prompt_icon.png";
      promptTypeSelect.insertBefore(option, firstDefaultOption);
    }

    updatePromptTypeSelectIcon();
  });
}

function populateCustomPromptSelect() {
  customPromptSelect.innerHTML = ""; // Clear existing options
  chrome.storage.sync.get("customPrompts", (result) => {
    const customPrompts = result.customPrompts || {};
    for (const [value, instruction] of Object.entries(customPrompts)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      customPromptSelect.appendChild(option);
    }
  });
}
function removeCustomPrompt(name) {
  chrome.storage.sync.get("customPrompts", (result) => {
    const customPrompts = result.customPrompts || {};
    const promptKey = Object.keys(customPrompts).find(
      (key) =>
        key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) === name
    );

    if (promptKey) {
      delete customPrompts[promptKey];
      chrome.storage.sync.set({ customPrompts }, () => {
        console.log("Custom prompt removed");
        // Remove the option from both select elements
        removeOptionFromSelect(promptTypeSelect, name);
        removeOptionFromSelect(customPromptSelect, name);
        updatePromptTypeSelectIcon();
      });
    } else {
      console.error("Custom prompt not found in storage");
      alert("Custom prompt not found in storage.");
    }
  });
}

function removeOptionFromSelect(selectElement, optionText) {
  const optionToRemove = Array.from(selectElement.options).find(
    (option) => option.textContent === optionText
  );
  if (optionToRemove) {
    selectElement.removeChild(optionToRemove);
  }
}

function addCustomPrompt(name, instruction) {
  const option = document.createElement("option");
  option.value = name.toLowerCase().replace(/\s+/g, "_");
  option.textContent = name;
  option.dataset.icon = "resources/label.png";

  // Find the position to insert the new custom prompt
  const firstDefaultOption = Array.from(promptTypeSelect.options).find(
    (opt) => !opt.value.startsWith("custom_")
  );

  if (firstDefaultOption) {
    promptTypeSelect.insertBefore(option, firstDefaultOption);
  } else {
    promptTypeSelect.appendChild(option);
  }

  // Save custom prompt to storage
  chrome.storage.sync.get("customPrompts", (result) => {
    const customPrompts = result.customPrompts || {};
    customPrompts[option.value] = instruction;
    chrome.storage.sync.set({ customPrompts }, () => {
      console.log("Custom prompt saved");

      // Update the custom prompt select if it exists
      const customPromptSelect = document.getElementById("customPromptSelect");
      if (customPromptSelect) {
        const newOption = document.createElement("option");
        newOption.value = option.value;
        newOption.textContent = option.textContent;
        customPromptSelect.appendChild(newOption);
      }
      // Update the icon
      updatePromptTypeSelectIcon();
    });
  });
}

function openPromptSettingsPopup() {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(43, 43, 43, 0.9)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  const form = document.createElement("form");
  form.style.backgroundColor = "#f5f5dc";
  form.style.padding = "20px";
  form.style.borderRadius = "5px";
  form.style.color = "#000000";
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "10px";

  // Add 'X' button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Click Background to cancel";
  closeButton.style.position = "absolute";
  closeButton.style.bottom = "10px";
  closeButton.style.right = "10px";
  closeButton.style.backgroundColor = "transparent";
  closeButton.style.border = "none";
  closeButton.style.fontSize = "20px";
  closeButton.style.cursor = "pointer";
  closeButton.style.color = "#fa2b39";
  closeButton.style.zIndex = "1000";
  modal.appendChild(closeButton);

  const actionSelect = document.createElement("select");
  actionSelect.style.padding = "5px";
  actionSelect.style.borderRadius = "3px";
  actionSelect.style.border = "1px solid #fa2b39";
  actionSelect.style.backgroundColor = "#ffffff";
  actionSelect.style.color = "#000000";
  actionSelect.style.marginBottom = "10px";

  const addOption = document.createElement("option");
  addOption.value = "add";
  addOption.textContent = "Add Custom Prompt";
  actionSelect.appendChild(addOption);

  const removeOption = document.createElement("option");
  removeOption.value = "remove";
  removeOption.textContent = "Remove Custom Prompt";
  actionSelect.appendChild(removeOption);

  form.appendChild(actionSelect);

  const customPromptSelect = document.createElement("select");
  customPromptSelect.style.padding = "5px";
  customPromptSelect.style.borderRadius = "3px";
  customPromptSelect.style.border = "1px solid #fa2b39";
  customPromptSelect.style.backgroundColor = "#ffffff";
  customPromptSelect.style.color = "#000000";
  customPromptSelect.style.display = "none";
  form.appendChild(customPromptSelect);

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Enter prompt name";
  nameInput.required = true;
  nameInput.style.padding = "5px";
  nameInput.style.borderRadius = "3px";
  nameInput.style.border = "1px solid #fa2b39";
  nameInput.style.backgroundColor = "#ffffff";
  nameInput.style.color = "#000000";
  form.appendChild(nameInput);

  const instructionInput = document.createElement("textarea");
  instructionInput.placeholder =
    "Example: \n\nIn Spanish - Generate a product sheet";
  instructionInput.required = true;
  instructionInput.style.padding = "5px";
  instructionInput.style.borderRadius = "3px";
  instructionInput.style.border = "1px solid #fa2b39";
  instructionInput.style.backgroundColor = "#ffffff";
  instructionInput.style.color = "#000000";
  instructionInput.style.minHeight = "100px";
  form.appendChild(instructionInput);

  const submitButton = document.createElement("button");
  submitButton.textContent = "Add Custom Prompt";
  submitButton.style.backgroundColor = "#fa2b39";
  submitButton.style.color = "#ffffff";
  submitButton.style.border = "none";
  submitButton.style.padding = "10px";
  submitButton.style.borderRadius = "3px";
  submitButton.style.cursor = "pointer";
  form.appendChild(submitButton);

  modal.appendChild(form);
  document.body.appendChild(modal);

  // Populate custom prompt select
  chrome.storage.sync.get("customPrompts", (result) => {
    const customPrompts = result.customPrompts || {};
    for (const [value, instruction] of Object.entries(customPrompts)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      customPromptSelect.appendChild(option);
    }
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  closeButton.addEventListener("click", function (e) {
    e.preventDefault();
    document.body.removeChild(modal);
  });

  actionSelect.addEventListener("change", function () {
    if (this.value === "add") {
      nameInput.style.display = "block";
      instructionInput.style.display = "block";
      customPromptSelect.style.display = "none";
      submitButton.textContent = "Add Custom Prompt";

      // Remove required attribute when hidden
      customPromptSelect.removeAttribute("required");
      nameInput.setAttribute("required", "");
      instructionInput.setAttribute("required", "");
    } else if (this.value === "remove") {
      nameInput.style.display = "none";
      instructionInput.style.display = "none";
      customPromptSelect.style.display = "block";
      submitButton.textContent = "Remove Custom Prompt";

      // Remove required attribute when hidden
      nameInput.removeAttribute("required");
      instructionInput.removeAttribute("required");
      customPromptSelect.setAttribute("required", "");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (actionSelect.value === "add") {
      if (nameInput.value && instructionInput.value) {
        addCustomPrompt(nameInput.value, instructionInput.value);
        document.body.removeChild(modal);
      } else {
        alert("Please fill in all fields");
      }
    } else if (actionSelect.value === "remove") {
      if (customPromptSelect.value) {
        removeCustomPrompt(
          customPromptSelect.options[customPromptSelect.selectedIndex].text
        );
        document.body.removeChild(modal);
      } else {
        alert("Please select a prompt to remove");
      }
    }
  });
}

function saveSessionData() {
  const data = {
    selectedAPI: document.getElementById("apiSelect").value,
    selectedPromptType: document.getElementById("promptTypeSelect").value,
    selectedAkashModel: document.getElementById("akashModelSelect").value,
    selectedClaudeModel: document.getElementById("claudeModelSelect").value,
    selectedOpenRouterModel: document.getElementById("openrouterModelSelect")
      .value,
    input: document.getElementById("promptInput").value,
    answer: document.getElementById("promptAnswer").innerHTML,
  };

  chrome.storage.local.set({ sessionData: data }, function () {
    console.log("Session data saved");
  });
}

function loadSessionData() {
  chrome.storage.local.get(["sessionData"], function (result) {
    if (result.sessionData) {
      document.getElementById("apiSelect").value =
        result.sessionData.selectedAPI;
      document.getElementById("promptTypeSelect").value =
        result.sessionData.selectedPromptType;

      const akashModelSelect = document.getElementById("akashModelSelect");
      const claudeModelSelect = document.getElementById("claudeModelSelect");
      const openrouterModelSelect = document.getElementById(
        "openrouterModelSelect"
      );

      akashModelSelect.style.display = "none";
      claudeModelSelect.style.display = "none";
      openrouterModelSelect.style.display = "none";

      if (result.sessionData.selectedAPI === "akash") {
        akashModelSelect.style.display = "block";
        if (result.sessionData.selectedAkashModel) {
          akashModelSelect.value = result.sessionData.selectedAkashModel;
        }
      } else if (result.sessionData.selectedAPI === "claude") {
        claudeModelSelect.style.display = "block";
        if (result.sessionData.selectedClaudeModel) {
          claudeModelSelect.value = result.sessionData.selectedClaudeModel;
        }
      } else if (result.sessionData.selectedAPI === "openrouter") {
        openrouterModelSelect.style.display = "block";
        if (result.sessionData.selectedOpenRouterModel) {
          openrouterModelSelect.value =
            result.sessionData.selectedOpenRouterModel;
        }
      }

      document.getElementById("promptInput").value = result.sessionData.input;
      document.getElementById("promptAnswer").innerHTML =
        result.sessionData.answer;

      // Apply the saved API icon
      const apiSelect = document.getElementById("apiSelect");
      const selectedOption = apiSelect.options[apiSelect.selectedIndex];
      if (selectedOption && selectedOption.getAttribute("data-icon")) {
        apiSelect.style.backgroundImage = `url('${selectedOption.getAttribute(
          "data-icon"
        )}')`;
      }

      updatePromptTypeSelectIcon();
      renderPoweredByProp();
    }
  });
}

function saveInputAndAnswer() {
  chrome.storage.local.set(
    {
      savedPromptInput: promptInput.value,
      savedPromptAnswer: promptAnswerDiv.innerHTML,
    },
    function () {
      console.log("Input and answer saved");
    }
  );
}

function loadInputAndAnswer() {
  chrome.storage.local.get(
    ["savedPromptInput", "savedPromptAnswer"],
    function (result) {
      if (result.savedPromptInput) {
        promptInput.value = result.savedPromptInput;
      }
      if (result.savedPromptAnswer) {
        if (result.savedPromptAnswer.toLowerCase().includes("error:")) {
          promptAnswerDiv.innerHTML = "";
        } else {
          promptAnswerDiv.innerHTML = result.savedPromptAnswer;
        }
      }
    }
  );
}
function updatePromptTypeSelectIcon() {
  const select = document.getElementById("promptTypeSelect");
  const selectedOption = select.options[select.selectedIndex];
  const icon = selectedOption.getAttribute("data-icon");
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
  if (ANTHROPIC_API_KEY || AKASH_API_KEY || OPENROUTER_API_KEY) {
    console.log("At least one API key is set, removing pulsate class");
    optionsLink.classList.remove("pulsate");
  } else {
    console.warn("No API keys are set, adding pulsate class");
    optionsLink.classList.add("pulsate");
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
  promptAnswerDiv.innerHTML =
    '<div class="spinner-container"><div class="spinner"></div></div>';
  const spinnerContainer = promptAnswerDiv.querySelector(".spinner-container");
  spinnerContainer.style.display = "flex";
  spinnerContainer.style.justifyContent = "center";
  spinnerContainer.style.alignItems = "center";
  spinnerContainer.style.height = "100%";
  spinnerContainer.style.width = "100%";
  spinnerContainer.style.padding = "5px";
  spinnerContainer.style.padding = "20px 5px 5px 5px";
  spinnerContainer.style.opacity = "0";
  spinnerContainer.style.transition = "opacity 0.5s ease-in-out";
  setTimeout(() => {
    spinnerContainer.style.opacity = "1";
  }, 50);
  return {
    hide: () => {
      spinnerContainer.style.opacity = "0";
      return new Promise((resolve) =>
        setTimeout(() => {
          promptAnswerDiv.innerHTML = "";
          resolve();
        }, 500)
      );
    },
  };
}

function displayPromptAnswer(promptAnswer) {
  promptAnswerDiv.innerHTML = "";

  const answerElement = document.createElement("div");
  answerElement.innerHTML = promptAnswer;
  answerElement.style.paddingTop = "10px"; // add top padding
  promptAnswerDiv.appendChild(answerElement);
  displayPromptTypeTitle();
}
function displayPromptTypeTitle() {
  // Remove existing prompt title if it exists
  const existingTitle = document.querySelector("h3.prompt-type-title");
  if (existingTitle) {
    existingTitle.remove();
  }

  const titleElement = document.createElement("h3");
  titleElement.textContent =
    promptTypeSelect.options[promptTypeSelect.selectedIndex].text;
  titleElement.style.color = "#fa2b39";
  titleElement.style.textAlign = "center";
  titleElement.style.margin = "0";
  titleElement.style.paddingTop = "10px";
  titleElement.classList.add("prompt-type-title"); // Add a class for easy identification
  poweredByProp.insertAdjacentElement("afterend", titleElement);
}

function renderPoweredByProp() {
  poweredByProp.innerHTML = "";
  const answerElement = document.createElement("div");

  answerElement.style.display = "flex";
  answerElement.style.justifyContent = "center";
  answerElement.style.alignItems = "center";

  const selectedAPI = getSelectedAPI();
  if (selectedAPI === "akash") {
    const link = document.createElement("a");
    link.href = "https://akash.network/";
    link.target = "_blank";
    link.style.textDecoration = "none";
    link.style.color = "inherit";
    link.style.display = "flex";
    link.style.alignItems = "center";

    const logo = document.createElement("img");
    logo.src = "resources/akash_small_icon.jpg";
    logo.alt = "Akash Logo";
    logo.style.width = "20px";
    logo.style.marginLeft = "5px";
    logo.style.verticalAlign = "middle";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = "Powered by Akash Network";

    link.appendChild(titleSpan);
    link.appendChild(logo);
    answerElement.appendChild(link);
  } else if (selectedAPI === "claude") {
    const link = document.createElement("a");
    link.href = "https://www.anthropic.com/";
    link.target = "_blank";
    link.style.textDecoration = "none";
    link.style.color = "inherit";
    link.style.display = "flex";
    link.style.alignItems = "center";

    const logo = document.createElement("img");
    logo.src = "resources/anthropic_small_icon.jpg";
    logo.alt = "Claude Logo";
    logo.style.width = "20px";
    logo.style.marginLeft = "5px";
    logo.style.verticalAlign = "middle";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = "Powered by Claude";

    link.appendChild(titleSpan);
    link.appendChild(logo);
    answerElement.appendChild(link);
  } else if (selectedAPI === "openrouter") {
    const link = document.createElement("a");
    link.href = "https://openrouter.ai/";
    link.target = "_blank";
    link.style.textDecoration = "none";
    link.style.color = "inherit";
    link.style.display = "flex";
    link.style.alignItems = "center";

    const logo = document.createElement("img");
    logo.src = "resources/openrouter_small_icon.jpg";
    logo.alt = "OpenRouter Logo";
    logo.style.width = "20px";
    logo.style.marginLeft = "5px";
    logo.style.verticalAlign = "middle";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = "Powered by OpenRouter";

    link.appendChild(titleSpan);
    link.appendChild(logo);
    answerElement.appendChild(link);
  }

  answerElement.style.opacity = "0";
  answerElement.style.transition = "opacity 0.5s ease-in";
  poweredByProp.appendChild(answerElement);

  setTimeout(() => {
    answerElement.style.opacity = "1";
  }, 50);
}
function displayError(message) {
  promptAnswerDiv.textContent = "Error: " + message;
}

function handleError(error) {
  console.error("Error:", error);
  displayError(error.message);
}

async function promptAI(text) {
  console.log("Entering promptAI function");
  promptAnswerDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  const selectedAPI = getSelectedAPI();
  console.log(`Selected API: ${selectedAPI}`);

  try {
    let result;
    if (selectedAPI === "claude") {
      console.log("Using Claude API");
      const claudeModel = document.getElementById("claudeModelSelect").value;
      result = await promptClaude(text, claudeModel);
    } else if (selectedAPI === "akash") {
      console.log("Using Akash API");
      const akashModel = document.getElementById("akashModelSelect").value;
      result = await promptAkash(text, akashModel);
    } else if (selectedAPI === "openrouter") {
      console.log("Using OpenRouter API");
      const openrouterModel = document.getElementById(
        "openrouterModelSelect"
      ).value;
      result = await promptOpenRouter(text, openrouterModel);
    } else {
      throw new Error("Invalid API selected");
    }

    const formattedResult = result.replace(/\n/g, "<br>");
    displayPromptAnswer(formattedResult);
    return formattedResult;
  } catch (error) {
    console.error("Error in promptAI:", error);
    displayError(error.message);
    throw error;
  } finally {
    console.log("Exiting promptAI function");
  }
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

async function promptOpenRouter(prompt, openrouterModel) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not set");
  }

  const model = document.getElementById("openrouterModelSelect").value;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
