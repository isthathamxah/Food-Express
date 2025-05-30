// User authentication and management
class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.isAuthenticated = this.checkAuthStatus();
        this.init();
    }

    init() {
        // Update UI based on auth state
        this.updateAuthUI();
        
        // Add event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.setupAuthListeners();
            this.setupProfileListeners();
            this.setupPasswordToggles();
            this.setupFormValidation();
            this.handleProtectedRoutes();
        });
    }

    checkAuthStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return false;

        // Check if session is expired
        if (currentUser.session && currentUser.session.expiresAt) {
            const expiresAt = new Date(currentUser.session.expiresAt);
            if (expiresAt < new Date()) {
                this.logout();
                return false;
            }
        }

        return true;
    }

    handleProtectedRoutes() {
        // List of routes that require authentication
        const protectedRoutes = [
            '/orders.html',
            '/profile.html',
            '/checkout.html'
        ];

        // Get current path
        const currentPath = window.location.pathname;

        // Check if current path is protected
        if (protectedRoutes.some(route => currentPath.endsWith(route))) {
            if (!this.isAuthenticated) {
                // Store the current URL to redirect back after login
                const returnUrl = window.location.href;
                localStorage.setItem('returnUrl', returnUrl);
                
                // Redirect to login
                window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
                return;
            }
        }
    }

    setupAuthListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const email = document.getElementById('loginEmail');
                const password = document.getElementById('loginPassword');

                if (!this.validateForm(loginForm)) {
                    return;
                }

                try {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="loading-spinner"></span> Logging in...';
                    
                    await this.login(email.value, password.value);
                } catch (error) {
                    this.showNotification(error.message || 'Login failed', true);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Login';
                }
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const name = document.getElementById('registerName');
                const email = document.getElementById('registerEmail');
                const password = document.getElementById('registerPassword');
                const confirmPassword = document.getElementById('confirmPassword');
                
                if (!this.validateForm(registerForm)) {
                    return;
                }
                
                if (password.value !== confirmPassword.value) {
                    this.showFieldError(confirmPassword, 'Passwords do not match');
                    return;
                }
                
                try {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating account...';
                    
                    await this.register(name.value, email.value, password.value);
                } catch (error) {
                    this.showNotification(error.message || 'Registration failed', true);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account';
                }
            });
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    setupProfileListeners() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('profileName').value;
                const email = document.getElementById('profileEmail').value;
                const phone = document.getElementById('profilePhone').value;
                const address = document.getElementById('profileAddress').value;
                
                this.updateProfile({ name, email, phone, address });
            });
        }
    }

    setupPasswordToggles() {
        document.querySelectorAll('input[type="password"]').forEach(input => {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = '<i class="far fa-eye"></i>';
            
            toggleBtn.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                toggleBtn.innerHTML = type === 'password' ? 
                    '<i class="far fa-eye"></i>' : 
                    '<i class="far fa-eye-slash"></i>';
            });
            
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(toggleBtn);
        });
    }

    setupFormValidation() {
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
            });

            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        form.querySelectorAll('input').forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        return isValid;
    }

    validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error message
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Required field validation
        if (input.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (input.type === 'password' && value) {
            if (value.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long';
            }
        }

        if (!isValid) {
            this.showFieldError(input, errorMessage);
        } else {
            input.classList.remove('error');
        }

        return isValid;
    }

    showFieldError(input, message) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    async login(email, password) {
        try {
            const hashedPassword = await this.hashPassword(password);
            const user = this.users.find(u => u.email === email && u.password === hashedPassword);
            
            if (user) {
                // Create a session that expires in 7 days
                const session = {
                    token: this.generateToken(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                };

                this.currentUser = { 
                    ...user, 
                    password: undefined,
                    session 
                };

                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.isAuthenticated = true;
                this.updateAuthUI();
                this.showNotification('Login successful!');

                // Get the redirect URL from query params or stored returnUrl
                const params = new URLSearchParams(window.location.search);
                const redirectUrl = params.get('redirect') || localStorage.getItem('returnUrl') || '/';
                localStorage.removeItem('returnUrl'); // Clear stored return URL
                
                window.location.href = redirectUrl;
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            throw error;
        }
    }

    async register(name, email, password) {
        if (this.users.some(u => u.email === email)) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await this.hashPassword(password);

        const newUser = {
            id: this.generateId(),
            name,
            email,
            password: hashedPassword,
            phone: '',
            address: '',
            orders: [],
            favorites: [],
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.showNotification('Registration successful! Please login.');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        this.showNotification('Logged out successfully');
        window.location.href = '/';
    }

    updateProfile(updates) {
        if (!this.currentUser) return;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return;

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.currentUser = { ...this.currentUser, ...updates };
        
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        this.showNotification('Profile updated successfully');
    }

    addOrder(order) {
        if (!this.currentUser) return;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return;

        const orderWithId = {
            ...order,
            id: this.generateId(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.users[userIndex].orders.push(orderWithId);
        this.currentUser.orders.push(orderWithId);
        
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        return orderWithId;
    }

    toggleFavorite(restaurantId) {
        if (!this.currentUser) return;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return;

        const favoriteIndex = this.currentUser.favorites.indexOf(restaurantId);
        
        if (favoriteIndex === -1) {
            this.users[userIndex].favorites.push(restaurantId);
            this.currentUser.favorites.push(restaurantId);
        } else {
            this.users[userIndex].favorites.splice(favoriteIndex, 1);
            this.currentUser.favorites.splice(favoriteIndex, 1);
        }
        
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        const profileLinks = document.querySelectorAll('.profile-only');
        const protectedLinks = document.querySelectorAll('.protected-link');
        
        if (authButtons) {
            authButtons.style.display = this.isAuthenticated ? 'none' : 'flex';
        }
        
        if (userMenu) {
            userMenu.style.display = this.isAuthenticated ? 'flex' : 'none';
            if (this.isAuthenticated && this.currentUser) {
                const userName = userMenu.querySelector('.user-name');
                if (userName) {
                    userName.textContent = this.currentUser.name;
                }
            }
        }

        // Update profile-only elements
        profileLinks.forEach(link => {
            link.style.display = this.isAuthenticated ? 'block' : 'none';
        });

        // Update protected links
        protectedLinks.forEach(link => {
            if (!this.isAuthenticated) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetUrl = link.getAttribute('href');
                    localStorage.setItem('returnUrl', window.location.href);
                    window.location.href = `/login.html?redirect=${encodeURIComponent(targetUrl)}`;
                });
            }
        });

        // Update cart count if available
        if (this.currentUser) {
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                const count = JSON.parse(localStorage.getItem('cart'))?.length || 0;
                cartCount.textContent = count;
                cartCount.style.display = count > 0 ? 'flex' : 'none';
            }
        }
    }

    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.textContent = message;
        
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}

