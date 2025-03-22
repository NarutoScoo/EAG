let tooltip = null;

// Add marked library at the top
const marked = {
    parse: function(markdown) {
        return markdown
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/- (.*)/g, '<li>$1</li>')
            .replace(/<\/li>\n<li>/g, '</li><li>');
    }
};

document.addEventListener('mouseup', async function(event) {
    const selectedText = window.getSelection().toString().trim();
    
    // Remove existing tooltip if any
    if (tooltip) {
        document.body.removeChild(tooltip);
        tooltip = null;
    }

    if (selectedText.length > 0) {
        // Show loading tooltip immediately
        showTooltip(event.pageX, event.pageY, `
            <div class="loading">
                <h3>${selectedText}</h3>
                <div class="loading-spinner"></div>
                <p>Fetching definition...</p>
            </div>
        `);

        try {
            const meaning = await getMeaning(selectedText);
            // Update existing tooltip with meaning
            updateTooltip(meaning);
        } catch (error) {
            console.error('Error fetching meaning:', error);
            updateTooltip(`<div class="error">
                <h3>${selectedText}</h3>
                <p>Unable to fetch definition.</p>
                <p>Please try again later.</p>
            </div>`);
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

// Add function to update existing tooltip
function updateTooltip(content) {
    if (tooltip) {
        // Preserve tooltip position but update content
        const style = tooltip.querySelector('style');
        tooltip.innerHTML = content;
        if (style) {
            tooltip.appendChild(style);
        }
    }
}

async function getMeaning(word) {
    try {
        const response = await browser.runtime.sendMessage({
            type: 'GET_MEANING',
            word: word
        });
        return formatMeaning(response);
    } catch (error) {
        console.error('Error getting meaning:', error);
        return `<div class="not-found">
            <h3>${word}</h3>
            <p>No definition found for this word.</p>
            <p>Try checking the spelling or search for a different word.</p>
        </div>`;
    }
}

function formatMeaning(data) {
    if (!data || (!data.meanings && !data.definition)) {
        return 'No meaning found';
    }
    
    let meaningText = `<h3>${data.word}</h3>`;
    
    // Handle Ollama response format
    if (data.meanings && data.meanings[0].definitions) {
        // Dictionary API format
        if (data.phonetic) {
            meaningText += `<p><i>${data.phonetic}</i></p>`;
        }

        data.meanings.forEach(meaning => {
            meaningText += `<p><strong>${meaning.partOfSpeech}</strong></p>`;
            if (meaning.definitions && meaning.definitions.length > 0) {
                meaningText += '<ul>';
                meaning.definitions.slice(0, 2).forEach(def => {
                    // Parse markdown in the definition
                    const parsedDef = marked.parse(def.definition);
                    meaningText += `<li>${parsedDef}</li>`;
                });
                meaningText += '</ul>';
            }
        });
    } else {
        // Direct Ollama response
        meaningText += marked.parse(data.meanings[0].definitions[0].definition);
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

    // Add styles including loading animation
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
        /* Loading styles */
        .loading {
            text-align: center;
            padding: 10px;
        }
        .loading h3 {
            margin: 0 0 10px 0;
            color: #666;
        }
        .loading p {
            color: #666;
            margin: 10px 0 0 0;
        }
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        /* Markdown styles */
        h1, h2, h3 { margin: 0.5em 0; }
        p { margin: 0.5em 0; }
        ul { margin: 0.5em 0; padding-left: 20px; }
        li { margin: 0.2em 0; }
        code { 
            background: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
        }
        pre {
            background: #f4f4f4;
            padding: 1em;
            border-radius: 3px;
            overflow-x: auto;
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