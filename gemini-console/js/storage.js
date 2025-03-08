class StorageManager {
    constructor() {
        this.storageKeys = {
            API_KEY: 'geminiApiKey',
            DARK_MODE: 'darkMode',
            CONVERSATIONS: 'conversations',
            SELECTED_MODEL: 'selectedModel',
            PARAMETERS: 'modelParameters'
        };
    }

    /**
     * Save API key to local storage
     * @param {string} apiKey - The API key to store
     */
    saveApiKey(apiKey) {
        try {
            localStorage.setItem(this.storageKeys.API_KEY, apiKey);
        } catch (error) {
            console.error('Error saving API key:', error);
            throw new Error('Failed to save API key');
        }
    }

    /**
     * Retrieve API key from local storage
     * @returns {string|null} The stored API key or null if not found
     */
    getApiKey() {
        return localStorage.getItem(this.storageKeys.API_KEY);
    }

    /**
     * Save theme preference
     * @param {boolean} isDark - Whether dark mode is enabled
     */
    saveThemePreference(isDark) {
        localStorage.setItem(this.storageKeys.DARK_MODE, isDark);
    }

    /**
     * Get theme preference
     * @returns {boolean} Whether dark mode is enabled
     */
    getThemePreference() {
        return localStorage.getItem(this.storageKeys.DARK_MODE) === 'true';
    }

    /**
     * Save model parameters
     * @param {Object} parameters - The model parameters to save
     */
    saveModelParameters(parameters) {
        try {
            localStorage.setItem(this.storageKeys.PARAMETERS, JSON.stringify(parameters));
        } catch (error) {
            console.error('Error saving parameters:', error);
            throw new Error('Failed to save model parameters');
        }
    }

    /**
     * Get saved model parameters
     * @returns {Object} The saved model parameters or default values
     */
    getModelParameters() {
        try {
            const saved = localStorage.getItem(this.storageKeys.PARAMETERS);
            return saved ? JSON.parse(saved) : {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxTokens: 256
            };
        } catch (error) {
            console.error('Error reading parameters:', error);
            return {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxTokens: 256
            };
        }
    }

    /**
     * Save selected model
     * @param {string} modelId - The ID of the selected model
     */
    saveSelectedModel(modelId) {
        localStorage.setItem(this.storageKeys.SELECTED_MODEL, modelId);
    }

    /**
     * Get selected model
     * @returns {string|null} The ID of the selected model or null if not found
     */
    getSelectedModel() {
        return localStorage.getItem(this.storageKeys.SELECTED_MODEL);
    }

    /**
     * Save a conversation to history
     * @param {Object} conversation - The conversation to save
     */
    saveConversation(conversation) {
        try {
            const conversations = this.getConversations();
            conversations.push({
                ...conversation,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            });
            
            // Keep only the last 50 conversations
            if (conversations.length > 50) {
                conversations.shift();
            }
            
            localStorage.setItem(this.storageKeys.CONVERSATIONS, JSON.stringify(conversations));
        } catch (error) {
            console.error('Error saving conversation:', error);
            throw new Error('Failed to save conversation');
        }
    }

    /**
     * Get all saved conversations
     * @returns {Array} Array of saved conversations
     */
    getConversations() {
        try {
            const saved = localStorage.getItem(this.storageKeys.CONVERSATIONS);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error reading conversations:', error);
            return [];
        }
    }

    /**
     * Get a specific conversation by ID
     * @param {string} id - The conversation ID
     * @returns {Object|null} The conversation object or null if not found
     */
    getConversationById(id) {
        const conversations = this.getConversations();
        return conversations.find(conv => conv.id === id) || null;
    }

    /**
     * Delete a conversation by ID
     * @param {string} id - The conversation ID to delete
     */
    deleteConversation(id) {
        try {
            const conversations = this.getConversations();
            const filtered = conversations.filter(conv => conv.id !== id);
            localStorage.setItem(this.storageKeys.CONVERSATIONS, JSON.stringify(filtered));
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw new Error('Failed to delete conversation');
        }
    }

    /**
     * Clear all conversations
     */
    clearConversations() {
        try {
            localStorage.setItem(this.storageKeys.CONVERSATIONS, JSON.stringify([]));
        } catch (error) {
            console.error('Error clearing conversations:', error);
            throw new Error('Failed to clear conversations');
        }
    }

    /**
     * Clear all stored data
     */
    clearAll() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw new Error('Failed to clear storage');
        }
    }

    /**
     * Check if local storage is available
     * @returns {boolean} Whether local storage is available
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Export the StorageManager class
window.StorageManager = StorageManager;
