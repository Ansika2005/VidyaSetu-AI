// DOM Elements
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Authentication Functions
const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showSuccess(loginForm, 'Login successful!');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);

    } catch (error) {
        showError(loginForm, error.message);
    } finally {
        submitBtn.innerHTML = 'Login';
        submitBtn.disabled = false;
    }
};

const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        submitBtn.disabled = true;

        // Validate role
        const role = formData.get('role');
        const validRoles = ['teacher', 'student', 'parent'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role selected');
        }

        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: role
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showSuccess(registerForm, 'Registration successful! Please login.');
        setTimeout(() => {
            // Switch to login tab
            document.querySelector('#login-tab').click();
        }, 1500);

    } catch (error) {
        showError(registerForm, error.message);
    } finally {
        submitBtn.innerHTML = 'Register';
        submitBtn.disabled = false;
    }
};

// UI Helper Functions
const showError = (form, message) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger mt-3';
    alertDiv.textContent = message;
    
    // Remove existing alerts
    form.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    form.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
};

const showSuccess = (form, message) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success mt-3';
    alertDiv.textContent = message;
    
    // Remove existing alerts
    form.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    form.appendChild(alertDiv);
};

// Password Toggle Functionality
const initializePasswordToggles = () => {
    document.querySelectorAll('.toggle-password').forEach(toggleBtn => {
        toggleBtn.addEventListener('click', () => {
            const passwordInput = toggleBtn.previousElementSibling;
            const type = passwordInput.getAttribute('type');
            passwordInput.setAttribute('type', type === 'password' ? 'text' : 'password');
            toggleBtn.classList.toggle('fa-eye');
            toggleBtn.classList.toggle('fa-eye-slash');
        });
    });
};

// Check Authentication Status
const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        // Update UI for logged-in user
        const loginBtn = document.querySelector('[data-bs-target="#authModal"]');
        if (loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.setAttribute('data-bs-target', '');
            loginBtn.addEventListener('click', handleLogout);
        }

        // Add user info to navbar
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            const userInfo = document.createElement('li');
            userInfo.className = 'nav-item';
            userInfo.innerHTML = `
                <span class="nav-link">
                    Welcome, ${user.name} (${user.role})
                </span>
            `;
            navbar.appendChild(userInfo);
        }
    }
};

const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
};

// Study Buddy AI Functions
const initializeStudyBuddyAI = () => {
    const chatForm = document.getElementById('chatForm');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const themeToggle = document.getElementById('themeToggle');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    const tryFullVersionBtn = document.getElementById('tryFullVersion');

    // Theme Toggle
    themeToggle?.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });

    // Try Full Version button click handler
    tryFullVersionBtn?.addEventListener('click', () => {
        const authModal = new bootstrap.Modal(document.getElementById('authModal'));
        authModal.show();
    });

    // Quick Action Buttons
    quickActionBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            addMessage(btn.textContent, 'user');
            simulateAIResponse(btn.textContent);
        });
    });

    // Chat Form Submit
    chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            simulateAIResponse(message);
        }
    });

    // Add message to chat
    const addMessage = (text, type) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Show typing indicator
    const showTypingIndicator = () => {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.style.display = 'block';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    };

    // Hide typing indicator
    const hideTypingIndicator = () => {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    };

    // Simulate AI response
    const simulateAIResponse = (userMessage) => {
        showTypingIndicator();
        
        // Predefined responses for demo
        const responses = {
            "Explain Newton's Laws": "Newton's three laws of motion are fundamental principles of physics:\n1. An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force.\n2. Force equals mass times acceleration (F = ma).\n3. For every action, there is an equal and opposite reaction.",
            "Take a Math Quiz": "Let's start with a math problem:\nIf x + 2 = 5, what is the value of x?\nA) 2\nB) 3\nC) 4\nD) 5",
            "Get Study Tips": "Here are some effective study tips:\n1. Use active recall\n2. Space out your studying\n3. Create mind maps\n4. Teach others\n5. Take regular breaks",
            "Practice Problems": "Would you like practice problems in:\n1. Mathematics\n2. Physics\n3. Chemistry\n4. Biology\nJust type the subject number!",
            "Homework Help": "I can help with your homework! Please specify the subject and problem you're working on."
        };

        setTimeout(() => {
            hideTypingIndicator();
            const response = responses[userMessage] || "I understand you're asking about " + userMessage + ". Could you please be more specific about what you'd like to know?";
            addMessage(response, 'ai');
        }, 1500);
    };
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add form submit event listeners
    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);

    // Initialize password toggles
    initializePasswordToggles();

    // Check authentication status
    checkAuthStatus();

    // Initialize Bootstrap components if needed
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize Study Buddy AI if on study buddy page
    if (window.location.pathname.includes('studybuddy.html')) {
        initializeStudyBuddyAI();
    }
}); 