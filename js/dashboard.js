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
        // Check authentication
        const authData = checkAuthentication();
        if (!authData) return;

        const { token, user } = authData;

        // Verify user is on correct dashboard
        verifyDashboardAccess(user.role);

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