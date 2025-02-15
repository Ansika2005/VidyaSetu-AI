document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Smooth scroll for "Learn More" button
    window.scrollToFeatures = () => {
        document.querySelector('#features').scrollIntoView({
            behavior: 'smooth'
        });
    };

    // Check authentication status
    checkAuthStatus();

    // Quiz Generator Form
    const quizForm = document.getElementById('quizGeneratorForm');
    const pasteContentBtn = document.getElementById('pasteContent');
    const contentTextArea = document.getElementById('contentTextArea');
    const quizResult = document.getElementById('quizResult');
    const quizPreview = document.querySelector('.quiz-preview');

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
                    alert('Please provide content for the quiz');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    return;
                }

                formData.append('quizType', document.getElementById('quizType').value);
                formData.append('questionCount', document.getElementById('questionCount').value);
                formData.append('difficulty', document.querySelector('input[name="difficulty"]:checked').value);

                // Check if user is logged in
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Please log in to generate quizzes');
                }

                const response = await fetch('/api/quiz/generate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to generate quiz');
                }

                // Display generated quiz
                displayQuiz(data.quiz);
                quizResult.classList.remove('d-none');

            } catch (error) {
                if (error.message.includes('log in')) {
                    // Show auth modal if not logged in
                    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
                    authModal.show();
                } else {
                    // Show error message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'alert alert-danger mt-3';
                    errorDiv.textContent = 'Error generating quiz: ' + error.message;
                    quizForm.appendChild(errorDiv);
                    
                    // Remove error message after 5 seconds
                    setTimeout(() => errorDiv.remove(), 5000);
                }
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    function displayQuiz(quiz) {
        let html = '<ol>';
        quiz.forEach(question => {
            html += `<li class="mb-3">
                <p class="mb-2">${question.question}</p>`;
            
            if (question.options) {
                html += '<div class="options">';
                question.options.forEach(option => {
                    html += `<div class="form-check">
                        <input class="form-check-input" type="radio" name="q${question.id}" value="${option}">
                        <label class="form-check-label">${option}</label>
                    </div>`;
                });
                html += '</div>';
            }
            
            html += '</li>';
        });
        html += '</ol>';
        
        quizPreview.innerHTML = html;
    }
});

// Handle authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        // Redirect to dashboard if already logged in
        if (user.role === 'teacher') {
            window.location.href = '/dashboards/teacher-dashboard.html';
        }
    }
} 