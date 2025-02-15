// Quiz Generator functionality
const quizForm = document.getElementById('quizGeneratorForm');
const pasteContentBtn = document.getElementById('pasteContent');
const contentTextArea = document.getElementById('contentTextArea');
const quizResult = document.getElementById('quizResult');
const quizPreview = document.querySelector('.quiz-preview');
const assignQuizBtn = document.getElementById('assignQuiz');

let generatedQuiz = null;

if (pasteContentBtn) {
    pasteContentBtn.addEventListener('click', () => {
        contentTextArea.classList.toggle('d-none');
    });
}

if (quizForm) {
    // Add loading state
    const submitButton = quizForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    quizForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating Quiz...';

        const formData = new FormData();
        const fileInput = document.getElementById('contentFile');
        const textArea = contentTextArea.querySelector('textarea');

        try {
            if (fileInput.files.length > 0) {
                formData.append('content', fileInput.files[0]);
            } else if (textArea.value.trim()) {
                formData.append('content', textArea.value.trim());
            } else {
                throw new Error('Please provide content for the quiz');
            }

            formData.append('quizType', document.getElementById('quizType').value);
            formData.append('questionCount', document.getElementById('questionCount').value);
            formData.append('difficulty', document.querySelector('input[name="difficulty"]:checked').value);

            const response = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate quiz');
            }

            // Store generated quiz
            generatedQuiz = data.quiz;

            // Display generated quiz
            displayQuiz(data.quiz);
            quizResult.classList.remove('d-none');

        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.textContent = error.message;
            quizForm.appendChild(errorDiv);
            
            setTimeout(() => errorDiv.remove(), 5000);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// Handle quiz assignment
if (assignQuizBtn) {
    assignQuizBtn.addEventListener('click', async () => {
        try {
            const title = document.getElementById('assignmentTitle').value;
            const description = document.getElementById('assignmentDescription').value;
            const dueDate = document.getElementById('dueDate').value;

            if (!title || !dueDate || !generatedQuiz) {
                throw new Error('Please fill in all required fields');
            }

            const response = await fetch('/api/assignments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    quizData: generatedQuiz,
                    dueDate
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            // Close modal and refresh assignments list
            const modal = bootstrap.Modal.getInstance(document.getElementById('quizGeneratorModal'));
            modal.hide();
            
            // Show success message
            showAlert('Assignment created successfully!', 'success');
            
            // Refresh assignments table
            loadAssignments();

        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });
}

function displayQuiz(quiz) {
    let html = '<ol>';
    quiz.forEach((question, index) => {
        html += `<li class="mb-3">
            <p class="mb-2">${question.question}</p>`;
        
        if (question.options) {
            html += '<div class="options">';
            question.options.forEach(option => {
                html += `<div class="form-check">
                    <input class="form-check-input" type="radio" name="q${index}" value="${option}">
                    <label class="form-check-label">${option}</label>
                </div>`;
            });
            html += '</div>';
        }
        
        if (question.correctAnswer) {
            html += `<div class="correct-answer text-success mt-2">
                <small><strong>Correct Answer:</strong> ${question.correctAnswer}</small>
            </div>`;
        }
        
        html += '</li>';
    });
    html += '</ol>';
    
    quizPreview.innerHTML = html;
}

// Load assignments
async function loadAssignments() {
    try {
        const response = await fetch('/api/assignments', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const assignments = await response.json();

        const tbody = document.querySelector('#assignmentsTable tbody');
        tbody.innerHTML = assignments.map(assignment => `
            <tr>
                <td>${assignment.title}</td>
                <td>${new Date(assignment.due_date).toLocaleDateString()}</td>
                <td>${getStatusBadge(assignment)}</td>
                <td>${assignment.submission_count || 0} / ${assignment.student_count || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-submissions" data-id="${assignment.id}">
                        View Submissions
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        showAlert('Error loading assignments', 'danger');
    }
}

function getStatusBadge(assignment) {
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    
    if (now > dueDate) {
        return '<span class="badge bg-danger">Expired</span>';
    } else {
        return '<span class="badge bg-success">Active</span>';
    }
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

// Load assignments when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadAssignments();
}); 