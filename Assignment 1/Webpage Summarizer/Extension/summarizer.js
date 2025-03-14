(function() {
  let currentModal = null;

  async function basicSummarize(text) {
    // Split text into paragraphs and sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    // Extract main topics (using keywords frequency)
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const commonWords = new Set(['this', 'that', 'these', 'those', 'then', 'than', 'with', 'will', 'have', 'from', 'what', 'when', 'where', 'which', 'there', 'their', 'about', 'would', 'could', 'should']);
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get meaningful keywords
    const keywords = Object.entries(wordFreq)
      .filter(([_, freq]) => freq >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word, freq]) => ({
        word,
        frequency: freq
      }));

    // Create sections for the summary
    const mainPoints = sentences
      .filter(sentence => {
        return keywords.some(({word}) => sentence.toLowerCase().includes(word)) ||
               sentence.length > 100;
      })
      .slice(0, 8);

    // Find potential key details (dates, numbers, names)
    const details = sentences.filter(sentence => {
      return sentence.match(/\d+|January|February|March|April|May|June|July|August|September|October|November|December|\d+%|\$\d+/i);
    }).slice(0, 5);

    return {
      keywords: keywords,
      overview: mainPoints.slice(0, 2).join(' '),
      keyPoints: mainPoints.slice(2).map(point => point.trim()),
      importantDetails: details.map(detail => detail.trim())
    };
  }

  function highlightText(text, keyword) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #fff3cd; padding: 2px 4px; border-radius: 2px;">$1</mark>');
  }

  async function summarizeText(text) {
    try {
      // First, get the basic summary
      const basicSummary = await basicSummarize(text);
      
      // Show the basic summary immediately
      currentModal = await showSummary(basicSummary);

      // Show only loading state for AI summary (without basic summary)
      const contentWrapper = currentModal.querySelector('div[style*="overflow-y: auto"]');
      if (contentWrapper) {
        contentWrapper.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="
              width: 40px;
              height: 40px;
              margin: 0 auto 15px;
              border: 3px solid #f3f3f3;
              border-top: 3px solid #3498db;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            "></div>
            <p style="color: #666;">Generating comprehensive summary...</p>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
      }

      // Then try to get AI-enhanced summary
      const settings = await browser.storage.sync.get({
        modelType: 'openai',
        openaiModel: 'gpt-4-turbo-preview',
        ollamaModel: 'mistral:latest',
        apiUrl: 'https://api.openai.com/v1',
        apiKey: ''
      });

      let aiSummary;
      try {
        if (settings.modelType === 'openai') {
          if (!settings.apiKey) {
            throw new Error('OpenAI API key is required. Please configure it in the extension settings.');
          }
          
          try {
            const response = await fetch(`${settings.apiUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`
              },
              body: JSON.stringify({
                model: settings.openaiModel,
                messages: [{
                  role: 'system',
                  content: 'You are a helpful assistant that creates concise summaries. Extract key points and important details.'
                }, {
                  role: 'user',
                  content: `Please summarize the following text:\n\n${text}`
                }]
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('OpenAI API Error:', errorText);
              throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            aiSummary = data.choices[0].message.content;
          } catch (fetchError) {
            console.error('OpenAI Fetch Error:', fetchError);
            throw new Error(`Failed to connect to OpenAI API: ${fetchError.message}`);
          }
        } else {
          try {
            // Use browser.runtime.sendMessage to handle the request through background script
            const message = {
              type: 'summarize',
              data: {
                model: settings.ollamaModel,
                prompt: `Please provide a summary of the following text, including key points and important details:\n\n${text}`,
                temperature: 0.7
              }
            };

            let data;
            // First try direct fetch with proper headers
            try {
              const response = await fetch('http://localhost:8050/api/generate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Origin': 'moz-extension://' + browser.runtime.id
                },
                body: JSON.stringify({
                  ...message.data,
                  format: 'html'  // Request HTML formatted output
                })
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              data = await response.json();
              if (data.status === 'error') {
                throw new Error(data.message);
              }
              aiSummary = data.response;
            } catch (directFetchError) {
              console.warn('Direct fetch failed, trying through background script:', directFetchError);
              
              // Fallback to background script if direct fetch fails
              const result = await browser.runtime.sendMessage(message);
              
              if (result.error) {
                throw new Error(result.error);
              }
              if (!result.success || !result.response) {
                throw new Error('Invalid response from background script');
              }
              aiSummary = result.response;
            }

            // If we got a response, update the UI immediately with the raw AI response
            if (aiSummary && currentModal) {
              // Process the AI text for keywords
              const words = aiSummary.toLowerCase().match(/\b\w+\b/g) || [];
              const commonWords = new Set(['this', 'that', 'these', 'those', 'then', 'than', 'with', 'will', 'have', 'from', 'what', 'when', 'where', 'which', 'there', 'their', 'about', 'would', 'could', 'should']);
              const wordFreq = {};
              words.forEach(word => {
                if (word.length > 3 && !commonWords.has(word)) {
                  wordFreq[word] = (wordFreq[word] || 0) + 1;
                }
              });

              const aiKeywords = Object.entries(wordFreq)
                .filter(([_, freq]) => freq >= 2)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([word, freq]) => ({
                  word,
                  frequency: freq
                }));

              console.log('Extracted Keywords:', aiKeywords);

              // Update the UI with the AI response and keywords
              const contentWrapper = currentModal.querySelector('div[style*="overflow-y: auto"]');

              if (contentWrapper) {
                const keywordsHTML = aiKeywords
                  .map(({word, frequency}) => `
                    <span 
                      class="keyword-tag"
                      data-keyword="${word.toLowerCase()}"
                      style="
                        display: inline-block;
                        margin: 4px;
                        padding: 4px 12px;
                        background: #f8f9fa;
                        border-radius: 15px;
                        font-size: 14px;
                        color: #2c3e50;
                        border: 1px solid #e9ecef;
                        cursor: pointer;
                        transition: all 0.2s ease;
                      "
                    >${word}</span>
                  `)
                  .join('');

                // Create the new content with HTML formatting
                const newContent = `
                  <style>
                    .keyword-tag:hover {
                      background: #e9ecef !important;
                      transform: translateY(-1px);
                    }
                    .keyword-tag.active {
                      background: #3498db !important;
                      color: white !important;
                      border-color: #3498db !important;
                    }
                    .content-section {
                      transition: all 0.3s ease;
                    }
                    .content-section.highlight {
                      background: #f8f9fa;
                      border-radius: 8px;
                      padding: 15px;
                      margin: -15px;
                    }
                    .summary-text {
                      color: #2c3e50;
                      line-height: 1.6;
                    }
                    .summary-text h1, .summary-text h2, .summary-text h3 {
                      color: #34495e;
                      margin: 1em 0 0.5em;
                    }
                    .summary-text ul, .summary-text ol {
                      padding-left: 1.5em;
                      margin: 0.5em 0;
                    }
                    .summary-text p {
                      margin: 0.5em 0;
                    }
                    .summary-text code {
                      background: #f8f9fa;
                      padding: 0.2em 0.4em;
                      border-radius: 3px;
                      font-family: monospace;
                    }
                    .summary-text pre {
                      background: #f8f9fa;
                      padding: 1em;
                      border-radius: 5px;
                      overflow-x: auto;
                    }
                  </style>
                  <div style="margin-bottom: 25px;">
                    <h3 style="color: #34495e; margin-bottom: 12px;">Key Terms</h3>
                    <div style="line-height: 2;" id="keywords-container">${keywordsHTML}</div>
                  </div>
                  <div class="content-section" style="margin-bottom: 25px;" data-section="summary">
                    <div class="summary-text">${aiSummary}</div>
                  </div>
                `;

                contentWrapper.innerHTML = newContent;

                // Reattach event listeners for keywords
                const keywordTags = contentWrapper.querySelectorAll('.keyword-tag');
                const contentSections = contentWrapper.querySelectorAll('.content-section');
                let activeKeyword = null;

                keywordTags.forEach(tag => {
                  tag.addEventListener('click', () => {
                    const keyword = tag.dataset.keyword;
                    
                    if (activeKeyword === keyword) {
                      activeKeyword = null;
                      keywordTags.forEach(t => t.classList.remove('active'));
                      contentSections.forEach(section => {
                        section.classList.remove('highlight');
                        section.innerHTML = section.innerHTML.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
                      });
                      return;
                    }

                    activeKeyword = keyword;
                    keywordTags.forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');

                    contentSections.forEach(section => {
                      const originalContent = section.innerHTML.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
                      const hasMatch = originalContent.toLowerCase().includes(keyword);
                      
                      section.classList.toggle('highlight', hasMatch);
                      if (hasMatch) {
                        section.innerHTML = highlightText(originalContent, keyword);
                        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      } else {
                        section.innerHTML = originalContent;
                      }
                    });
                  });
                });
              } else {
                console.error('Content wrapper not found in modal');
              }
            } else {
              console.error('No AI summary or modal not available:', { 
                hasAiSummary: !!aiSummary, 
                hasModal: !!currentModal 
              });
            }
          } catch (fetchError) {
            console.error('Backend Fetch Error:', fetchError);
            throw new Error(`Failed to connect to Backend API: ${fetchError.message}`);
          }
        }
      } catch (error) {
        console.error('AI summarization error:', error);
        // On failure, show the basic summary
        if (currentModal) {
          updateSummaryContent(currentModal, basicSummary);
        }
      }

      return null;
    } catch (error) {
      console.error('Summarization error:', error);
      return {
        keywords: [],
        overview: 'Error: ' + error.message,
        keyPoints: [],
        importantDetails: []
      };
    }
  }

  function updateSummaryContent(modal, summary, styles = {}) {
    const contentWrapper = modal.querySelector('div[style*="overflow-y: auto"]');
    if (!contentWrapper) return;

    const {
      background = 'white',
      color = '#2c3e50',
      fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      fontSize = '14px',
      lineHeight = '1.5',
      headingColor = '#34495e',
      headingFontFamily = fontFamily,
      headingFontWeight = '600',
      isPageDark = false
    } = styles;

    // Add loading indicator if needed
    if (summary === null) {
      const loadingHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="
            width: 40px;
            height: 40px;
            margin: 0 auto 15px;
            border: 3px solid ${isPageDark ? 'rgba(255,255,255,0.1)' : '#f3f3f3'};
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <p style="
            color: ${color};
            font-family: ${fontFamily};
            font-size: ${fontSize};
          ">Generating comprehensive summary...</p>
        </div>
      `;
      
      contentWrapper.insertAdjacentHTML('afterbegin', loadingHTML);
      contentWrapper.insertAdjacentHTML('afterbegin', `
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `);
      return;
    }

    const keywordsHTML = summary.keywords
      .map(({word, frequency}) => `
        <span 
          class="keyword-tag"
          data-keyword="${word.toLowerCase()}"
          style="
            display: inline-block;
            margin: 4px;
            padding: 4px 12px;
            background: ${isPageDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa'};
            border-radius: 15px;
            font-size: ${fontSize};
            color: ${color};
            border: 1px solid ${isPageDark ? 'rgba(255,255,255,0.1)' : '#e9ecef'};
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: ${fontFamily};
          "
        >${word}</span>
      `)
      .join('');

    contentWrapper.innerHTML = `
      <style>
        .keyword-tag:hover {
          background: ${isPageDark ? 'rgba(255,255,255,0.1)' : '#e9ecef'} !important;
          transform: translateY(-1px);
        }
        .keyword-tag.active {
          background: #3498db !important;
          color: white !important;
          border-color: #3498db !important;
        }
        .content-section {
          transition: all 0.3s ease;
          font-family: ${fontFamily};
          font-size: ${fontSize};
          line-height: ${lineHeight};
          color: ${color};
        }
        .content-section.highlight {
          background: ${isPageDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa'};
          border-radius: 8px;
          padding: 15px;
          margin: -15px;
        }
        .content-section h3 {
          color: ${headingColor};
          font-family: ${headingFontFamily};
          font-weight: ${headingFontWeight};
          margin-bottom: 12px;
        }
      </style>
      <div style="margin-bottom: 25px;">
        <h3>Key Terms</h3>
        <div style="line-height: 2;" id="keywords-container">${keywordsHTML}</div>
      </div>
      <div class="content-section" style="margin-bottom: 25px;" data-section="overview">
        <h3>Overview</h3>
        <p>${summary.overview}</p>
      </div>
      <div class="content-section" style="margin-bottom: 25px;" data-section="keypoints">
        <h3>Key Points</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0;">
          ${summary.keyPoints.map(point => `
            <li style="
              margin-bottom: 12px;
              padding-left: 24px;
              position: relative;
            ">
              <span style="
                position: absolute;
                left: 0;
                top: 8px;
                width: 6px;
                height: 6px;
                background: #3498db;
                border-radius: 50%;
              "></span>
              ${point}
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="content-section" style="margin-bottom: 20px;" data-section="details">
        <h3>Important Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0;">
          ${summary.importantDetails.map(detail => `
            <li style="
              margin-bottom: 12px;
              padding-left: 24px;
              position: relative;
            ">
              <span style="
                position: absolute;
                left: 0;
                top: 8px;
                width: 6px;
                height: 6px;
                background: #e74c3c;
                border-radius: 50%;
              "></span>
              ${detail}
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    // Reattach event listeners for keywords
    const keywordTags = contentWrapper.querySelectorAll('.keyword-tag');
    const contentSections = contentWrapper.querySelectorAll('.content-section');
    let activeKeyword = null;

    keywordTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const keyword = tag.dataset.keyword;
        
        if (activeKeyword === keyword) {
          activeKeyword = null;
          keywordTags.forEach(t => t.classList.remove('active'));
          contentSections.forEach(section => {
            section.classList.remove('highlight');
            section.innerHTML = section.innerHTML.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
          });
          return;
        }

        activeKeyword = keyword;
        keywordTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');

        contentSections.forEach(section => {
          const originalContent = section.innerHTML.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
          const hasMatch = originalContent.toLowerCase().includes(keyword);
          
          section.classList.toggle('highlight', hasMatch);
          if (hasMatch) {
            section.innerHTML = highlightText(originalContent, keyword);
            section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            section.innerHTML = originalContent;
          }
        });
      });
    });
  }

  async function showSummary(summary) {
    if (currentModal) {
      updateSummaryContent(currentModal, summary);
      return currentModal;
    }

    // Get the webpage's styles
    const computedStyle = window.getComputedStyle(document.body);
    const pageBackground = computedStyle.backgroundColor;
    const pageFontFamily = computedStyle.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    const pageFontSize = computedStyle.fontSize || '14px';
    const pageColor = computedStyle.color;
    const pageLineHeight = computedStyle.lineHeight;
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Get heading styles from a sample h2 or h3 element
    const sampleHeading = document.querySelector('h2, h3');
    const headingStyles = sampleHeading ? window.getComputedStyle(sampleHeading) : null;
    const headingColor = headingStyles ? headingStyles.color : (isPageDark ? '#e0e0e0' : '#2c3e50');
    const headingFontFamily = headingStyles ? headingStyles.fontFamily : pageFontFamily;
    const headingFontWeight = headingStyles ? headingStyles.fontWeight : '600';
    
    // Determine if the page background is dark
    const bgColor = pageBackground === 'transparent' ? (isDarkMode ? '#1a1a1a' : 'white') : pageBackground;
    const isPageDark = isColorDark(bgColor);
    
    // Create container for the side panel
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: ${bgColor};
      box-shadow: 
        -4px 0 25px rgba(0, 0, 0, 0.15),
        -1px 0 10px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      transform: translateX(0);
      font-family: ${pageFontFamily};
      font-size: ${pageFontSize};
      color: ${pageColor};
      line-height: ${pageLineHeight};
    `;

    // Create modal with adaptive colors
    const modal = document.createElement('div');
    modal.style.cssText = `
      width: 100%;
      height: 100%;
      background: ${bgColor};
      display: flex;
      flex-direction: column;
      color: ${pageColor};
    `;

    const pageTitle = document.title || 'Current Page';
    
    // Header with sticky positioning
    const header = document.createElement('div');
    header.style.cssText = `
      position: sticky;
      top: 0;
      background: ${bgColor};
      border-bottom: 1px solid ${isPageDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      padding: 15px 20px;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    // Title with ellipsis
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 10px;
    `;
    titleDiv.innerHTML = `<h2 style="
      color: ${headingColor};
      margin: 0;
      font-size: ${pageFontSize};
      font-family: ${headingFontFamily};
      font-weight: ${headingFontWeight};
    ">${pageTitle}</h2>`;
    header.appendChild(titleDiv);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      border: none;
      background: none;
      font-size: 24px;
      cursor: pointer;
      color: ${isPageDark ? '#a0a0a0' : '#666'};
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
      flex-shrink: 0;
      font-family: ${pageFontFamily};
    `;
    closeButton.onmouseover = () => {
      closeButton.style.backgroundColor = isPageDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    };
    closeButton.onmouseout = () => {
      closeButton.style.backgroundColor = 'transparent';
    };
    closeButton.onclick = () => {
      container.style.transform = 'translateX(100%)';
      container.style.boxShadow = 'none';
      setTimeout(() => container.remove(), 300);
    };
    header.appendChild(closeButton);

    // Content with scrolling
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
      padding: 20px;
      overflow-y: auto;
      flex-grow: 1;
      background: ${bgColor};
      font-family: ${pageFontFamily};
      font-size: ${pageFontSize};
      color: ${pageColor};
      line-height: ${pageLineHeight};
    `;

    modal.appendChild(header);
    modal.appendChild(contentWrapper);
    container.appendChild(modal);
    document.body.appendChild(container);

    // Add resize handle with visual feedback
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      cursor: ew-resize;
      background: transparent;
      transition: background 0.2s ease;
    `;

    // Add hover effect for resize handle
    resizeHandle.addEventListener('mouseover', () => {
      resizeHandle.style.background = isPageDark ? 
        'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' : 
        'linear-gradient(90deg, rgba(0,0,0,0.05), transparent)';
    });

    resizeHandle.addEventListener('mouseout', () => {
      if (!isResizing) {
        resizeHandle.style.background = 'transparent';
      }
    });

    container.appendChild(resizeHandle);

    // Pass the styles to updateSummaryContent
    const styles = {
      background: bgColor,
      color: pageColor,
      fontFamily: pageFontFamily,
      fontSize: pageFontSize,
      lineHeight: pageLineHeight,
      headingColor,
      headingFontFamily,
      headingFontWeight,
      isPageDark
    };

    // Update content with the webpage styles
    updateSummaryContent(modal, summary, styles);

    return modal;
  }

  // Helper function to determine if a color is dark
  function isColorDark(color) {
    // Create a temporary div to parse the color
    const div = document.createElement('div');
    div.style.backgroundColor = color;
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div);
    const rgb = computed.backgroundColor;
    document.body.removeChild(div);

    // Extract RGB values
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return false;

    const [, r, g, b] = match.map(Number);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  async function getPageContent() {
    const selection = window.getSelection().toString().trim();
    
    if (selection) {
      return new Promise((resolve) => {
        // Create overlay for outside click detection
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        `;
        document.body.appendChild(overlay);
        
        // Create container for the dialog
        const container = document.createElement('div');
        container.style.cssText = `
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          width: 400px;
          transform: translateY(20px);
          transition: transform 0.3s ease;
          opacity: 0;
        `;

        // Create modal with dark mode support
        const promptModal = document.createElement('div');
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        promptModal.style.cssText = `
          background: ${isDarkMode ? '#1a1a1a' : 'white'};
          border-radius: 8px;
          overflow: hidden;
          color: ${isDarkMode ? '#e0e0e0' : '#2c3e50'};
        `;

        const pageTitle = document.title || 'Current Page';
        promptModal.innerHTML = `
          <div style="
            padding: 15px 20px;
            background: ${isDarkMode ? '#2d2d2d' : '#f8f9fa'};
            border-bottom: 1px solid ${isDarkMode ? '#404040' : '#eee'};
            font-weight: bold;
            font-size: 14px;
          ">${pageTitle}</div>
          <div style="padding: 20px;">
            <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px;">Summarize</h3>
            <p style="margin-bottom: 20px; color: ${isDarkMode ? '#a0a0a0' : '#666666'}; font-size: 14px;">
              Would you like to summarize the selected text or the entire page?
            </p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button id="summarize-selection" style="
                padding: 8px 16px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
                font-size: 13px;
              ">Selected Text</button>
              <button id="summarize-page" style="
                padding: 8px 16px;
                background: #2ecc71;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
                font-size: 13px;
              ">Entire Page</button>
            </div>
          </div>
        `;

        // Function to close the dialog
        const closeDialog = () => {
          overlay.style.opacity = '0';
          container.style.transform = 'translateY(20px)';
          container.style.opacity = '0';
          setTimeout(() => overlay.remove(), 200);
        };

        // Handle button clicks
        const selectionBtn = promptModal.querySelector('#summarize-selection');
        const pageBtn = promptModal.querySelector('#summarize-page');

        selectionBtn.onclick = () => {
          closeDialog();
          resolve(selection);
        };

        pageBtn.onclick = () => {
          closeDialog();
          resolve(document.body.innerText);
        };

        // Add hover effects
        [selectionBtn, pageBtn].forEach(button => {
          button.addEventListener('mouseover', () => {
            button.style.opacity = '0.9';
          });
          button.addEventListener('mouseout', () => {
            button.style.opacity = '1';
          });
        });

        // Handle outside clicks
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            closeDialog();
            resolve(null);
          }
        });

        container.appendChild(promptModal);
        overlay.appendChild(container);

        // Trigger animations after a brief delay
        requestAnimationFrame(() => {
          overlay.style.opacity = '1';
          container.style.transform = 'translateY(0)';
          container.style.opacity = '1';
        });
      });
    }
    
    // If no text is selected, get all the main content
    return document.body.innerText;
  }

  // Main execution
  (async () => {
    try {
      const content = await getPageContent();
      if (content) {
        await summarizeText(content);
      }
    } catch (error) {
      console.error('Error in main execution:', error);
    }
  })();
})(); 