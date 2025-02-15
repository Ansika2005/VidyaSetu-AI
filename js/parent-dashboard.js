document.addEventListener('DOMContentLoaded', () => {
    loadChildrenOverview();
    loadRecentActivities();
    loadUpcomingEvents();
    loadAcademicProgress();
});

async function loadChildrenOverview() {
    try {
        const response = await fetch('/api/parent/children', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const children = await response.json();
        const overviewContainer = document.getElementById('childrenOverview');
        
        overviewContainer.innerHTML = children.map(child => `
            <div class="col-md-4 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="card-title mb-0">${child.name}</h6>
                            <span class="badge bg-${getProgressBadgeColor(child.overall_progress)}">
                                ${child.overall_progress}%
                            </span>
                        </div>
                        <p class="text-muted">Class ${child.grade}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">Attendance</small>
                            <span class="text-${getAttendanceColor(child.attendance)}">
                                ${child.attendance}%
                            </span>
                        </div>
                        <div class="progress mt-2">
                            <div class="progress-bar" role="progressbar" 
                                 style="width: ${child.overall_progress}%" 
                                 aria-valuenow="${child.overall_progress}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-top">
                            <div class="d-flex justify-content-around">
                                <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${child.id})">
                                    <i class="fas fa-info-circle"></i> Details
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="contactTeacher(${child.id})">
                                    <i class="fas fa-comment"></i> Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading children overview:', error);
        showAlert('Error loading children data', 'danger');
    }
}

// Add the remaining functions for loading activities, events, and progress...

function getProgressBadgeColor(progress) {
    if (progress >= 80) return 'success';
    if (progress >= 60) return 'warning';
    return 'danger';
}

function getAttendanceColor(attendance) {
    if (attendance >= 90) return 'success';
    if (attendance >= 75) return 'warning';
    return 'danger';
}

function viewDetails(childId) {
    // Implement view details functionality
    console.log('Viewing details for child:', childId);
}

function contactTeacher(childId) {
    // Implement contact teacher functionality
    console.log('Contacting teacher for child:', childId);
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.row'));
    
    setTimeout(() => alertDiv.remove(), 5000);
} 