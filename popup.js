// Knowledge Hunter Chrome Extension - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI elements
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const capturePageButton = document.getElementById('capture-page');
  const captureSelectionButton = document.getElementById('capture-selection');
  const viewCollectionsButton = document.getElementById('view-collections');
  const settingsButton = document.getElementById('settings-button');
  const signInButton = document.getElementById('sign-in-button');
  const userNameElement = document.getElementById('user-name');
  const capturesList = document.getElementById('captures-list');
  
  // Check authentication status
  checkAuthStatus();
  
  // Load recent captures
  loadRecentCaptures();
  
  // Event Listeners
  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  capturePageButton.addEventListener('click', capturePage);
  captureSelectionButton.addEventListener('click', captureSelection);
  viewCollectionsButton.addEventListener('click', viewCollections);
  settingsButton.addEventListener('click', openSettings);
  signInButton.addEventListener('click', handleSignIn);
  
  // Functions
  function checkAuthStatus() {
    // Check if user is authenticated
    chrome.storage.local.get(['user'], function(result) {
      if (result.user) {
        userNameElement.textContent = result.user.name || result.user.email;
        signInButton.textContent = 'Sign Out';
      } else {
        userNameElement.textContent = 'Not signed in';
        signInButton.textContent = 'Sign In';
      }
    });
  }
  
  function loadRecentCaptures() {
    // Load recent captures from storage
    chrome.storage.local.get(['captures'], function(result) {
      if (result.captures && result.captures.length > 0) {
        capturesList.innerHTML = '';
        
        // Display the 5 most recent captures
        const recentCaptures = result.captures.slice(0, 5);
        
        recentCaptures.forEach(capture => {
          const captureItem = document.createElement('div');
          captureItem.className = 'capture-item';
          
          const captureContent = `
            <div>
              <div class="title">${truncateText(capture.title, 40)}</div>
              <div class="source">${truncateText(capture.url, 30)}</div>
            </div>
            <div class="date">${formatDate(capture.date)}</div>
          `;
          
          captureItem.innerHTML = captureContent;
          captureItem.addEventListener('click', function() {
            openCapture(capture.id);
          });
          
          capturesList.appendChild(captureItem);
        });
      } else {
        capturesList.innerHTML = '<div class="empty-state">No recent captures</div>';
      }
    });
  }
  
  function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
      // Open search results in a new tab
      chrome.tabs.create({
        url: `https://knowledge-hunter.example.com/search?q=${encodeURIComponent(query)}`
      });
    }
  }
  
  function capturePage() {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      
      // Send message to content script to capture the page
      chrome.tabs.sendMessage(activeTab.id, {action: "capturePage"}, function(response) {
        if (response && response.success) {
          showNotification('Page captured successfully!');
          loadRecentCaptures(); // Refresh the list
        } else {
          showNotification('Failed to capture page.', 'error');
        }
      });
    });
  }
  
  function captureSelection() {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      
      // Send message to content script to capture the selection
      chrome.tabs.sendMessage(activeTab.id, {action: "captureSelection"}, function(response) {
        if (response && response.success) {
          showNotification('Selection captured successfully!');
          loadRecentCaptures(); // Refresh the list
        } else {
          showNotification('Failed to capture selection. Please select some text first.', 'error');
        }
      });
    });
  }
  
  function viewCollections() {
    // Open collections page in a new tab
    chrome.tabs.create({
      url: 'https://knowledge-hunter.example.com/collections'
    });
  }
  
  function openSettings() {
    // Open settings page
    chrome.runtime.openOptionsPage();
  }
  
  function handleSignIn() {
    if (signInButton.textContent === 'Sign In') {
      // Open sign in page in a new tab
      chrome.tabs.create({
        url: 'https://knowledge-hunter.example.com/auth/signin'
      });
    } else {
      // Sign out
      chrome.storage.local.remove(['user'], function() {
        checkAuthStatus();
        showNotification('Signed out successfully!');
      });
    }
  }
  
  function openCapture(captureId) {
    // Open the capture in a new tab
    chrome.tabs.create({
      url: `https://knowledge-hunter.example.com/captures/${captureId}`
    });
  }
  
  // Helper functions
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
});