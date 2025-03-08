# Gemini Console

A modern web interface for interacting with Google's Gemini AI models through the Google AI Studio API.

## Features

- 🔑 Secure API key management
- 🤖 Model selection and discovery
- 💬 Interactive chat interface
- ⚙️ Adjustable model parameters
- 📝 Conversation history
- 🌗 Dark/Light theme support
- 📱 Responsive design
- ⌨️ Code snippet formatting and copying
- ♿ Accessibility features

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gemini-console.git
cd gemini-console
```

2. Open `index.html` in your web browser or serve it using a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. Enter your API key in the application to start using the Gemini models

## Usage

1. **API Key**: Enter your Google AI Studio API key in the designated input field. The key is stored securely in your browser's local storage.

2. **Model Selection**: Choose from available Gemini models in the dropdown menu.

3. **Chat Interface**: Type your message in the input field and press Enter or click the Send button to interact with the model.

4. **Parameters**:
   - Temperature: Controls randomness (0.0 to 1.0)
   - Max Tokens: Limits response length
   - Top P: Controls diversity of responses

5. **Conversation History**: View and manage your chat history in the sidebar. Click on any previous conversation to continue it.

## Features in Detail

### API Key Management
- Secure storage in browser's local storage
- Toggle visibility for easy copying
- Automatic validation

### Model Selection
- Fetches available models from API
- Displays model descriptions
- Remembers last selected model

### Chat Interface
- Real-time responses
- Code block formatting with syntax highlighting
- Copy code functionality
- Markdown support
- Message history

### Parameter Controls
- Adjustable temperature
- Max token limit control
- Top P and Top K settings
- Parameter presets

### Conversation Management
- Save conversations locally
- Resume previous chats
- Clear conversation history
- Export/Import conversations

### UI/UX Features
- Responsive design for all screen sizes
- Dark/Light theme toggle
- Custom scrollbars
- Loading indicators
- Error handling with user feedback
- Keyboard shortcuts

## Technical Details

### Technologies Used
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (Vanilla)
- Google AI Studio API
- Font Awesome Icons
- Google Fonts (Inter)
- Fira Code (for code blocks)

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Local Storage
The application stores the following data in your browser's local storage:
- API key
- Theme preference
- Conversation history
- Selected model
- Parameter settings

## Security Considerations

- API keys are stored in browser local storage
- No server-side storage of sensitive data
- All API calls are made directly from the client
- HTTPS recommended for production use

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google AI Studio for the Gemini API
- Tailwind CSS for the styling framework
- Font Awesome for icons
- Google Fonts for typography
