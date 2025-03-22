// Listen for messages from content script
browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'GET_MEANING') {
        try {
            // Get selected model and provider from storage
            const settings = await browser.storage.sync.get({
                provider: 'ollama',
                modelSettings: {}
            });
            
            // Try local backend first
            try {
                const url = new URL(`http://127.0.0.1:8050/api/meaning/${encodeURIComponent(request.word)}`);
                
                // Add provider and model settings to query parameters
                url.searchParams.append('provider', settings.provider);
                if (settings.modelSettings.model) {
                    url.searchParams.append('model', settings.modelSettings.model);
                }
                if (settings.modelSettings.apiKey) {
                    url.searchParams.append('api_key', settings.modelSettings.apiKey);
                }
                
                console.log('Fetching with settings:', {
                    provider: settings.provider,
                    model: settings.modelSettings.model
                });

                const backendResponse = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (backendResponse.ok) {
                    const data = await backendResponse.json();
                    return data;
                } else {
                    throw new Error('Backend response not OK');
                }
            } catch (backendError) {
                console.log('Falling back to dictionary API');
                
                // Fallback to dictionary API
                const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(request.word)}`);
                if (!dictResponse.ok) {
                    throw new Error('Word not found');
                }
                const data = await dictResponse.json();
                return data[0];
            }
        } catch (error) {
            console.error('Error:', error.message);
            throw error;
        }
    }
}); 