// Default settings
const defaultSettings = {
  modelType: 'openai',
  openaiModel: 'gpt-3.5-turbo-0125',
  ollamaModel: 'llama2',
  apiUrl: 'https://api.openai.com/v1',
  apiKey: ''
};

// Load settings
async function loadSettings() {
  const settings = await browser.storage.sync.get(defaultSettings);
  document.getElementById('model-type').value = settings.modelType;
  document.getElementById('openai-model').value = settings.openaiModel;
  document.getElementById('api-url').value = settings.apiUrl;
  document.getElementById('api-key').value = settings.apiKey;
  
  // Load Ollama models if that's the current provider
  if (settings.modelType === 'ollama') {
    await loadOllamaModels(settings.ollamaModel);
  }
  
  updateVisibility();
}

// Load Ollama models from the API
async function loadOllamaModels(currentModel = null) {
  const ollamaSelect = document.getElementById('ollama-model-preset');
  const refreshButton = document.getElementById('refresh-models');
  const helpText = document.getElementById('ollama-help-text');
  
  // Show loading state
  refreshButton.style.opacity = '1';
  refreshButton.style.color = '#3498db';  // Change to blue during refresh
  refreshButton.style.transform = 'translateY(-50%) rotate(0deg)';
  refreshButton.style.animation = 'spin 1s linear infinite';
  refreshButton.style.cursor = 'default';
  refreshButton.disabled = true;
  helpText.textContent = 'Refreshing available models...';
  
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch Ollama models');
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    // Clear existing options
    ollamaSelect.innerHTML = '';
    
    // Add fetched models
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.name;
      option.textContent = model.name;
      ollamaSelect.appendChild(option);
    });
    
    // Set the current model or first available
    if (currentModel && models.some(m => m.name === currentModel)) {
      ollamaSelect.value = currentModel;
    } else if (models.length > 0) {
      ollamaSelect.value = models[0].name;
    }

    // Show success message
    helpText.textContent = `${models.length} models found`;
    setTimeout(() => {
      helpText.textContent = 'Models are loaded from your local Ollama instance';
    }, 2000);

  } catch (error) {
    console.error('Error loading Ollama models:', error);
    showStatus('Failed to load Ollama models. Is Ollama running?', true);
    helpText.textContent = 'Failed to load models. Click refresh to try again.';
  } finally {
    // Reset loading state
    refreshButton.style.animation = 'none';
    refreshButton.style.opacity = '0.6';
    refreshButton.style.color = 'var(--text-primary)';
    refreshButton.style.cursor = 'pointer';
    refreshButton.disabled = false;
  }
}

// Save settings
async function saveSettings(e) {
  e.preventDefault();
  const modelType = document.getElementById('model-type').value;
  const openaiModel = document.getElementById('openai-model').value;
  const ollamaModel = document.getElementById('ollama-model-preset').value;
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
    // Load Ollama models when switching to Ollama
    loadOllamaModels();
  }
}

// Show status message
function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.backgroundColor = isError ? '#ffebee' : '#e8f5e9';
  status.style.color = isError ? '#c62828' : '#2e7d32';
  status.style.display = 'block';
  
  // Scroll to top to ensure status is visible
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Hide after delay
  setTimeout(() => {
    status.style.opacity = '0';
    setTimeout(() => {
      status.style.display = 'none';
      status.style.opacity = '1';
    }, 300);
  }, 3000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Add rotation keyframes for refresh button
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: translateY(-50%) rotate(0deg); }
      to { transform: translateY(-50%) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  loadSettings();
  document.querySelector('form').addEventListener('submit', saveSettings);
  document.getElementById('model-type').addEventListener('change', updateVisibility);
  document.getElementById('reset-button').addEventListener('click', resetSettings);
  
  // Add hover effect for refresh button
  const refreshButton = document.getElementById('refresh-models');
  refreshButton.addEventListener('mouseover', () => {
    refreshButton.style.opacity = '1';
  });
  refreshButton.addEventListener('mouseout', () => {
    if (!refreshButton.style.animation) {  // Only reduce opacity if not spinning
      refreshButton.style.opacity = '0.6';
    }
  });
  refreshButton.addEventListener('click', () => loadOllamaModels());
}); 