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
  
  // Handle Ollama model setting
  const ollamaModel = settings.ollamaModel;
  const ollamaPresetSelect = document.getElementById('ollama-model-preset');
  const ollamaCustomInput = document.getElementById('ollama-model');
  
  if (['llama2', 'mistral', 'codellama', 'vicuna'].includes(ollamaModel)) {
    ollamaPresetSelect.value = ollamaModel;
    ollamaCustomInput.style.display = 'none';
  } else {
    ollamaPresetSelect.value = 'custom';
    ollamaCustomInput.value = ollamaModel;
    ollamaCustomInput.style.display = 'block';
  }
  
  document.getElementById('api-url').value = settings.apiUrl;
  document.getElementById('api-key').value = settings.apiKey;
  updateVisibility();
}

// Save settings
async function saveSettings(e) {
  e.preventDefault();
  const modelType = document.getElementById('model-type').value;
  const openaiModel = document.getElementById('openai-model').value;
  const ollamaPreset = document.getElementById('ollama-model-preset').value;
  const ollamaCustom = document.getElementById('ollama-model').value;
  const apiUrl = document.getElementById('api-url').value;
  const apiKey = document.getElementById('api-key').value;

  // Determine Ollama model value
  const ollamaModel = ollamaPreset === 'custom' ? ollamaCustom : ollamaPreset;

  // Validate required fields
  if (modelType === 'openai' && !apiKey) {
    showStatus('API Key is required for OpenAI', true);
    return;
  }

  if (modelType === 'ollama' && ollamaPreset === 'custom' && !ollamaCustom) {
    showStatus('Custom model name is required', true);
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

// Handle Ollama model preset changes
function handleOllamaPresetChange() {
  const preset = document.getElementById('ollama-model-preset').value;
  const customInput = document.getElementById('ollama-model');
  customInput.style.display = preset === 'custom' ? 'block' : 'none';
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
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  document.querySelector('form').addEventListener('submit', saveSettings);
  document.getElementById('model-type').addEventListener('change', updateVisibility);
  document.getElementById('reset-button').addEventListener('click', resetSettings);
  document.getElementById('ollama-model-preset').addEventListener('change', handleOllamaPresetChange);
}); 