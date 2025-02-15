document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    let conversationHistory = [];

    // Initialize chat
    function initializeChat() {
        showWelcomeMessage();
        setupEventListeners();
    }

    function showWelcomeMessage() {
        addMessage({
            text: "Hi! I'm your Study Buddy AI powered by Google Gemini. How can I help you today?",
            type: 'ai'
        });
    }

    function setupEventListeners() {
        // Chat form submission
        chatForm.addEventListener('submit', handleChatSubmit);

        // Quick action buttons
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.textContent;
                handleUserInput(question);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => {
            document.body.setAttribute('data-theme', 
                document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
            );
        });
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            handleUserInput(message);
            userInput.value = '';
        }
    }

    async function handleUserInput(message) {
        // Add user message to chat
        addMessage({ text: message, type: 'user' });
        
        showTypingIndicator();

        try {
            const response = await fetch('http://localhost:5001/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();
            hideTypingIndicator();
            addMessage({
                text: data.message,
                type: data.type
            });

            // Store in conversation history
            conversationHistory.push({
                role: 'user',
                content: message
            }, {
                role: 'assistant',
                content: data.message
            });

        } catch (error) {
            console.error('Chat error:', error);
            hideTypingIndicator();
            addMessage({
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                type: 'error'
            });
        }
    }

    function addMessage({ text, type }) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        // Format message text (handle markdown, code blocks, etc.)
        messageDiv.innerHTML = formatMessage(text);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessage(text) {
        // Basic markdown formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    function showTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.style.display = 'block';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // Initialize the chat
    initializeChat();
}); 