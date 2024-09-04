document.addEventListener('DOMContentLoaded', function() {
    // Load saved API keys
    chrome.storage.sync.get(['ANTHROPIC_API_KEY', 'AKASH_API_KEY', 'OPENROUTER_API_KEY'], function(result) {
    document.getElementById('anthropic-api-key').value = result.ANTHROPIC_API_KEY || '';
    document.getElementById('akash-api-key').value = result.AKASH_API_KEY || '';
    document.getElementById('openrouter-api-key').value = result.OPENROUTER_API_KEY || '';
    });
    
    // Save API keys when the save button is clicked
    document.getElementById('save-button').addEventListener('click', function() {
    let anthropicKey = document.getElementById('anthropic-api-key').value;
    let akashKey = document.getElementById('akash-api-key').value;
    let openrouterKey = document.getElementById('openrouter-api-key').value;
    
    chrome.storage.sync.set({
    ANTHROPIC_API_KEY: anthropicKey,
    AKASH_API_KEY: akashKey,
    OPENROUTER_API_KEY: openrouterKey
    }, function() {
    alert('API keys saved');
    });
    });
    
// Clear all Chrome storage when the clear button is clicked
document.getElementById('clear-button').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all Chrome storage? This action cannot be undone.')) {
        chrome.storage.sync.clear(function() {
            alert('All Chrome storage cleared');
            // Clear input fields
            document.getElementById('anthropic-api-key').value = '';
            document.getElementById('akash-api-key').value = '';
            document.getElementById('openrouter-api-key').value = '';
        });
    }
});

    });