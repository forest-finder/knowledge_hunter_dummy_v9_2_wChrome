// Knowledge Hunter Chrome Extension - Options Script

document.addEventListener('DOMContentLoaded', function() {
  // Get form elements
  const autoSyncToggle = document.getElementById('auto-sync');
  const notificationsToggle = document.getElementById('notifications');
  const floatingButtonToggle = document.getElementById('floating-button');
  const captureFormatSelect = document.getElementById('capture-format');
  const defaultCollectionSelect = document.getElementById('default-collection');
  const includeMetadataToggle = document.getElementById('include-metadata');
  const userInfoElement = document.getElementById('user-info');
  const signInButton = document.getElementById('sign-in-button');
  const exportDataButton = document.getElementById('export-data');
  const clearDataButton = document.getElementById('clear-data');
  const saveButton = document.getElementById('save-button');
  const resetButton = document.getElementById('reset-button');
  
  // Load current settings
  loadSettings();
  
  // Load user info
  loadUserInfo();
  
  // Load collections for the dropdown
  loadCollections();
  
  // Add event listeners
  saveButton.addEventListener('click', saveSettings);
  resetButton.addEventListener('click', resetSettings);
  signInButton.addEventListener('click', handleSignIn);
  exportDataButton.addEventListener('click', exportData);
  clearDataButton.addEventListener('click', clearData);
  
  // Functions
  function loadSettings() {
    chrome.storage.local.get(['settings'], function(result) {
      const settings = result.settings || getDefaultSettings();
      
      // Apply settings to form elements
      autoSyncToggle.checked = settings.autoSync;
      notificationsToggle.checked = settings.notificationsEnabled;
      floatingButtonToggle.checked = settings.showFloatingButton || false;
      captureFormatSelect.value = settings.captureFormat || 'html';
      includeMetadataToggle.checked = settings.includeMetadata !== false; // Default to true
      
      // Default collection will be set after collections are loaded
    });
  }
  
  function loadUserInfo() {
    chrome.storage.local.get(['user'], function(result) {
      if (result.user) {
        userInfoElement.innerHTML = `
          <p><strong>${result.user.name || result.user.email}</strong></p>
          <p class="user-email">${result.user.email}</p>
        `;
        signInButton.textContent = 'Sign Out';
      } else {
        userInfoElement.innerHTML = '<p>Not signed in</p>';
        signInButton.textContent = 'Sign In';
      }
    });
  }
  
  function loadCollections() {
    chrome.storage.local.get(['collections', 'settings'], function(result) {
      const collections = result.collections || [];
      const settings = result.settings || {};
      
      // Clear existing options except the first one (General)
      while (defaultCollectionSelect.options.length > 1) {
        defaultCollectionSelect.remove(1);
      }
      
      // Add collections to dropdown
      collections.forEach(collection => {
        if (collection.id !== 'general') { // Skip General as it's already there
          const option = document.createElement('option');
          option.value = collection.id;
          option.textContent = collection.name;
          defaultCollectionSelect.appendChild(option);
        }
      });
      
      // Set selected collection
      defaultCollectionSelect.value = settings.defaultCollection || 'general';
    });
  }
  
  function saveSettings() {
    const settings = {
      autoSync: autoSyncToggle.checked,
      notificationsEnabled: notificationsToggle.checked,
      showFloatingButton: floatingButtonToggle.checked,
      captureFormat: captureFormatSelect.value,
      defaultCollection: defaultCollectionSelect.value,
      includeMetadata: includeMetadataToggle.checked
    };
    
    chrome.storage.local.set({settings: settings}, function() {
      showMessage('Settings saved successfully!');
      
      // If floating button setting changed, send message to content scripts
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: settings
          }).catch(() => {
            // Ignore errors for tabs where content script isn't loaded
          });
        });
      });
    });
  }
  
  function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = getDefaultSettings();
      
      chrome.storage.local.set({settings: defaultSettings}, function() {
        loadSettings();
        showMessage('Settings reset to default!');
      });
    }
  }
  
  function getDefaultSettings() {
    return {
      autoSync: true,
      notificationsEnabled: true,
      showFloatingButton: false,
      captureFormat: 'html',
      defaultCollection: 'general',
      includeMetadata: true
    };
  }
  
  function handleSignIn() {
    if (signInButton.textContent === 'Sign In') {
      // Open sign in page in a new tab
      chrome.tabs.create({
        url: 'https://knowledge-hunter.example.com/auth/signin'
      });
    } else {
      // Sign out
      if (confirm('Are you sure you want to sign out?')) {
        chrome.storage.local.remove(['user'], function() {
          loadUserInfo();
          showMessage('Signed out successfully!');
        });
      }
    }
  }
  
  function exportData() {
    chrome.storage.local.get(['captures', 'collections'], function(result) {
      const data = {
        captures: result.captures || [],
        collections: result.collections || [],
        exportDate: new Date().toISOString()
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create download link
      const blob = new Blob([jsonString], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-hunter-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      showMessage('Data exported successfully!');
    });
  }
  
  function clearData() {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      if (confirm('This will delete all your local captures and collections. Are you absolutely sure?')) {
        chrome.storage.local.remove(['captures', 'collections'], function() {
          // Reset collections to just have the General collection
          chrome.storage.local.set({
            collections: [
              {
                id: 'general',
                name: 'General',
                description: 'Default collection for all captures',
                count: 0
              }
            ]
          }, function() {
            loadCollections();
            showMessage('Local data cleared successfully!');
          });
        });
      }
    }
  }
  
  function showMessage(message, type = 'success') {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('message');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'message';
      document.body.appendChild(messageElement);
      
      // Add styles
      messageElement.style.position = 'fixed';
      messageElement.style.bottom = '20px';
      messageElement.style.left = '50%';
      messageElement.style.transform = 'translateX(-50%)';
      messageElement.style.padding = '10px 20px';
      messageElement.style.borderRadius = '4px';
      messageElement.style.color = 'white';
      messageElement.style.fontWeight = '500';
      messageElement.style.zIndex = '9999';
      messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    }
    
    // Set message type
    if (type === 'success') {
      messageElement.style.backgroundColor = 'var(--success-color)';
    } else if (type === 'error') {
      messageElement.style.backgroundColor = 'var(--error-color)';
    }
    
    // Set message text
    messageElement.textContent = message;
    
    // Show message
    messageElement.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(function() {
      messageElement.style.display = 'none';
    }, 3000);
  }
});