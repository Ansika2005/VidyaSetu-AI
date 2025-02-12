document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth handlers
    const loginForm = document.querySelector('#loginForm');
    const signupForm = document.querySelector('#signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => handleParentAuth(true)(e));
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => handleParentAuth(false)(e));
    }

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

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // Demo carousel autoplay configuration
    const carousel = new bootstrap.Carousel(document.querySelector('#demoCarousel'), {
        interval: 3000,
        touch: true
    });

    // Animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .carousel, .cta-section');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight;
            
            if(elementPosition < screenPosition) {
                element.classList.add('fade-in');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check
});

// Handle authentication
const handleParentAuth = async (isLogin = true) => {
    const form = isLogin ? document.querySelector('#loginForm') : document.querySelector('#signupForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            role: 'parent'
        };

        if (!isLogin) {
            data.name = formData.get('name');
        }

        try {
            const response = await fetch(`http://localhost:5000/api/auth/${isLogin ? 'login' : 'signup'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            if (isLogin) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                window.location.href = '/dashboards/parent-dashboard.html';
            } else {
                // Show success message and switch to login tab
                showSuccess(form, 'Registration successful! Please login.');
                document.querySelector('#login-tab').click();
            }

        } catch (error) {
            showError(form, error.message);
        }
    });
};

// Helper functions for showing messages
const showError = (form, message) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger mt-3';
    alertDiv.textContent = message;
    
    form.querySelectorAll('.alert').forEach(alert => alert.remove());
    form.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
};

const showSuccess = (form, message) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success mt-3';
    alertDiv.textContent = message;
    
    form.querySelectorAll('.alert').forEach(alert => alert.remove());
    form.appendChild(alertDiv);
}; 