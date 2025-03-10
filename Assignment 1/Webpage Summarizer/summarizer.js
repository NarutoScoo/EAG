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

  async function summarizeText(text) {
    try {
      // First, get the basic summary
      const basicSummary = await basicSummarize(text);
      
      // Show the basic summary immediately
      currentModal = await showSummary(basicSummary);

      // Show loading state for AI summary
      updateSummaryContent(currentModal, basicSummary, true);

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
            throw new Error('Failed to get summary from OpenAI API');
          }

          const data = await response.json();
          aiSummary = data.choices[0].message.content;
        } else {
          const response = await fetch(`${settings.apiUrl}/api/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: settings.ollamaModel,
              prompt: `Please provide a summary of the following text, including key points and important details:\n\n${text}`,
              stream: false
            })
          });

          if (!response.ok) {
            throw new Error('Failed to get summary from Ollama API');
          }

          const data = await response.json();
          aiSummary = data.response;
        }

        // Process the AI summary
        const sentences = aiSummary.match(/[^.!?]+[.!?]+/g) || [];
        const words = aiSummary.toLowerCase().match(/\b\w+\b/g) || [];
        
        // Extract keywords from AI summary
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

        // Update the existing summary with AI-enhanced content
        if (currentModal) {
          updateSummaryContent(currentModal, {
            keywords: aiKeywords,
            overview: sentences.slice(0, 2).join(' '),
            keyPoints: sentences.slice(2, 6).map(point => point.trim()),
            importantDetails: sentences.slice(6).map(detail => detail.trim())
          });
        }

      } catch (error) {
        console.error('AI summarization error:', error);
        // If AI fails, update the content to show the error but keep the basic summary
        if (currentModal) {
          updateSummaryContent(currentModal, {
            ...basicSummary,
            overview: `${basicSummary.overview}\n\nNote: AI enhancement failed - ${error.message}`
          });
        }
      }

      return basicSummary;
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

  function updateSummaryContent(modal, summary, isLoading = false) {
    const contentWrapper = modal.querySelector('div[style*="overflow-y: auto"]');
    if (!contentWrapper) return;

    // Add loading indicator if needed
    if (isLoading) {
      const loadingHTML = `
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
          <p style="color: #666;">Enhancing summary with AI...</p>
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

    contentWrapper.innerHTML = `
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
      </style>
      <div style="margin-bottom: 25px;">
        <h3 style="color: #34495e; margin-bottom: 12px;">Key Terms</h3>
        <div style="line-height: 2;" id="keywords-container">${keywordsHTML}</div>
      </div>
      <div class="content-section" style="margin-bottom: 25px;" data-section="overview">
        <h3 style="color: #34495e; margin-bottom: 12px;">Overview</h3>
        <p style="line-height: 1.6; color: #2c3e50;">${summary.overview}</p>
      </div>
      <div class="content-section" style="margin-bottom: 25px;" data-section="keypoints">
        <h3 style="color: #34495e; margin-bottom: 12px;">Key Points</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0;">
          ${summary.keyPoints.map(point => `
            <li style="
              margin-bottom: 12px;
              padding-left: 24px;
              position: relative;
              line-height: 1.5;
              color: #2c3e50;
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
        <h3 style="color: #34495e; margin-bottom: 12px;">Important Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0;">
          ${summary.importantDetails.map(detail => `
            <li style="
              margin-bottom: 12px;
              padding-left: 24px;
              position: relative;
              line-height: 1.5;
              color: #2c3e50;
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

    // Create new modal if none exists
    // ... rest of the existing showSummary function code ...
    // Return the modal at the end
    return modal;
  }

  async function getPageContent() {
    const selection = window.getSelection().toString().trim();
    
    if (selection) {
      return new Promise((resolve) => {
        // Create backdrop with blur effect
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        // Create modal with dark mode support
        const promptModal = document.createElement('div');
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        promptModal.style.cssText = `
          background: ${isDarkMode ? '#1a1a1a' : 'white'};
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          width: 400px;
          max-width: 90vw;
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
          ">${pageTitle}</div>
          <div style="padding: 20px;">
            <h3 style="margin-top: 0; margin-bottom: 15px;">Summarize</h3>
            <p style="margin-bottom: 20px; color: ${isDarkMode ? '#a0a0a0' : '#666666'};">
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
              ">Selected Text</button>
              <button id="summarize-page" style="
                padding: 8px 16px;
                background: #2ecc71;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
              ">Entire Page</button>
            </div>
          </div>
        `;

        // Click outside to dismiss
        backdrop.onclick = (e) => {
          if (e.target === backdrop) {
            backdrop.remove();
            resolve(document.body.innerText);
          }
        };

        // Handle button clicks
        const selectionBtn = promptModal.querySelector('#summarize-selection');
        const pageBtn = promptModal.querySelector('#summarize-page');

        selectionBtn.onclick = () => {
          backdrop.remove();
          resolve(selection);
        };

        pageBtn.onclick = () => {
          backdrop.remove();
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

        backdrop.appendChild(promptModal);
        document.body.appendChild(backdrop);
      });
    }
    
    // If no text is selected, get all the main content
    return document.body.innerText;
  }

  // Main execution
  (async () => {
    const content = await getPageContent();
    const summary = await summarizeText(content);
    showSummary(summary);
  })();
})(); 