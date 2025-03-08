class GeminiAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
    }

    /**
     * Set or update the API key
     * @param {string} apiKey - The Google AI Studio API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Get available Gemini models
     * @returns {Promise<Array>} Array of available models
     */
    async getModels() {
        try {
            // Define available models with version information
            const models = [
                {
                    id: 'gemini-2.0-pro',
                    name: 'Gemini 2.0 Pro',
                    version: '2.0',
                    type: 'pro',
                    description: 'Latest generation model for advanced text generation and analysis',
                    maxTokens: 32768,
                    supportedGenerationMethods: ['generateText']
                },
                {
                    id: 'gemini-2.0-pro-vision',
                    name: 'Gemini 2.0 Pro Vision',
                    version: '2.0',
                    type: 'pro-vision',
                    description: 'Latest generation model for advanced image and text analysis',
                    maxTokens: 32768,
                    supportedGenerationMethods: ['generateText']
                },
                {
                    id: 'gemini-2.0-pro-thinking',
                    name: 'Gemini 2.0 Pro Thinking',
                    version: '2.0',
                    type: 'pro-thinking',
                    description: 'Latest generation model optimized for complex reasoning tasks',
                    maxTokens: 32768,
                    supportedGenerationMethods: ['generateText']
                },
                {
                    id: 'gemini-2.0-flash',
                    name: 'Gemini 2.0 Flash',
                    version: '2.0',
                    type: 'flash',
                    description: 'High-speed model for quick responses',
                    maxTokens: 32768,
                    supportedGenerationMethods: ['generateText']
                },
                {
                    id: 'gemini-2.0-flash-lite',
                    name: 'Gemini 2.0 Flash Lite',
                    version: '2.0',
                    type: 'flash-lite',
                    description: 'Lightweight version of Flash model for faster processing',
                    maxTokens: 32768,
                    supportedGenerationMethods: ['generateText']
                },
                {
                    id: 'gemini-pro',
                    name: 'Gemini Pro',
                    version: '1.0',
                    type: 'pro',
                    description: 'Standard model for text generation and analysis',
                    maxTokens: 32768,
                    supportedGenerationMethods: ['generateText']
                },
                {
                    id: 'gemini-pro-vision',
                    name: 'Gemini Pro Vision',
                    version: '1.0',
                    type: 'pro-vision',
                    description: 'Standard model for image and text analysis',
                    maxTokens: 32768,
                    supportedGenerationMethods: ['generateText']
                },
                {
                    id: 'gemini-pro-thinking',
                    name: 'Gemini Pro Thinking',
                    version: '1.0',
                    type: 'pro-thinking',
                    description: 'Standard model for complex reasoning',
                    maxTokens: 32768,
                    supportedGenerationMethods: ['generateText']
                }
            ];

            // Sort models by version (descending) and then by type
            return models.sort((a, b) => {
                // First compare versions
                const versionComparison = parseFloat(b.version) - parseFloat(a.version);
                if (versionComparison !== 0) return versionComparison;
                
                // If versions are equal, sort by type
                const typeOrder = {
                    'pro': 1,
                    'pro-vision': 2,
                    'pro-thinking': 3,
                    'flash': 4,
                    'flash-lite': 5
                };
                
                return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
            });
        } catch (error) {
            console.error('Error fetching models:', error);
            throw new Error('Failed to fetch models. Please check your API key and try again.');
        }
    }

    /**
     * Send a chat request to the Gemini model
     * @param {string} modelId - The ID of the selected model
     * @param {string} prompt - The user's input prompt
     * @param {Object} parameters - Model parameters (temperature, maxTokens, etc.)
     * @returns {Promise<Object>} The model's response
     */
    async generateContent(modelId, prompt, parameters = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/models/${modelId}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: parameters.temperature || 0.7,
                        topP: parameters.topP || 0.9,
                        topK: parameters.topK || 40,
                        maxOutputTokens: parameters.maxTokens || 256,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to generate content');
            }

            const data = await response.json();
            return this.parseResponse(data);
        } catch (error) {
            console.error('Error generating content:', error);
            throw new Error('Failed to generate response. Please try again.');
        }
    }

    /**
     * Parse the API response and extract the generated text
     * @param {Object} response - The raw API response
     * @returns {string} The formatted response text
     */
    parseResponse(response) {
        try {
            const candidates = response.candidates || [];
            if (candidates.length === 0) {
                throw new Error('No response generated');
            }

            const content = candidates[0].content;
            if (!content || !content.parts || content.parts.length === 0) {
                throw new Error('Invalid response format');
            }

            return content.parts[0].text || '';
        } catch (error) {
            console.error('Error parsing response:', error);
            throw new Error('Failed to parse model response');
        }
    }

    /**
     * Start a chat session with conversation history
     * @param {string} modelId - The ID of the selected model
     * @param {Array} history - Array of previous messages
     * @param {string} prompt - The new user prompt
     * @param {Object} parameters - Model parameters
     * @returns {Promise<Object>} The model's response
     */
    async chat(modelId, history, prompt, parameters = {}) {
        try {
            const messages = history.map(msg => ({
                parts: [{ text: msg.content }],
                role: msg.role
            }));

            messages.push({
                parts: [{ text: prompt }],
                role: 'user'
            });

            const response = await fetch(`${this.baseUrl}/models/${modelId}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: messages,
                    generationConfig: {
                        temperature: parameters.temperature || 0.7,
                        topP: parameters.topP || 0.9,
                        topK: parameters.topK || 40,
                        maxOutputTokens: parameters.maxTokens || 256,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to generate chat response');
            }

            const data = await response.json();
            return this.parseResponse(data);
        } catch (error) {
            console.error('Error in chat:', error);
            throw new Error('Failed to generate chat response. Please try again.');
        }
    }

    /**
     * Handle rate limiting and retries
     * @param {Function} apiCall - The API call to execute
     * @param {number} maxRetries - Maximum number of retry attempts
     * @returns {Promise<any>} The API response
     */
    async handleRateLimit(apiCall, maxRetries = 3) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                if (error.status === 429 && attempt < maxRetries - 1) {
                    const retryAfter = parseInt(error.headers?.get('retry-after') || '5');
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    continue;
                }
                throw error;
            }
        }
    }
}

// Export the API class
window.GeminiAPI = GeminiAPI;
