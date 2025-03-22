let tooltip = null;

document.addEventListener('mouseup', async function(event) {
    const selectedText = window.getSelection().toString().trim();
    
    // Remove existing tooltip if any
    if (tooltip) {
        document.body.removeChild(tooltip);
        tooltip = null;
    }

    if (selectedText.length > 0) {
        try {
            const meaning = await getMeaning(selectedText);
            showTooltip(event.pageX, event.pageY, meaning);
        } catch (error) {
            console.error('Error fetching meaning:', error);
        }
    }
});

// Close tooltip when clicking outside
document.addEventListener('mousedown', function(event) {
    if (tooltip && !tooltip.contains(event.target)) {
        document.body.removeChild(tooltip);
        tooltip = null;
    }
});

async function getMeaning(word) {
    try {
        // Try local backend first
        try {
            const backendResponse = await fetch(`http://localhost:8050/api/meaning/${encodeURIComponent(word)}`);
            if (backendResponse.ok) {
                const data = await backendResponse.json();
                return formatMeaning(data);
            }
        } catch (backendError) {
            console.log('Backend unavailable, falling back to dictionary API');
        }

        // Fallback to dictionary API
        const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!dictResponse.ok) {
            return `<div class="not-found">
                <h3>${word}</h3>
                <p>No definition found for this word.</p>
                <p>Try checking the spelling or search for a different word.</p>
            </div>`;
        }
        const data = await dictResponse.json();
        return formatMeaning(data);
    } catch (error) {
        return `<div class="error">
            <h3>${word}</h3>
            <p>Unable to fetch definition.</p>
            <p>Please try again later.</p>
        </div>`;
    }
}

function formatMeaning(data) {
    if (!data || !data[0]) return 'No meaning found';
    
    const word = data[0];
    let meaningText = `<h3>${word.word}</h3>`;
    
    if (word.phonetic) {
        meaningText += `<p><i>${word.phonetic}</i></p>`;
    }

    if (word.meanings && word.meanings.length > 0) {
        word.meanings.forEach(meaning => {
            meaningText += `<p><strong>${meaning.partOfSpeech}</strong></p>`;
            if (meaning.definitions && meaning.definitions.length > 0) {
                meaningText += '<ul>';
                meaning.definitions.slice(0, 2).forEach(def => {
                    meaningText += `<li>${def.definition}</li>`;
                });
                meaningText += '</ul>';
            }
        });
    }

    return meaningText;
}

function showTooltip(x, y, content) {
    tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y + 20}px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 10px;
        max-width: 300px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
    tooltip.innerHTML = content;

    // Add some error styling
    const style = document.createElement('style');
    style.textContent = `
        .not-found, .error {
            color: #721c24;
            background-color: #f8d7da;
            border-radius: 3px;
            padding: 5px;
        }
        .not-found h3, .error h3 {
            margin-top: 0;
            color: #721c24;
        }
    `;
    tooltip.appendChild(style);
    
    document.body.appendChild(tooltip);

    // Adjust position if tooltip goes off-screen
    const bounds = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (bounds.right > windowWidth) {
        tooltip.style.left = (windowWidth - bounds.width - 10) + 'px';
    }
    if (bounds.bottom > windowHeight) {
        tooltip.style.top = (y - bounds.height - 10) + 'px';
    }
} 