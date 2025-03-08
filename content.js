// Knowledge Hunter Chrome Extension - Content Script

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'capturePage') {
    capturePage(sendResponse);
    return true; // Indicates async response
  } else if (request.action === 'captureSelection') {
    captureSelection(sendResponse);
    return true; // Indicates async response
  }
});

// Capture the entire page
function capturePage(callback) {
  try {
    // Get page metadata
    const title = document.title;
    const url = window.location.href;
    const date = new Date().toISOString();
    
    // Get page content
    const content = {
      html: document.documentElement.outerHTML,
      text: document.body.innerText,
      title: title,
      url: url,
      favicon: getFavicon()
    };
    
    // Create capture data object
    const captureData = {
      type: 'page',
      title: title,
      url: url,
      content: content,
      date: date
    };
    
    // Send data to background script for saving
    chrome.runtime.sendMessage({
      action: 'saveCapture',
      data: captureData
    }, function(response) {
      if (callback) callback(response);
    });
  } catch (error) {
    console.error('Error capturing page:', error);
    if (callback) callback({success: false, error: error.message});
  }
}

// Capture selected text
function captureSelection(callback) {
  try {
    // Get selected text
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
      if (callback) callback({success: false, error: 'No text selected'});
      return;
    }
    
    // Get selection context (surrounding text)
    let context = '';
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // Get parent paragraph or div if selection is just text node
      const contextElement = container.nodeType === Node.TEXT_NODE 
        ? container.parentNode 
        : container;
      
      context = contextElement.innerText || contextElement.textContent;
    }
    
    // Get page metadata
    const title = document.title;
    const url = window.location.href;
    const date = new Date().toISOString();
    
    // Create capture data object
    const captureData = {
      type: 'selection',
      title: title,
      url: url,
      content: {
        text: selectedText,
        context: context,
        html: getSelectionHtml()
      },
      date: date
    };
    
    // Send data to background script for saving
    chrome.runtime.sendMessage({
      action: 'saveCapture',
      data: captureData
    }, function(response) {
      if (callback) callback(response);
    });
  } catch (error) {
    console.error('Error capturing selection:', error);
    if (callback) callback({success: false, error: error.message});
  }
}

// Helper function to get selection as HTML
function getSelectionHtml() {
  let html = '';
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const container = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i++) {
      container.appendChild(selection.getRangeAt(i).cloneContents());
    }
    html = container.innerHTML;
  }
  return html;
}

// Helper function to get favicon URL
function getFavicon() {
  const links = document.querySelectorAll('link[rel*="icon"]');
  if (links.length > 0) {
    // Get the last icon (usually the best quality)
    return links[links.length - 1].href;
  }
  // Default favicon path
  return window.location.origin + '/favicon.ico';
}

// Add floating capture button (optional feature)
function addFloatingButton() {
  // Create button element
  const button = document.createElement('div');
  button.id = 'kh-capture-button';
  button.innerHTML = `
    <div class="kh-button-icon">📚</div>
  `;
  
  // Add styles
  const styles = `
    #kh-capture-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 25px;
      background-color: #4285F4;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      transition: all 0.3s ease;
    }
    
    #kh-capture-button:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    .kh-button-icon {
      font-size: 24px;
    }
    
    #kh-capture-menu {
      position: fixed;
      bottom: 80px;
      right: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      display: none;
    }
    
    .kh-menu-item {
      padding: 10px 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    
    .kh-menu-item:hover {
      background-color: #f5f5f5;
    }
    
    .kh-menu-icon {
      margin-right: 8px;
    }
  `;
  
  // Add styles to document
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
  
  // Add button to document
  document.body.appendChild(button);
  
  // Create menu
  const menu = document.createElement('div');
  menu.id = 'kh-capture-menu';
  menu.innerHTML = `
    <div class="kh-menu-item" id="kh-capture-page">
      <span class="kh-menu-icon">📄</span>
      <span>Capture Page</span>
    </div>
    <div class="kh-menu-item" id="kh-capture-selection">
      <span class="kh-menu-icon">✂️</span>
      <span>Capture Selection</span>
    </div>
  `;
  document.body.appendChild(menu);
  
  // Add event listeners
  button.addEventListener('click', function() {
    const menu = document.getElementById('kh-capture-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });
  
  document.getElementById('kh-capture-page').addEventListener('click', function() {
    capturePage();
    document.getElementById('kh-capture-menu').style.display = 'none';
  });
  
  document.getElementById('kh-capture-selection').addEventListener('click', function() {
    captureSelection();
    document.getElementById('kh-capture-menu').style.display = 'none';
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('#kh-capture-button') && !event.target.closest('#kh-capture-menu')) {
      document.getElementById('kh-capture-menu').style.display = 'none';
    }
  });
}

// Check if floating button should be shown
chrome.storage.local.get(['settings'], function(result) {
  const settings = result.settings || {};
  if (settings.showFloatingButton) {
    addFloatingButton();
  }
});