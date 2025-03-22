let ollamaModels = [];

const GEMINI_MODEL_INFO = {
    'gemini-2.0-flash': {
        name: 'Gemini 2.0 Flash',
        description: 'Next generation features with speed, realtime streaming, and multimodal support.'
    },
    'gemini-2.0-flash-lite': {
        name: 'Gemini 2.0 Flash-Lite',
        description: 'Optimized for cost efficiency and low latency.'
    },
    'gemini-2.0-pro-exp-02-05': {
        name: 'Gemini 2.0 Pro Experimental',
        description: 'Most powerful Gemini 2.0 model with advanced capabilities.'
    },
    'gemini-pro': {
        name: 'Gemini Pro',
        description: 'Legacy model with stable performance.'
    }
};

async function saveOptions(e) {
    e.preventDefault();
    const provider = document.getElementById('providerSelect').value;
    
    let settings = {
        provider: provider,
        fallbackEnabled: document.getElementById('fallbackEnabled').checked,
        modelSettings: {}
    };

    // Save provider-specific settings
    switch (provider) {
        case 'ollama':
            settings.modelSettings = {
                model: document.getElementById('ollamaModelSelect').value
            };
            break;
        case 'openai':
            settings.modelSettings = {
                model: document.getElementById('openaiModelSelect').value,
                apiKey: document.getElementById('openaiKey').value
            };
            break;
        case 'gemini':
            settings.modelSettings = {
                model: document.getElementById('geminiModelSelect').value,
                apiKey: document.getElementById('geminiKey').value
            };
            break;
    }

    try {
        await browser.storage.sync.set(settings);
        showStatus('Options saved!', 'success');
    } catch (error) {
        showStatus('Error saving options: ' + error.message, 'error');
    }
}

async function restoreOptions() {
    try {
        // Fetch available Ollama models
        try {
            const response = await fetch('http://127.0.0.1:8050/api/models');
            if (response.ok) {
                const data = await response.json();
                console.log('Received models:', data); // Debug log
                ollamaModels = data.models || [];
            } else {
                console.error('Failed to fetch models:', response.status);
                showStatus('Warning: Local Ollama server not available', 'error');
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            showStatus('Error connecting to Ollama server', 'error');
        }

        populateOllamaModels();

        // Restore saved settings
        const settings = await browser.storage.sync.get({
            provider: 'ollama',
            fallbackEnabled: true,
            modelSettings: {}
        });

        document.getElementById('providerSelect').value = settings.provider;
        document.getElementById('fallbackEnabled').checked = settings.fallbackEnabled;

        // Restore provider-specific settings
        if (settings.modelSettings) {
            switch (settings.provider) {
                case 'ollama':
                    if (settings.modelSettings.model) {
                        document.getElementById('ollamaModelSelect').value = settings.modelSettings.model;
                    }
                    break;
                case 'openai':
                    if (settings.modelSettings.model) {
                        document.getElementById('openaiModelSelect').value = settings.modelSettings.model;
                    }
                    if (settings.modelSettings.apiKey) {
                        document.getElementById('openaiKey').value = settings.modelSettings.apiKey;
                    }
                    break;
                case 'gemini':
                    if (settings.modelSettings.model) {
                        document.getElementById('geminiModelSelect').value = settings.modelSettings.model;
                    }
                    if (settings.modelSettings.apiKey) {
                        document.getElementById('geminiKey').value = settings.modelSettings.apiKey;
                    }
                    break;
            }
        }

        updateVisibility();
    } catch (error) {
        showStatus('Error loading options: ' + error.message, 'error');
    }
}

function populateOllamaModels() {
    const select = document.getElementById('ollamaModelSelect');
    select.innerHTML = '';
    
    if (!ollamaModels || ollamaModels.length === 0) {
        // Add a default option if no models are found
        const option = document.createElement('option');
        option.value = 'mistral';  // default model
        option.textContent = 'No models found - using mistral';
        select.appendChild(option);
        
        showStatus('No Ollama models found. Make sure Ollama is running and models are installed.', 'error');
        return;
    }

    ollamaModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        select.appendChild(option);
    });
}

function updateGeminiModelDescription() {
    const selectedModel = document.getElementById('geminiModelSelect').value;
    const descriptionElement = document.getElementById('geminiModelDescription');
    if (GEMINI_MODEL_INFO[selectedModel]) {
        descriptionElement.textContent = GEMINI_MODEL_INFO[selectedModel].description;
    }
}

function updateVisibility() {
    const provider = document.getElementById('providerSelect').value;
    document.querySelectorAll('.provider-section').forEach(section => {
        section.style.display = 'none';
    });
    
    switch (provider) {
        case 'ollama':
            document.getElementById('ollamaSection').style.display = 'block';
            break;
        case 'openai':
            document.getElementById('openaiSection').style.display = 'block';
            break;
        case 'gemini':
            document.getElementById('geminiSection').style.display = 'block';
            updateGeminiModelDescription();
            break;
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    setTimeout(() => {
        status.textContent = '';
        status.className = 'status';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('providerSelect').addEventListener('change', updateVisibility);
document.getElementById('saveButton').addEventListener('click', saveOptions);
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('geminiModelSelect').addEventListener('change', updateGeminiModelDescription);
}); 