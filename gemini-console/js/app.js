// Initialize classes
const api = new GeminiAPI();
const storage = new StorageManager();
const ui = new UI();

// DOM Elements
const elements = {
    themeToggle: document.getElementById('themeToggle'),
    apiKeyInput: document.getElementById('apiKey'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    saveApiKey: document.getElementById('saveApiKey'),
    modelSelect: document.getElementById('modelSelect'),
    modelDescription: document.getElementById('modelDescription'),
    temperature: document.getElementById('temperature'),
    temperatureValue: document.getElementById('temperatureValue'),
    maxTokens: document.getElementById('maxTokens'),
    topP: document.getElementById('topP'),
    topPValue: document.getElementById('topPValue'),
    chatMessages: document.getElementById('chatMessages'),
    userInput: document.getElementById('userInput'),
    sendMessage: document.getElementById('sendMessage'),
    clearHistory: document.getElementById('clearHistory'),
    conversationHistory: document.getElementById('conversationHistory'),
    modelInfo: document.getElementById('modelInfo'),
    currentModel: document.getElementById('currentModel'),
    currentTemp: document.getElementById('currentTemp'),
    currentMaxTokens: document.getElementById('currentMaxTokens'),
    tokenCount: document.getElementById('tokenCount'),
    currentTokenCount: document.getElementById('currentTokenCount')
};

// State Management
const state = {
    apiKey: storage.getApiKey() || '',
    selectedModel: storage.getSelectedModel() || '',
    darkMode: storage.getThemePreference(),
    parameters: storage.getModelParameters(),
    currentConversation: null
};

// Theme Management
function initializeTheme() {
    if (state.darkMode) {
        document.documentElement.classList.add('dark');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function toggleTheme() {
    state.darkMode = !state.darkMode;
    document.documentElement.classList.toggle('dark');
    storage.saveThemePreference(state.darkMode);
    elements.themeToggle.innerHTML = state.darkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
}

// API Key Management
function toggleApiKeyVisibility() {
    ui.togglePasswordVisibility(elements.apiKeyInput, elements.toggleApiKey);
}

async function handleApiKeyChange(event) {
    const apiKey = event.target.value.trim();
    if (!apiKey) {
        ui.showError('Please enter an API key');
        return;
    }

    state.apiKey = apiKey;
    api.setApiKey(apiKey);
    storage.saveApiKey(apiKey);
    await validateAndFetchModels();
}

// Model Management
async function validateAndFetchModels() {
    let loadingElement;
    try {
        elements.modelSelect.disabled = true;
        loadingElement = ui.showLoading(elements.modelDescription);

        const models = await api.getModels();
        
        // Clear existing options
        elements.modelSelect.innerHTML = '<option value="">Select a model</option>';
        
        // Add new options
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            elements.modelSelect.appendChild(option);
        });
        
        if (state.selectedModel) {
            elements.modelSelect.value = state.selectedModel;
            const selectedModel = models.find(m => m.id === state.selectedModel);
            if (selectedModel && elements.modelDescription) {
                elements.modelDescription.textContent = selectedModel.description;
            }
            updateModelInfo();
        }
    } catch (error) {
        ui.showError('Failed to load models. Please check your API key.');
        console.error('Error loading models:', error);
        elements.modelSelect.innerHTML = '<option value="">Select a model</option>';
    } finally {
        elements.modelSelect.disabled = false;
        if (loadingElement) {
            ui.removeLoading(loadingElement);
        }
    }
}

async function handleModelSelect(event) {
    try {
        const selectedModel = event.target.value;
        const models = await api.getModels();
        const model = models.find(m => m.id === selectedModel);
        
        if (model) {
            state.selectedModel = model.id;
            storage.saveSelectedModel(state.selectedModel);
            
            // Update model description
            const descriptionElement = document.getElementById('modelDescription');
            descriptionElement.textContent = model.description;
            
            // Update model info banner
            updateModelInfo();
            
            // Enable chat if API key is present
            elements.sendMessage.disabled = !state.apiKey;
        }
    } catch (error) {
        ui.showError('Failed to load model information');
        console.error('Error in handleModelSelect:', error);
    }
}

function handleSaveApiKey() {
    const apiKey = elements.apiKeyInput.value.trim();
    if (!apiKey) {
        ui.showError('Please enter an API key');
        return;
    }

    try {
        state.apiKey = apiKey;
        api.setApiKey(apiKey);
        storage.saveApiKey(apiKey);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'absolute -top-8 left-0 right-0 text-center text-xs text-green-500 dark:text-green-400';
        successMessage.textContent = 'API key saved successfully';
        elements.apiKeyInput.parentElement.appendChild(successMessage);
        
        // Remove success message after 2 seconds
        setTimeout(() => successMessage.remove(), 2000);
        
        // Fetch models after saving API key
        validateAndFetchModels();
    } catch (error) {
        ui.showError('Failed to save API key');
    }
}

function updateModelInfo() {
    if (state.selectedModel) {
        elements.modelInfo.classList.remove('hidden');
        elements.currentModel.textContent = state.selectedModel;
        elements.currentTemp.textContent = state.parameters.temperature;
        elements.currentMaxTokens.textContent = state.parameters.maxTokens;
    } else {
        elements.modelInfo.classList.add('hidden');
    }
}

// Chat Interface
async function handleSendMessage() {
    const message = elements.userInput.value.trim();
    if (!message) return;

    if (!state.apiKey) {
        ui.showError('Please enter your API key to start chatting');
        elements.apiKeyInput.focus();
        return;
    }

    if (!state.selectedModel) {
        ui.showError('Please select a model before sending a message');
        elements.modelSelect.focus();
        return;
    }

    // Disable input and show loading state
    elements.userInput.value = '';
    elements.userInput.disabled = true;
    elements.sendMessage.disabled = true;
    elements.sendMessage.innerHTML = `
        <div class="flex items-center space-x-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Sending...</span>
        </div>
    `;

    try {
        // Add user message with animation
        ui.addMessage(message, true, elements.chatMessages);
        
        // Show typing indicator
        const loadingElement = ui.showLoading(elements.chatMessages);
        
        // Generate response
        const response = await api.generateContent(
            state.selectedModel,
            message,
            state.parameters
        );
        
        // Remove loading indicator
        ui.removeLoading(loadingElement);
        
        // Add model response with animation
        ui.addMessage(response, false, elements.chatMessages);

        // Save conversation
        saveConversation(message, response);
        
        // Update token count if available
        if (elements.tokenCount) {
            elements.tokenCount.classList.remove('hidden');
            // Assuming 4 tokens per word as a rough estimate
            const estimatedTokens = message.split(' ').length * 4;
            elements.currentTokenCount.textContent = estimatedTokens;
        }
    } catch (error) {
        ui.showError(error.message);
    } finally {
        // Reset UI state
        elements.userInput.disabled = false;
        elements.sendMessage.disabled = false;
        elements.sendMessage.innerHTML = `
            <i class="fas fa-paper-plane"></i>
            <span>Send</span>
        `;
        elements.userInput.focus();
    }
}

function saveConversation(userMessage, modelResponse) {
    // Generate a descriptive title from the user's message
    let title = userMessage.slice(0, 50);
    if (userMessage.length > 50) {
        // Try to cut at the last complete word
        const lastSpace = title.lastIndexOf(' ');
        if (lastSpace > 30) { // Only adjust if we're not cutting too short
            title = title.slice(0, lastSpace);
        }
        title += '...';
    }

    const conversation = {
        id: Date.now().toString(),
        title,
        messages: [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: modelResponse }
        ],
        timestamp: new Date().toISOString(),
        model: state.selectedModel
    };

    storage.saveConversation(conversation);
    updateConversationHistory();
}

