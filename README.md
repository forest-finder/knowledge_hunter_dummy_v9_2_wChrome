# Knowledge Hunter Chrome Extension

A powerful Chrome extension for capturing, organizing, and retrieving knowledge from the web.

## Features

- **Capture Web Content**: Save entire pages, selected text, links, or images
- **Organize Knowledge**: Categorize captures into collections
- **Search & Retrieve**: Quickly find your saved knowledge
- **Sync Across Devices**: Keep your knowledge available everywhere (when signed in)
- **Customizable**: Configure the extension to work the way you want

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "Knowledge Hunter"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The Knowledge Hunter extension should now be installed and visible in your toolbar

## Environment Variables and API Keys

This project uses environment variables to securely manage API keys and sensitive information. To set up the environment:

1. Copy the template file:
   ```
   cp assets/.env.example assets/.env
   ```

2. Edit the `.env` file and add your actual API keys:
   ```
   STRIPE_SECRET_ID=your_actual_key_here
   STRIPE_PUBLISHED_KEY=your_actual_key_here
   ...
   ```

3. **IMPORTANT**: Never commit your `.env` file to version control. It's already added to `.gitignore` to prevent accidental commits.

4. For Firebase configuration, the API keys are loaded from environment variables. Make sure to add your Firebase API keys to the `.env` file.

## Usage

### Capturing Content

There are several ways to capture content:

1. **Using the extension popup**:
   - Click the Knowledge Hunter icon in your toolbar
   - Use the "Capture Page" button to save the entire page
   - Use the "Capture Selection" button to save highlighted text

2. **Using the context menu**:
   - Right-click on a page, selected text, link, or image
   - Select "Knowledge Hunter" > "Capture Page/Selection/Link/Image"

3. **Using the floating button** (if enabled):
   - Click the floating Knowledge Hunter button that appears on web pages
   - Select the capture option you want

### Managing Captures

1. **View your captures**:
   - Click the Knowledge Hunter icon in your toolbar
   - Recent captures will be displayed in the popup
   - Click "View Collections" to see all your captures organized by collection

2. **Search your knowledge**:
   - Use the search box in the extension popup
   - Enter keywords to find relevant captures

### Settings

To customize the extension:

1. Click the Knowledge Hunter icon in your toolbar
2. Click the settings icon (⚙️) at the bottom of the popup
3. Adjust settings according to your preferences:
   - Toggle auto-sync
   - Change capture format
   - Set default collection
   - Enable/disable notifications
   - Enable/disable floating button

## Syncing

To sync your captures across devices:

1. Sign in to your Knowledge Hunter account
2. Your captures will automatically sync if auto-sync is enabled
3. Manual sync can be triggered from the settings page

## Privacy

Knowledge Hunter respects your privacy:

- All captures are stored locally by default
- Data is only sent to our servers when syncing is enabled and you're signed in
- You can export or delete your data at any time from the settings page

## Development

### Project Structure

```
knowledge_hunter_chrome/
├── manifest.json        # Extension configuration
├── popup.html           # Extension popup UI
├── popup.js             # Popup functionality
├── background.js        # Background script
├── content.js           # Content script for web page interaction
├── options.html         # Settings page
├── options.js           # Settings functionality
├── styles/              # CSS stylesheets
│   ├── popup.css        # Popup styles
│   └── options.css      # Settings page styles
└── images/              # Icons and images
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    ├── icon-128.png
    └── logo.png
```

### Building from Source

1. Clone the repository
2. Set up environment variables as described above
3. Make your changes
4. Load the extension in developer mode as described in the installation section

## Security Best Practices

This project follows these security best practices:

1. **Environment Variables**: All API keys and secrets are stored in environment variables, not in the code.
2. **Gitignore**: Sensitive files are excluded from version control via `.gitignore`.
3. **Template Files**: We provide `.env.example` as a template without real credentials.
4. **Configuration Classes**: We use dedicated configuration classes to access environment variables.
5. **No Hardcoded Secrets**: We never hardcode API keys or secrets in the source code.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository or contact support@knowledgehunter.example.com.