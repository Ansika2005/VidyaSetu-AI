// Dashboard Configuration
const DASHBOARD_ROUTES = {
    student: '/dashboards/student-dashboard.html',
    teacher: '/dashboards/teacher-dashboard.html',
    parent: '/dashboards/parent-dashboard.html'
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            // If not logged in, redirect to landing page
            window.location.href = '/index.html';
            return;
        }

        // Verify user is on correct dashboard
        const currentPath = window.location.pathname;
        const dashboardUrls = {
            student: '/dashboards/student-dashboard.html',
            teacher: '/dashboards/teacher-dashboard.html',
            parent: '/dashboards/parent-dashboard.html'
        };

        if (currentPath !== dashboardUrls[user.role]) {
            window.location.href = dashboardUrls[user.role];
            return;
        }

        // Initialize UI components
        initializeUI(user);
        
        // Fetch and display user data
        await fetchUserData(token);

        // Initialize event listeners
        initializeEventListeners();

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showError('Failed to initialize dashboard');
    }
}

function checkAuthentication() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/index.html';
        return null;
    }

    return { token, user };
}

function verifyDashboardAccess(userRole) {
    const currentPath = window.location.pathname;
    const correctPath = DASHBOARD_ROUTES[userRole];

    if (!currentPath.includes(correctPath)) {
        window.location.href = correctPath;
    }
}

function initializeUI(user) {
    // Update user information in header
    const nameElement = document.getElementById('studentName') || 
                       document.getElementById('teacherName') || 
                       document.getElementById('parentName');
    const emailElement = document.getElementById('userEmail');

    if (nameElement) nameElement.textContent = user.name;
    if (emailElement) emailElement.textContent = user.email;

    // Initialize sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        // Store sidebar state
        localStorage.setItem('sidebarState', sidebar.classList.contains('active'));
    });

    // Restore sidebar state
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'true') {
        sidebar?.classList.add('active');
    }
}

async function fetchUserData(token) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        showError('Failed to load dashboard data');
    }
}

function updateDashboard(data) {
    const userRole = data.role;

    switch (userRole) {
        case 'teacher':
            updateTeacherDashboard(data);
            break;
        case 'student':
            updateStudentDashboard(data);
            break;
        case 'parent':
            updateParentDashboard(data);
            break;
    }
}

function updateTeacherDashboard(data) {
    // Update teacher-specific elements
    updateStatistics(data.statistics);
    updateSchedule(data.schedule);
    updateTasks(data.tasks);
}

function updateStudentDashboard(data) {
    // Update student-specific elements
    updateProgress(data.progress);
    updateCourses(data.courses);
    updateActivities(data.activities);
}

function updateParentDashboard(data) {
    // Update parent-specific elements
    updateChildren(data.children);
    updateNotifications(data.notifications);
    updateMeetings(data.meetings);
}

function initializeEventListeners() {
    // Logout handler
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Task checkboxes
    document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleTaskChange);
    });

    // Navigation items
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Initialize Study Buddy AI when modal opens
    const studyBuddyModal = document.getElementById('studyBuddyModal');
    if (studyBuddyModal) {
        studyBuddyModal.addEventListener('show.bs.modal', initializeStudyBuddyAI);
    }
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

function handleTaskChange(e) {
    const taskId = e.target.id;
    const isCompleted = e.target.checked;
    
    // Update task status in UI
    const taskLabel = document.querySelector(`label[for="${taskId}"]`);
    taskLabel.style.textDecoration = isCompleted ? 'line-through' : 'none';
    
    // TODO: Send update to backend
    updateTaskStatus(taskId, isCompleted);
}

function handleNavigation(e) {
    const currentActive = document.querySelector('.sidebar-menu li.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    e.target.closest('li').classList.add('active');
}

// Helper Functions
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.style.zIndex = '1000';
    alert.textContent = message;

    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.style.zIndex = '1000';
    alert.textContent = message;

    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Utility Functions
function updateStatistics(stats) {
    if (!stats) return;
    // Update statistics cards
    Object.entries(stats).forEach(([key, value]) => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (element) element.textContent = value;
    });
}

function updateSchedule(schedule) {
    if (!schedule) return;
    const scheduleList = document.querySelector('.schedule-list');
    if (!scheduleList) return;

    scheduleList.innerHTML = schedule.map(item => `
        <div class="schedule-item">
            <div class="time">${item.time}</div>
            <div class="class-info">
                <h4>${item.subject} - ${item.class}</h4>
                <p>Topic: ${item.topic}</p>
            </div>
            <div class="status">${item.status}</div>
        </div>
    `).join('');
}

async function updateTaskStatus(taskId, isCompleted) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: isCompleted })
        });

        if (!response.ok) throw new Error('Failed to update task');
        
        showSuccess('Task updated successfully');
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task');
    }
}

// Study Buddy AI Functions
function initializeStudyBuddyAI() {
    const chatForm = document.getElementById('chatForm');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    // Show welcome message
    addMessage({
        text: "Hi! I'm your Study Buddy AI powered by Google Gemini. How can I help you today?",
        type: 'ai'
    });

    // Chat form submission
    chatForm.addEventListener('submit', handleChatSubmit);

    // Quick action buttons
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.textContent;
            handleUserInput(question);
        });
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
    addMessage({ text: message, type: 'user' });
    showTypingIndicator();

    try {
        const response = await fetch('http://localhost:5000/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        hideTypingIndicator();
        addMessage({
            text: data.message,
            type: data.type
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
    messageDiv.innerHTML = formatMessage(text);
    chatMessages.appendChild(messageDiv);
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

// Add this function to handle logout
function logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    window.location.href = '/index.html';
}

// Add this to display user welcome message
function displayUserWelcome() {
    const user = JSON.parse(localStorage.getItem('user'));
    const welcomeElement = document.getElementById('userWelcome');
    if (user && welcomeElement) {
        welcomeElement.textContent = `Welcome, ${user.name}`;
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', () => {
    displayUserWelcome();
    checkAuth();
});

// Add authentication check
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '/index.html';
        return;
    }

    // Check if user is on the correct dashboard
    const currentPath = window.location.pathname;
    const userRole = user.role;
    
    if (currentPath.includes('parent-dashboard') && userRole !== 'parent' ||
        currentPath.includes('teacher-dashboard') && userRole !== 'teacher' ||
        currentPath.includes('student-dashboard') && userRole !== 'student') {
        window.location.href = '/index.html';
    }
} 