// Conversation History
function updateConversationHistory() {
    const conversations = storage.getConversations();
    elements.conversationHistory.innerHTML = '';
    
    if (conversations.length === 0) {
        elements.conversationHistory.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-6">
                <i class="fas fa-comments text-4xl mb-2"></i>
                <p class="text-sm text-center">No conversations yet. Start chatting to see your history here.</p>
            </div>
        `;
        return;
    }
    
    conversations.forEach(conversation => {
        const element = ui.createConversationHistoryItem(conversation);
        element.addEventListener('click', () => loadConversation(conversation));
        elements.conversationHistory.appendChild(element);
    });
}

function loadConversation(conversation) {
    state.currentConversation = conversation;
    elements.chatMessages.innerHTML = '';
    
    conversation.messages.forEach(message => {
        ui.addMessage(message.content, message.role === 'user', elements.chatMessages);
    });
}

function clearHistory() {
    // Show a modern confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal-backdrop';
    confirmDialog.innerHTML = `
        <div class="modal-content p-6 max-w-sm mx-auto">
            <div class="text-center">
                <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4 flex items-center justify-center">
                    <i class="fas fa-trash-alt text-red-500 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Clear Conversation History</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Are you sure you want to clear all conversations? This action cannot be undone.
                </p>
                <div class="flex space-x-3">
                    <button id="cancelClear" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                        Cancel
                    </button>
                    <button id="confirmClear" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200">
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    // Handle dialog actions
    document.getElementById('cancelClear').onclick = () => {
        confirmDialog.remove();
    };
    
    document.getElementById('confirmClear').onclick = () => {
        storage.clearConversations();
        elements.chatMessages.innerHTML = '';
        updateConversationHistory();
        state.currentConversation = null;
        confirmDialog.remove();
        
        // Show success notification
        ui.showSuccess('Conversation history cleared successfully');
    };
}

// Parameter Management
function handleParameterChange(parameter, value) {
    state.parameters[parameter] = value;
    storage.saveModelParameters(state.parameters);
    updateModelInfo();
}

// Event Listeners
function initializeEventListeners() {
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);
    elements.apiKeyInput.addEventListener('change', handleApiKeyChange);
    elements.saveApiKey.addEventListener('click', handleSaveApiKey);
    elements.modelSelect.addEventListener('change', handleModelSelect);
    
    elements.temperature.addEventListener('input', (e) => {
        ui.updateParameterValue('temperature', e.target.value);
        handleParameterChange('temperature', parseFloat(e.target.value));
    });
    
    elements.topP.addEventListener('input', (e) => {
        ui.updateParameterValue('topP', e.target.value);
        handleParameterChange('topP', parseFloat(e.target.value));
    });
    
    elements.maxTokens.addEventListener('change', (e) => {
        handleParameterChange('maxTokens', parseInt(e.target.value));
    });
    
    elements.sendMessage.addEventListener('click', handleSendMessage);
    elements.clearHistory.addEventListener('click', clearHistory);
    
    // Add keyboard shortcuts
    elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Add save API key on Ctrl+S / Cmd+S
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && document.activeElement === elements.apiKeyInput) {
            e.preventDefault();
            handleSaveApiKey();
        }
    });
}

// Initialize Application
async function initializeApp() {
    try {
        initializeTheme();
        initializeEventListeners();
        updateConversationHistory();
        
        // Set initial parameter values
        elements.temperature.value = state.parameters.temperature;
        elements.topP.value = state.parameters.topP;
        elements.maxTokens.value = state.parameters.maxTokens;
        
        ui.updateParameterValue('temperature', state.parameters.temperature);
        ui.updateParameterValue('topP', state.parameters.topP);
        
        // Set API key if exists
        if (state.apiKey) {
            elements.apiKeyInput.value = state.apiKey;
            api.setApiKey(state.apiKey);
        }

        // Always load models to show available options
        await validateAndFetchModels();
        
        // Disable send button if no API key
        elements.sendMessage.disabled = !state.apiKey;
        
    } catch (error) {
        console.error('Error initializing app:', error);
        ui.showError('Failed to initialize application');
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);
