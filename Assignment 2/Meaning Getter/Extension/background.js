// Listen for messages from content script
browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'GET_MEANING') {
        try {
            // Get selected model from storage
            const { selectedModel } = await browser.storage.sync.get('selectedModel');
            console.log('Using model:', selectedModel);
            
            // Try local backend first
            try {
                const url = new URL(`http://127.0.0.1:8050/api/meaning/${encodeURIComponent(request.word)}`);
                if (selectedModel) {
                    url.searchParams.append('model', selectedModel);
                }
                
                console.log('Fetching from backend:', url.toString());
                const backendResponse = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (backendResponse.ok) {
                    const data = await backendResponse.json();
                    console.log('Backend response:', data);
                    return data;
                } else {
                    const errorText = await backendResponse.text();
                    console.log('Backend response not OK:', errorText);
                    throw new Error('Backend response not OK');
                }
            } catch (backendError) {
                console.log('Backend error:', backendError);
                console.log('Backend unavailable, falling back to dictionary API');
                
                // Fallback to dictionary API
                const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(request.word)}`);
                if (!dictResponse.ok) {
                    throw new Error('Word not found');
                }
                const data = await dictResponse.json();
                console.log('Dictionary API response:', data);
                return data[0];
            }
        } catch (error) {
            console.error('Error in background script:', error);
            throw error;
        }
    }
}); 