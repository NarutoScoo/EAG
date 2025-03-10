// Default settings
const defaultSettings = {
  modelType: 'openai',
  openaiModel: 'gpt-3.5-turbo',
  ollamaModel: 'llama2',
  apiUrl: 'https://api.openai.com/v1',
  apiKey: ''
};

// Load settings
async function loadSettings() {
  const settings = await browser.storage.sync.get(defaultSettings);
  document.getElementById('model-type').value = settings.modelType;
  document.getElementById('openai-model').value = settings.openaiModel;
  document.getElementById('ollama-model').value = settings.ollamaModel;
  document.getElementById('api-url').value = settings.apiUrl;
  document.getElementById('api-key').value = settings.apiKey;
  updateVisibility();
}

// Save settings
async function saveSettings(e) {
  e.preventDefault();
  const modelType = document.getElementById('model-type').value;
  const openaiModel = document.getElementById('openai-model').value;
  const ollamaModel = document.getElementById('ollama-model').value;
  const apiUrl = document.getElementById('api-url').value;
  const apiKey = document.getElementById('api-key').value;

  // Validate required fields
  if (modelType === 'openai' && !apiKey) {
    showStatus('API Key is required for OpenAI', true);
    return;
  }

  try {
    await browser.storage.sync.set({
      modelType,
      openaiModel,
      ollamaModel,
      apiUrl,
      apiKey
    });
    showStatus('Settings saved successfully');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, true);
  }
}

// Reset settings
async function resetSettings(e) {
  e.preventDefault();
  try {
    await browser.storage.sync.set(defaultSettings);
    await loadSettings();
    showStatus('Settings reset to defaults');
  } catch (error) {
    showStatus('Error resetting settings: ' + error.message, true);
  }
}

// Update visibility of model-specific options
function updateVisibility() {
  const modelType = document.getElementById('model-type').value;
  const openaiSection = document.getElementById('openai-section');
  const ollamaSection = document.getElementById('ollama-section');
  const apiSection = document.getElementById('api-section');

  if (modelType === 'openai') {
    openaiSection.style.display = 'block';
    ollamaSection.style.display = 'none';
    apiSection.style.display = 'block';
    document.getElementById('api-key').required = true;
    document.getElementById('api-url').value = 'https://api.openai.com/v1';
  } else {
    openaiSection.style.display = 'none';
    ollamaSection.style.display = 'block';
    apiSection.style.display = 'block';
    document.getElementById('api-key').required = false;
    document.getElementById('api-url').value = 'http://localhost:11434';
  }
}

// Show status message
function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.backgroundColor = isError ? '#ffebee' : '#e8f5e9';
  status.style.color = isError ? '#c62828' : '#2e7d32';
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
document.querySelector('form').addEventListener('submit', saveSettings);
document.getElementById('model-type').addEventListener('change', updateVisibility);
document.getElementById('reset-button').addEventListener('click', resetSettings); 