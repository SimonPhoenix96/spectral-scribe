document.addEventListener('DOMContentLoaded', function() {
    // Load saved API keys
    chrome.storage.sync.get(['ANTHROPIC_API_KEY', 'AKASH_API_KEY'], function(result) {
        document.getElementById('anthropic-api-key').value = result.ANTHROPIC_API_KEY || '';
        document.getElementById('akash-api-key').value = result.AKASH_API_KEY || '';
    });

    // Save API keys when the save button is clicked
    document.getElementById('save-button').addEventListener('click', function() {
        let anthropicKey = document.getElementById('anthropic-api-key').value;
        let akashKey = document.getElementById('akash-api-key').value;

        chrome.storage.sync.set({
            ANTHROPIC_API_KEY: anthropicKey,
            AKASH_API_KEY: akashKey
        }, function() {
            alert('API keys saved');
        });
    });
});