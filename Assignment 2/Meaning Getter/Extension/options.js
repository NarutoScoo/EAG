async function saveOptions(e) {
    e.preventDefault();
    const model = document.getElementById('modelSelect').value;
    await browser.storage.sync.set({
        selectedModel: model
    });
    
    showStatus('Options saved!', 'success');
}

async function restoreOptions() {
    try {
        // Fetch available models
        const response = await fetch('http://127.0.0.1:8050/api/models');
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        
        const { models } = await response.json();
        const select = document.getElementById('modelSelect');
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add models to select
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            select.appendChild(option);
        });
        
        // Restore selected model
        const { selectedModel } = await browser.storage.sync.get('selectedModel');
        if (selectedModel && models.includes(selectedModel)) {
            select.value = selectedModel;
        }
    } catch (error) {
        showStatus('Error loading models. Make sure the backend server is running.', 'error');
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
document.getElementById('modelSelect').addEventListener('change', saveOptions); 