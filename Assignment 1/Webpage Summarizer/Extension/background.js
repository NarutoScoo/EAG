// Create context menu item
browser.contextMenus.create({
  id: "summarize-page",
  title: "Summarize",
  contexts: ["all"]
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarize-page") {
    browser.tabs.executeScript({
      file: "summarizer.js"
    });
  }
}); 