// Initialize authentication
const auth = new Auth();

// Export for use in other modules
window.Auth = auth;

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active states
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tabId + 'Form').classList.add('active');
            
            // Clear error message when switching tabs
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        });
    });

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');

    // Get redirect URL from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || 'index.html';

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Store logged in user
                localStorage.setItem('user', JSON.stringify(user));
                // Redirect to the requested page or home
                window.location.href = redirectUrl;
            } else {
                errorMessage.textContent = 'Invalid email or password';
                errorMessage.style.display = 'block';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('signupFullName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.style.display = 'block';
                return;
            }

            // Get existing users
            const users = JSON.parse(localStorage.getItem('users')) || [];

            // Check if email already exists
            if (users.some(user => user.email === email)) {
                errorMessage.textContent = 'Email already registered';
                errorMessage.style.display = 'block';
                return;
            }

            // Create new user
            const newUser = {
                fullName,
                email,
                password,
                createdAt: new Date().toISOString()
            };

            // Add to users array
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Store logged in user
            localStorage.setItem('user', JSON.stringify(newUser));

            // Redirect to the requested page or home
            window.location.href = redirectUrl;
        });
    }

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    const authLinks = document.querySelector('.auth-links');
    const userMenu = document.querySelector('.user-menu');

    if (user && authLinks && userMenu) {
        authLinks.style.display = 'none';
        userMenu.style.display = 'flex';
        document.querySelector('.user-name').textContent = user.fullName;
    }

    // Social login/signup buttons
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
            const action = window.location.pathname.includes('login') ? 'login' : 'signup';
            console.log(`${provider} ${action} clicked`);
            // TODO: Implement social login/signup
        });
    });
});

class AuthService {
    static isAuthenticated() {
        return !!localStorage.getItem('currentUser');
    }

    static getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    static updateAuthHeader() {
        const user = this.getCurrentUser();
        return user ? {
            'Authorization': `Bearer ${user.id}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    static async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const { user } = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
    }
} 