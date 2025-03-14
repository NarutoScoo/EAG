// Listen for messages from the content script
browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === 'summarize') {
    try {
      const response = await fetch('http://localhost:8050/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...message.data,
          format: 'html'  // Always request HTML format
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'error') {
        return Promise.resolve({ error: data.message });
      }

      // Properly structure the response
      return Promise.resolve({ 
        success: true,
        response: data.response 
      });
    } catch (error) {
      console.error('Background script error:', error);
      return Promise.resolve({ error: error.message });
    }
  } else if (message.type === 'generate_keywords') {
    try {
      const response = await fetch('http://localhost:8050/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...message.data,
          format: 'text'  // Request plain text for keywords
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'error') {
        return Promise.resolve({ error: data.message });
      }

      // Send the raw response text back
      return Promise.resolve({ 
        success: true,
        keywords: data.response  // Send the raw response string
      });
    } catch (error) {
      console.error('Background script error:', error);
      return Promise.resolve({ error: error.message });
    }
  }
});

// Create context menu item
browser.contextMenus.create({
  id: "summarize-page",
  title: "Summarize Page",
  contexts: ["page", "selection"]
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarize-page") {
    browser.tabs.executeScript({
      file: "summarizer.js"
    });
  }
}); 