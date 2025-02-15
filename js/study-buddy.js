document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    const typingIndicator = document.querySelector('.typing-indicator');

    // Check server connection when modal opens
    async function checkServerConnection() {
        try {
            const response = await fetch('http://localhost:5001/api/ai/health');
            const data = await response.json();
            return data.status === 'ok';
        } catch (error) {
            console.error('Server connection error:', error);
            return false;
        }
    }

    // Initialize chat when modal opens
    const studyBuddyModal = document.getElementById('studyBuddyModal');
    studyBuddyModal?.addEventListener('shown.bs.modal', async () => {
        const isServerConnected = await checkServerConnection();
        if (!isServerConnected) {
            addMessage({
                text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
                type: 'error'
            });
            return;
        }

        if (!chatMessages.querySelector('.ai-message')) {
            addMessage({
                text: "Hi! I'm your Study Buddy AI. How can I help you with your studies today?",
                type: 'ai'
            });
        }
    });

    // Handle chat form submission
    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            await handleUserInput(message);
            userInput.value = '';
        }
    });

    // Handle quick action buttons
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const question = btn.textContent.trim();
            await handleUserInput(question);
        });
    });

    async function handleUserInput(message) {
        addMessage({ text: message, type: 'user' });
        showTypingIndicator();

        try {
            const response = await fetch('http://localhost:5001/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            addMessage({
                text: data.message,
                type: 'ai'
            });

        } catch (error) {
            console.error('Chat error:', error);
            addMessage({
                text: "Sorry, I'm having trouble connecting. Please try again.",
                type: 'error'
            });
        } finally {
            hideTypingIndicator();
        }
    }

    function addMessage({ text, type }) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = formatMessage(text);
        chatMessages.insertBefore(messageDiv, typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    function showTypingIndicator() {
        typingIndicator.classList.remove('d-none');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('d-none');
    }
}); 