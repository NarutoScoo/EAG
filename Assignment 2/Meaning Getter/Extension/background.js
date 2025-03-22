// Listen for messages from content script
browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'GET_MEANING') {
        try {
            // Get selected model from storage
            const { selectedModel } = await browser.storage.sync.get('selectedModel');
            
            // Try local backend first
            try {
                const url = new URL(`http://127.0.0.1:8050/api/meaning/${encodeURIComponent(request.word)}`);
                if (selectedModel) {
                    url.searchParams.append('model', selectedModel);
                }
                
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