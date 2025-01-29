// DOM Elements
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const cards = document.querySelectorAll('.card');
const forms = document.querySelectorAll('form');

// Navbar Scroll Effect
const handleNavbarScroll = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
};

// Smooth Scrolling
const smoothScroll = (e) => {
    if (e.target.hash) {
        e.preventDefault();
        const targetElement = document.querySelector(e.target.hash);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    }
};

// Animation on Scroll
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .section-title, .hero-content')
        .forEach(element => observer.observe(element));
};

// Form Validation and Submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Basic form validation
    let isValid = true;
    formData.forEach((value, key) => {
        if (!value.trim()) {
            isValid = false;
            const input = form.querySelector(`[name="${key}"]`);
            showError(input, 'This field is required');
        }
    });

    if (isValid) {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            showSuccess(form);
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }
};

// Error and Success Messages
const showError = (element, message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-2';
    errorDiv.textContent = message;
    
    const existingError = element.parentElement.querySelector('.alert');
    if (existingError) existingError.remove();
    
    element.parentElement.appendChild(errorDiv);
    element.classList.add('is-invalid');

    setTimeout(() => {
        errorDiv.remove();
        element.classList.remove('is-invalid');
    }, 3000);
};

const showSuccess = (form) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success mt-3';
    successDiv.textContent = 'Message sent successfully!';
    
    form.appendChild(successDiv);
    
    setTimeout(() => successDiv.remove(), 3000);
};

// Card Hover Effects
const initializeCardEffects = () => {
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            const icon = card.querySelector('.fa-3x');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });

        card.addEventListener('mouseleave', (e) => {
            const icon = card.querySelector('.fa-3x');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });
};

// Active Navigation Link
const updateActiveNavLink = () => {
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight/3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
};

// Auth Modal Functionality
const initializeAuthModal = () => {
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const authForms = document.querySelectorAll('.auth-form');
    
    // Password visibility toggle
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const type = input.getAttribute('type');
            input.setAttribute('type', type === 'password' ? 'text' : 'password');
            btn.classList.toggle('fa-eye');
            btn.classList.toggle('fa-eye-slash');
        });
    });
    
    // Form submission
    authForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            
            // Show loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Show success message
                const successDiv = document.createElement('div');
                successDiv.className = 'alert alert-success mt-3';
                successDiv.textContent = form.id === 'loginForm' ? 
                    'Login successful!' : 'Account created successfully!';
                form.appendChild(successDiv);
                
                setTimeout(() => {
                    successDiv.remove();
                    if (form.id === 'loginForm') {
                        window.location.href = '/dashboard.html'; // Redirect to dashboard
                    } else {
                        // Switch to login tab after successful signup
                        document.querySelector('#login-tab').click();
                    }
                }, 1500);
            }, 2000);
        });
    });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap Modal
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    
    // Add click event listener to the login button
    const loginButton = document.querySelector('[data-bs-target="#authModal"]');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            console.log('Login button clicked');
            authModal.show();
        });
    } else {
        console.error('Login button not found');
    }

    // Initialize other features
    initializeAuthModal();

    // Event Listeners
    window.addEventListener('scroll', handleNavbarScroll);
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Initialize features
    observeElements();
    initializeCardEffects();
    updateActiveNavLink();

    // Add loading animation
    document.body.classList.add('loaded');
});

// Add to your CSS
const styles = `
    .loaded {
        opacity: 1;
        transition: opacity 0.5s ease;
    }

    .is-invalid {
        border-color: #dc3545 !important;
    }

    .alert {
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Create and append style element
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
