// Knowledge Hunter Chrome Extension - Background Script

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      settings: {
        autoSync: true,
        captureFormat: 'html',
        defaultCollection: 'General',
        notificationsEnabled: true
      },
      captures: [],
      collections: [
        {
          id: 'general',
          name: 'General',
          description: 'Default collection for all captures',
          count: 0
        }
      ]
    }, function() {
      console.log('Knowledge Hunter extension installed and initialized');
    });
    
    // Open onboarding page
    chrome.tabs.create({
      url: 'onboarding.html'
    });
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'saveCapture') {
    saveCapture(request.data, sendResponse);
    return true; // Indicates async response
  } else if (request.action === 'syncData') {
    syncData(sendResponse);
    return true; // Indicates async response
  }
});

// Add context menu items
chrome.runtime.onInstalled.addListener(function() {
  // Create parent context menu item
  chrome.contextMenus.create({
    id: 'knowledge-hunter',
    title: 'Knowledge Hunter',
    contexts: ['page', 'selection', 'link', 'image']
  });
  
  // Create child context menu items
  chrome.contextMenus.create({
    id: 'capture-page',
    parentId: 'knowledge-hunter',
    title: 'Capture Page',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'capture-selection',
    parentId: 'knowledge-hunter',
    title: 'Capture Selection',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'capture-link',
    parentId: 'knowledge-hunter',
    title: 'Capture Link',
    contexts: ['link']
  });
  
  chrome.contextMenus.create({
    id: 'capture-image',
    parentId: 'knowledge-hunter',
    title: 'Capture Image',
    contexts: ['image']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case 'capture-page':
      captureCurrentPage(tab);
      break;
    case 'capture-selection':
      captureSelection(info, tab);
      break;
    case 'capture-link':
      captureLink(info, tab);
      break;
    case 'capture-image':
      captureImage(info, tab);
      break;
  }
});

// Functions for handling captures
function captureCurrentPage(tab) {
  chrome.tabs.sendMessage(tab.id, {action: 'capturePage'}, function(response) {
    if (response && response.success) {
      showNotification('Page captured successfully!');
    } else {
      showNotification('Failed to capture page.', 'error');
    }
  });
}

function captureSelection(info, tab) {
  if (info.selectionText) {
    const captureData = {
      type: 'selection',
      content: info.selectionText,
      title: tab.title,
      url: tab.url,
      date: new Date().toISOString()
    };
    
    saveCapture(captureData, function(response) {
      if (response && response.success) {
        showNotification('Selection captured successfully!');
      } else {
        showNotification('Failed to save selection.', 'error');
      }
    });
  } else {
    showNotification('No text selected.', 'error');
  }
}

function captureLink(info, tab) {
  if (info.linkUrl) {
    const captureData = {
      type: 'link',
      content: info.linkUrl,
      title: info.linkText || info.linkUrl,
      sourceUrl: tab.url,
      date: new Date().toISOString()
    };
    
    saveCapture(captureData, function(response) {
      if (response && response.success) {
        showNotification('Link captured successfully!');
      } else {
        showNotification('Failed to save link.', 'error');
      }
    });
  }
}

function captureImage(info, tab) {
  if (info.srcUrl) {
    const captureData = {
      type: 'image',
      content: info.srcUrl,
      title: tab.title,
      sourceUrl: tab.url,
      date: new Date().toISOString()
    };
    
    saveCapture(captureData, function(response) {
      if (response && response.success) {
        showNotification('Image captured successfully!');
      } else {
        showNotification('Failed to save image.', 'error');
      }
    });
  }
}

// Save capture to storage and sync if enabled
function saveCapture(captureData, callback) {
  // Generate a unique ID for the capture
  captureData.id = 'capture_' + Date.now();
  
  // Get current captures from storage
  chrome.storage.local.get(['captures', 'settings'], function(result) {
    const captures = result.captures || [];
    const settings = result.settings || {};
    
    // Add new capture to the beginning of the array
    captures.unshift(captureData);
    
    // Save updated captures to storage
    chrome.storage.local.set({captures: captures}, function() {
      // Update collection count
      updateCollectionCount(captureData.collection || 'general');
      
      // Sync with server if auto-sync is enabled
      if (settings.autoSync) {
        syncData();
      }
      
      if (callback) callback({success: true, captureId: captureData.id});
    });
  });
}

// Update collection item count
function updateCollectionCount(collectionId) {
  chrome.storage.local.get(['collections'], function(result) {
    const collections = result.collections || [];
    
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if (collectionIndex !== -1) {
      collections[collectionIndex].count++;
      
      chrome.storage.local.set({collections: collections});
    }
  });
}

// Sync data with server
function syncData(callback) {
  // Check if user is authenticated
  chrome.storage.local.get(['user', 'captures'], function(result) {
    if (result.user && result.user.token) {
      // Implement actual sync with server here
      console.log('Syncing data with server...');
      
      // Simulate successful sync
      setTimeout(function() {
        console.log('Data synced successfully');
        if (callback) callback({success: true});
      }, 1000);
    } else {
      console.log('User not authenticated, skipping sync');
      if (callback) callback({success: false, error: 'Not authenticated'});
    }
  });
}

// Show notification
function showNotification(message, type = 'success') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon-128.png',
    title: 'Knowledge Hunter',
    message: message
  });
}