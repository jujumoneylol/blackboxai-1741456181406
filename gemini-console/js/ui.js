class UI {
    constructor() {
        this.messageTemplates = {
            user: (message) => `
                <div class="mb-6 ml-auto max-w-[80%] animate-fade-in">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 order-2 ml-4">
                            <div class="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center transition-all duration-200 hover:bg-primary-500/20 dark:hover:bg-primary-500/30">
                                <i class="fas fa-user text-primary-500"></i>
                            </div>
                        </div>
                        <div class="message-bubble user bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                            ${this.formatMessage(message)}
                        </div>
                    </div>
                </div>
            `,
            assistant: (message) => `
                <div class="mb-6 mr-auto max-w-[80%] animate-fade-in">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 mr-4">
                            <div class="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center transition-all duration-200 hover:bg-primary-500/20 dark:hover:bg-primary-500/30">
                                <i class="fas fa-robot text-primary-500"></i>
                            </div>
                        </div>
                        <div class="message-bubble assistant bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                            ${this.formatMessage(message)}
                        </div>
                    </div>
                </div>
            `,
            notification: (message, type = 'error') => {
                const types = {
                    error: {
                        icon: 'exclamation-circle',
                        iconColor: 'text-red-500',
                        bgColor: 'bg-red-50 dark:bg-red-900/20',
                        borderColor: 'border-red-500',
                        textColor: 'text-red-800 dark:text-red-200',
                        buttonColor: 'text-red-500 hover:text-red-600'
                    },
                    success: {
                        icon: 'check-circle',
                        iconColor: 'text-green-500',
                        bgColor: 'bg-green-50 dark:bg-green-900/20',
                        borderColor: 'border-green-500',
                        textColor: 'text-green-800 dark:text-green-200',
                        buttonColor: 'text-green-500 hover:text-green-600'
                    }
                };
                
                const style = types[type] || types.error;
                
                return `
                    <div class="notification ${style.bgColor} border-l-4 ${style.borderColor} animate-fade-in">
                        <div class="flex items-center p-4">
                            <div class="flex-shrink-0">
                                <i class="fas fa-${style.icon} ${style.iconColor} text-xl"></i>
                            </div>
                            <div class="ml-3 flex-1">
                                <p class="text-sm font-medium ${style.textColor}">${message}</p>
                            </div>
                            <div class="ml-auto pl-3">
                                <button class="${style.buttonColor} transition-colors duration-200" 
                                        onclick="this.parentElement.parentElement.parentElement.remove()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            },
            loading: () => `
                <div class="flex items-center justify-center p-6">
                    <div class="relative">
                        <div class="w-12 h-12 rounded-xl border-2 border-primary-500/20 border-t-primary-500 animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <i class="fas fa-robot text-primary-500 text-sm animate-pulse"></i>
                        </div>
                    </div>
                </div>
            `,
            codeBlock: (code, language = '') => `
                <div class="code-block group bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden my-4 transition-all duration-200 hover:shadow-lg">
                    <div class="flex justify-between items-center px-4 py-2 bg-gray-100/50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex items-center">
                            <i class="fas fa-code text-primary-500 mr-2"></i>
                            <span class="text-xs font-medium text-gray-600 dark:text-gray-300">${language || 'Code'}</span>
                        </div>
                        <button 
                            onclick="ui.copyCode(this)" 
                            class="text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center space-x-1 opacity-0 group-hover:opacity-100"
                        >
                            <i class="fas fa-copy"></i>
                            <span>Copy</span>
                        </button>
                    </div>
                    <div class="p-4 overflow-x-auto">
                        <pre class="text-sm font-mono"><code class="text-gray-800 dark:text-gray-200">${this.escapeHtml(code.trim())}</code></pre>
                    </div>
                </div>
            `
        };
    }

    /**
     * Format a message with code blocks and markdown
     * @param {string} message - The message to format
     * @returns {string} Formatted HTML
     */
    formatMessage(message) {
        // Handle code blocks
        message = message.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => 
            this.messageTemplates.codeBlock(code, lang)
        );

        // Handle inline code
        message = message.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>');

        // Handle line breaks
        message = message.replace(/\n/g, '<br>');

        return message;
    }

    /**
     * Escape HTML special characters
     * @param {string} unsafe - The string to escape
     * @returns {string} Escaped string
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Copy code to clipboard
     * @param {HTMLElement} button - The copy button element
     */
    async copyCode(button) {
        const codeBlock = button.parentElement.nextElementSibling;
        const code = codeBlock.textContent;
        
        try {
            await navigator.clipboard.writeText(code);
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
            this.showError('Failed to copy code to clipboard');
        }
    }

    /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification ('error' or 'success')
     */
    showNotification(message, type = 'error') {
        const container = document.getElementById('notification-container');
        const notificationElement = document.createElement('div');
        notificationElement.innerHTML = this.messageTemplates.notification(message, type);
        container.appendChild(notificationElement.firstChild);
        
        setTimeout(() => {
            const notification = notificationElement.firstChild;
            if (notification) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    /**
     * Show an error notification
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show a success notification
     * @param {string} message - The success message to display
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show a loading indicator
     * @param {HTMLElement} container - The container element
     * @returns {HTMLElement} The loading element
     */
    showLoading(container) {
        const loadingElement = document.createElement('div');
        loadingElement.innerHTML = this.messageTemplates.loading();
        container.appendChild(loadingElement.firstChild);
        return loadingElement.firstChild;
    }

    /**
     * Remove a loading indicator
     * @param {HTMLElement} loadingElement - The loading element to remove
     */
    removeLoading(loadingElement) {
        if (loadingElement && loadingElement.parentElement) {
            loadingElement.remove();
        }
    }

    /**
     * Add a message to the chat
     * @param {string} message - The message content
     * @param {boolean} isUser - Whether the message is from the user
     * @param {HTMLElement} container - The container element
     */
    addMessage(message, isUser, container) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = isUser ? 
            this.messageTemplates.user(message) : 
            this.messageTemplates.assistant(message);
        container.appendChild(messageElement.firstChild);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Update the model selection dropdown
     * @param {Array} models - Array of available models
     * @param {HTMLElement} selectElement - The select element
     */
    updateModelSelect(models, selectElement) {
        selectElement.innerHTML = `
            <option value="">Select a model</option>
            ${models.map(model => `
                <option value="${model.id}">${model.name}</option>
            `).join('')}
        `;
    }

    /**
     * Update a parameter value display
     * @param {string} parameter - The parameter name
     * @param {string|number} value - The new value
     */
    updateParameterValue(parameter, value) {
        const valueElement = document.getElementById(`${parameter}Value`);
        if (valueElement) {
            valueElement.textContent = value;
        }
    }

    /**
     * Toggle password visibility
     * @param {HTMLElement} inputElement - The input element
     * @param {HTMLElement} toggleButton - The toggle button
     */
    togglePasswordVisibility(inputElement, toggleButton) {
        const type = inputElement.type;
        inputElement.type = type === 'password' ? 'text' : 'password';
        toggleButton.innerHTML = type === 'password' ? 
            '<i class="fas fa-eye-slash"></i>' : 
            '<i class="fas fa-eye"></i>';
    }

    /**
     * Create a conversation history item
     * @param {Object} conversation - The conversation object
     * @returns {HTMLElement} The conversation history item element
     */
    createConversationHistoryItem(conversation) {
        const element = document.createElement('div');
        element.className = 'group p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer';
        
        // Format the date in a more readable way
        const date = new Date(conversation.timestamp);
        const formattedDate = date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        element.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center">
                        <i class="fas fa-comments text-primary-500"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate pr-4">
                            ${conversation.title || 'Untitled Conversation'}
                        </h3>
                        <button 
                            class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 dark:hover:text-red-400" 
                            onclick="event.stopPropagation(); ui.deleteConversation('${conversation.id}')"
                            aria-label="Delete conversation"
                        >
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="mt-1 flex items-center space-x-2 text-xs">
                        <span class="text-gray-500 dark:text-gray-400">
                            ${formattedDate}
                        </span>
                        ${conversation.model ? `
                            <span class="text-gray-300 dark:text-gray-600">•</span>
                            <span class="text-primary-500 dark:text-primary-400">
                                <i class="fas fa-microchip mr-1"></i>${conversation.model.split('-')[1]}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        return element;
    }
}

// Export the UI class
window.UI = UI;
