// Default settings
const defaultSettings = {
  modelType: 'openai',
  openaiModel: 'gpt-4-turbo-preview',
  ollamaModel: 'mistral:latest',
  apiUrl: 'https://api.openai.com/v1',
  apiKey: ''
};

// Load saved settings
function loadSettings() {
  browser.storage.sync.get(defaultSettings).then((settings) => {
    document.getElementById('model-type').value = settings.modelType;
    document.getElementById('openai-model').value = settings.openaiModel;
    document.getElementById('ollama-model').value = settings.ollamaModel;
    
    // Set the preset if it matches a known model
    const presetSelect = document.getElementById('ollama-model-preset');
    const modelExists = Array.from(presetSelect.options).some(option => {
      if (option.value === settings.ollamaModel) {
        presetSelect.value = settings.ollamaModel;
        return true;
      }
      return false;
    });
    
    // If model doesn't match any preset, set to custom
    if (!modelExists) {
      presetSelect.value = 'custom';
      document.getElementById('ollama-model').value = settings.ollamaModel;
    }
    
    document.getElementById('api-url').value = settings.apiUrl;
    document.getElementById('api-key').value = settings.apiKey;
    
    // Show/hide appropriate sections
    updateVisibility(settings.modelType);
  });
}

// Save settings
function saveSettings(e) {
  e.preventDefault();
  
  const modelType = document.getElementById('model-type').value;
  const ollamaPresetValue = document.getElementById('ollama-model-preset').value;
  const settings = {
    modelType: modelType,
    openaiModel: document.getElementById('openai-model').value,
    ollamaModel: modelType === 'ollama' && ollamaPresetValue === 'custom' 
      ? document.getElementById('ollama-model').value 
      : ollamaPresetValue,
    apiUrl: document.getElementById('api-url').value,
    apiKey: document.getElementById('api-key').value
  };

  // Validate required fields
  if (modelType === 'openai' && !settings.apiKey) {
    showStatus('API Key is required for OpenAI', 'error');
    return;
  }

  if (modelType === 'ollama' && !settings.ollamaModel.trim()) {
    showStatus('Please specify an Ollama model', 'error');
    return;
  }

  browser.storage.sync.set(settings).then(() => {
    showStatus('Settings saved successfully!', 'success');
  });
}

// Update visibility of model-specific sections
function updateVisibility(modelType) {
  const openaiModels = document.getElementById('openai-models');
  const ollamaModels = document.getElementById('ollama-models');
  const apiConfig = document.getElementById('api-configuration');
  const apiKeyField = document.getElementById('api-key');
  const apiKeyLabel = apiKeyField.previousElementSibling;
  const customModelInput = document.getElementById('ollama-model');
  const ollamaPreset = document.getElementById('ollama-model-preset');

  if (modelType === 'openai') {
    openaiModels.style.display = 'block';
    ollamaModels.style.display = 'none';
    apiConfig.style.display = 'block';
    document.getElementById('api-url').value = 'https://api.openai.com/v1';
    apiKeyField.required = true;
    apiKeyLabel.innerHTML = 'API Key <span class="required">*</span>';
    
    // Reset Ollama fields
    customModelInput.style.display = 'none';
    customModelInput.required = false;
    ollamaPreset.value = 'mistral:latest';
  } else {
    openaiModels.style.display = 'none';
    ollamaModels.style.display = 'block';
    apiConfig.style.display = 'block';
    document.getElementById('api-url').value = 'http://localhost:11434';
    apiKeyField.required = false;
    apiKeyLabel.textContent = 'API Key';
    
    // Show custom model input only if custom is selected
    const isCustom = ollamaPreset.value === 'custom';
    customModelInput.style.display = isCustom ? 'block' : 'none';
    customModelInput.required = isCustom;
  }
}

// Handle Ollama model preset selection
function handleOllamaPresetChange(e) {
  const customModelInput = document.getElementById('ollama-model');
  const isCustom = e.target.value === 'custom';
  
  customModelInput.style.display = isCustom ? 'block' : 'none';
  customModelInput.required = isCustom;
  
  if (!isCustom) {
    customModelInput.value = '';
  }
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  setTimeout(() => {
    status.className = 'status';
  }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('options-form').addEventListener('submit', saveSettings);
document.getElementById('model-type').addEventListener('change', (e) => {
  updateVisibility(e.target.value);
});
document.getElementById('ollama-model-preset').addEventListener('change', handleOllamaPresetChange); 