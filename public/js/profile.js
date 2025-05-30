document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile.js loaded');
    
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User from localStorage:', user);
    
    if (!user) {
        console.log('No user found, redirecting to login');
        window.location.href = 'login.html?redirect=profile.html';
        return;
    }

    // Update user name in navigation
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = user.fullName || 'User';
    }

    // Load user data
    loadUserData(user);

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.profile-nav-item');
    const tabSections = document.querySelectorAll('.profile-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabSections.forEach(section => section.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Form Submissions
    const personalForm = document.getElementById('personalForm');
    console.log('Personal form element:', personalForm);
    
    if (personalForm) {
        personalForm.addEventListener('submit', function(e) {
            console.log('Form submitted');
            e.preventDefault();
            
            // Get form data
            const formData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                birthdate: document.getElementById('birthdate').value
            };
            console.log('Form data:', formData);

            // Update user data
            user.fullName = formData.fullName;
            user.email = formData.email;
            user.phone = formData.phone;
            user.birthdate = formData.birthdate;

            console.log('Updated user data:', user);

            // Update in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            console.log('User data saved to localStorage');

            // Update users array to keep data in sync
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex] = user;
                localStorage.setItem('users', JSON.stringify(users));
                console.log('Users array updated in localStorage');
            }

            // Update displayed name and email
            document.querySelector('.profile-details h1').textContent = formData.fullName;
            document.querySelector('.profile-email').textContent = formData.email;
            if (userNameElement) {
                userNameElement.textContent = formData.fullName;
            }
            console.log('UI updated with new data');

            showNotification('Personal information updated successfully!');
        });
    }

    // Address Management
    const addressCards = document.querySelectorAll('.address-card');
    addressCards.forEach(card => {
        const editBtn = card.querySelector('.btn-outline');
        const deleteBtn = card.querySelector('.btn-danger');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                // TODO: Implement address edit
                showNotification('Address edit functionality coming soon!');
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this address?')) {
                    // TODO: Implement address deletion
                    card.remove();
                    showNotification('Address deleted successfully!');
                }
            });
        }
    });

    // Add New Address
    const addAddressBtn = document.querySelector('.btn-block');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', () => {
            // TODO: Implement new address form
            showNotification('Add new address functionality coming soon!');
        });
    }

    // Payment Methods
    const paymentCards = document.querySelectorAll('.payment-card');
    paymentCards.forEach(card => {
        const editBtn = card.querySelector('.btn-outline');
        const removeBtn = card.querySelector('.btn-danger');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                // TODO: Implement payment method edit
                showNotification('Payment method edit functionality coming soon!');
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to remove this payment method?')) {
                    // TODO: Implement payment method removal
                    card.remove();
                    showNotification('Payment method removed successfully!');
                }
            });
        }
    });

    // Add New Card
    const addCardBtn = document.querySelector('.payment-methods .btn-block');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            // TODO: Implement new card form
            showNotification('Add new card functionality coming soon!');
        });
    }

    // Preferences Form
    const preferencesForm = document.querySelector('.preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const preferences = {
                notifications: {
                    orderUpdates: document.querySelector('input[type="checkbox"][value="orderUpdates"]').checked,
                    promotions: document.querySelector('input[type="checkbox"][value="promotions"]').checked,
                    newRestaurants: document.querySelector('input[type="checkbox"][value="newRestaurants"]').checked
                },
                dietary: {
                    vegetarian: document.querySelector('input[type="checkbox"][value="vegetarian"]').checked,
                    vegan: document.querySelector('input[type="checkbox"][value="vegan"]').checked,
                    glutenFree: document.querySelector('input[type="checkbox"][value="glutenFree"]').checked
                }
            };

            // Save preferences to user data
            user.preferences = preferences;
            localStorage.setItem('user', JSON.stringify(user));

            showNotification('Preferences updated successfully!');
        });
    }

    // Security Form
    const securityForm = document.querySelector('.security-form');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!currentPassword || !newPassword || !confirmPassword) {
                showNotification('Please fill in all password fields', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match', 'error');
                return;
            }

            // Update password in user data
            user.password = newPassword;
            localStorage.setItem('user', JSON.stringify(user));

            // Update in users array
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
            }

            showNotification('Password updated successfully!');
            securityForm.reset();
        });
    }

    // Security Toggles
    const securityToggles = document.querySelectorAll('.switch input');
    securityToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const setting = this.closest('.security-option').querySelector('h3').textContent;
            const isEnabled = this.checked;
            
            // Update security settings in user data
            if (!user.security) user.security = {};
            user.security[setting.toLowerCase().replace(/\s+/g, '')] = isEnabled;
            localStorage.setItem('user', JSON.stringify(user));
            
            showNotification(`${setting} ${isEnabled ? 'enabled' : 'disabled'} successfully!`);
        });
    });

    // Profile Picture Upload
    const editAvatarBtn = document.querySelector('.btn-edit-avatar');
    if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', () => {
            // Create file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        // Update profile picture
                        document.querySelector('.profile-avatar img').src = event.target.result;
                        // Save to user data
                        user.profilePicture = event.target.result;
                        localStorage.setItem('user', JSON.stringify(user));
                        showNotification('Profile picture updated successfully!');
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            fileInput.click();
        });
    }

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        console.log('Logout button found');
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout clicked');
            
            // Remove user data from localStorage
            localStorage.removeItem('user');
            console.log('User data removed from localStorage');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    } else {
        console.log('Logout button not found');
    }

    // Load user data into the form
    function loadUserData(user) {
        console.log('Loading user data:', user);
        
        // Update profile header
        document.querySelector('.profile-details h1').textContent = user.fullName || 'User';
        document.querySelector('.profile-email').textContent = user.email || '';
        
        // Update profile picture if exists
        if (user.profilePicture) {
            document.querySelector('.profile-avatar img').src = user.profilePicture;
        }

        // Update personal info form
        if (personalForm) {
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('birthdate').value = user.birthdate || '';
            console.log('Form fields populated with user data');
        }

        // Update preferences
        if (user.preferences) {
            const { notifications, dietary } = user.preferences;
            if (notifications) {
                Object.entries(notifications).forEach(([key, value]) => {
                    const checkbox = document.querySelector(`input[type="checkbox"][value="${key}"]`);
                    if (checkbox) checkbox.checked = value;
                });
            }
            if (dietary) {
                Object.entries(dietary).forEach(([key, value]) => {
                    const checkbox = document.querySelector(`input[type="checkbox"][value="${key}"]`);
                    if (checkbox) checkbox.checked = value;
                });
            }
        }

        // Update security settings
        if (user.security) {
            Object.entries(user.security).forEach(([key, value]) => {
                const toggle = document.querySelector(`.security-option:contains("${key}") input[type="checkbox"]`);
                if (toggle) toggle.checked = value;
            });
        }
    }

    // Notification System
    function showNotification(message, type = 'success') {
        console.log('Showing notification:', message, type);
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '1rem 2rem';
        notification.style.borderRadius = '6px';
        notification.style.color = '#fff';
        notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        notification.style.zIndex = '1000';
        notification.style.animation = 'slideIn 0.3s ease-out';

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Add notification animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}); 