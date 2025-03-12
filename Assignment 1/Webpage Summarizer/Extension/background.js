// Listen for messages from the content script
browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === 'summarize') {
    try {
      const response = await fetch('http://localhost:8050/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message.data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'error') {
        return { error: data.message };
      }

      return { response: data.response };
    } catch (error) {
      console.error('Background script error:', error);
      return { error: error.message };
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