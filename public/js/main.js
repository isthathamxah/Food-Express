// State management
let currentUser = null;
let restaurants = [];
let menuModal = null;
let searchTimeout = null;
let selectedSuggestionIndex = -1;

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const heroSearchInput = document.getElementById('searchInput');
const navSearchInput = document.querySelector('.search-box input');
const heroSearchSuggestions = document.getElementById('heroSearchSuggestions');
const navSearchSuggestions = document.getElementById('navSearchSuggestions');
const searchBtn = document.getElementById('searchBtn');
const cuisineButtons = document.querySelectorAll('.cuisine-filter .btn');
const restaurantsGrid = document.getElementById('restaurantsGrid');

// Initialize modals
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
menuModal = new bootstrap.Modal(document.getElementById('menuModal'));

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check for logged in user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateAuthUI();
    }

    // Initialize cart count
    updateCartCount();

    // Load all restaurants
    loadRestaurants();

    // Add event listeners for hero search
    if (heroSearchInput) {
        heroSearchInput.addEventListener('input', (e) => {
            showSuggestions(e.target.value, heroSearchSuggestions);
        });
        
        heroSearchInput.addEventListener('focus', () => {
            if (heroSearchInput.value) {
                showSuggestions(heroSearchInput.value, heroSearchSuggestions);
            }
        });
    }

    // Add event listeners for nav search
    if (navSearchInput) {
        navSearchInput.addEventListener('input', (e) => {
            showSuggestions(e.target.value, navSearchSuggestions);
        });
        
        navSearchInput.addEventListener('focus', () => {
            if (navSearchInput.value) {
                showSuggestions(navSearchInput.value, navSearchSuggestions);
            }
        });
    }
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hero-search') && !e.target.closest('.search-box')) {
            heroSearchSuggestions?.classList.remove('show');
            navSearchSuggestions?.classList.remove('show');
        }
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        const activeSuggestions = document.querySelector('.search-suggestions.show');
        if (!activeSuggestions) return;
        
        const items = activeSuggestions.querySelectorAll('.suggestion-item');
        const activeItem = activeSuggestions.querySelector('.suggestion-item.active');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!activeItem) {
                    items[0]?.classList.add('active');
                } else {
                    const nextItem = activeItem.nextElementSibling;
                    if (nextItem) {
                        activeItem.classList.remove('active');
                        nextItem.classList.add('active');
                    }
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (!activeItem) {
                    items[items.length - 1]?.classList.add('active');
                } else {
                    const prevItem = activeItem.previousElementSibling;
                    if (prevItem) {
                        activeItem.classList.remove('active');
                        prevItem.classList.add('active');
                    }
                }
                break;
                
            case 'Enter':
                if (activeItem) {
                    e.preventDefault();
                    const restaurantId = activeItem.dataset.id;
                    const restaurantName = activeItem.querySelector('div').textContent.trim();
                    
                    heroSearchInput.value = restaurantName;
                    navSearchInput.value = restaurantName;
                    
                    showRestaurantMenu(restaurantId);
                    activeSuggestions.classList.remove('show');
                }
                break;
                
            case 'Escape':
                activeSuggestions.classList.remove('show');
                break;
        }
    });

    // Sync search inputs
    if (heroSearchInput && navSearchInput) {
        heroSearchInput.addEventListener('input', () => {
            navSearchInput.value = heroSearchInput.value;
        });
        navSearchInput.addEventListener('input', () => {
            heroSearchInput.value = navSearchInput.value;
        });
    }

    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => handleSearch(heroSearchInput.value));
    }

    // Cuisine filter buttons
    cuisineButtons.forEach(button => {
        button.addEventListener('click', () => {
            cuisineButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterRestaurants(button.dataset.cuisine);
        });
    });
});

// Auth related event listeners
loginBtn.addEventListener('click', () => {
    if (currentUser) {
        // Logout
        currentUser = null;
        localStorage.removeItem('currentUser');
        clearCart();
        updateAuthUI();
        return;
    }
    loginModal.show();
});

document.getElementById('showRegisterBtn').addEventListener('click', () => {
    loginModal.hide();
    registerModal.show();
});

document.getElementById('showLoginBtn').addEventListener('click', () => {
    registerModal.hide();
    loginModal.show();
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        loginModal.hide();
        updateAuthUI();
        showToast('Login successful!', 'success');
    } else {
        showToast('Invalid email or password', 'error');
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        phone,
        role: 'user'
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    registerModal.hide();
    updateAuthUI();
    showToast('Registration successful!', 'success');
});

// Cart related event listeners
cartBtn.addEventListener('click', () => {
    if (!currentUser) {
        loginModal.show();
        return;
    }
    updateCartModal();
    cartModal.show();
});

// Cart Modal
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (!currentUser) {
        cartModal.hide();
        loginModal.show();
        return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    if (cartItems.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }

    // Redirect to checkout page
    window.location.href = '/checkout.html';
});

// UI Update Functions
function updateAuthUI() {
    if (currentUser) {
        loginBtn.textContent = 'Logout';
        document.getElementById('ordersLink').style.display = 'block';
    } else {
        loginBtn.textContent = 'Login';
        document.getElementById('ordersLink').style.display = 'none';
    }
}

function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    cartCount.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);
}

function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    if (items.length === 0) {
        cartItems.innerHTML = '<p class="text-center py-4">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }

    // Group items by restaurant
    const itemsByRestaurant = items.reduce((acc, item) => {
        if (!acc[item.restaurantName]) {
            acc[item.restaurantName] = [];
        }
        acc[item.restaurantName].push(item);
        return acc;
    }, {});

    let total = 0;
    cartItems.innerHTML = Object.entries(itemsByRestaurant).map(([restaurantName, restaurantItems]) => {
        const restaurantTotal = restaurantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        total += restaurantTotal;

        return `
            <div class="restaurant-items mb-4">
                <h5 class="restaurant-name mb-3">${restaurantName}</h5>
                ${restaurantItems.map(item => `
                    <div class="cart-item mb-3">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" 
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                                 onerror="this.src='https://via.placeholder.com/60x60?text=Food'">
                            <div class="ms-3 flex-grow-1">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="mb-1">${item.name}</h6>
                                        <div class="text-muted small">
                                            ${item.isVeg ? '<span class="badge bg-success me-1">Veg</span>' : ''}
                                            ${item.isSpicy ? '<span class="badge bg-danger me-1">Spicy</span>' : ''}
                                            $${item.price.toFixed(2)} × ${item.quantity}
                                        </div>
                                    </div>
                                    <div class="text-end">
                                        <div class="fw-bold mb-1">$${(item.price * item.quantity).toFixed(2)}</div>
                                        <button class="btn btn-sm btn-outline-danger" 
                                            onclick="removeFromCart('${item.restaurantId}_${item.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="restaurant-total text-end border-top pt-2">
                    <small class="text-muted">Subtotal: $${restaurantTotal.toFixed(2)}</small>
                </div>
            </div>
        `;
    }).join('<hr class="my-4">');

    cartTotal.textContent = total.toFixed(2);
}

// Restaurant Functions
function loadRestaurants() {
    restaurants = [];
    
    // Load restaurants from menuData
    for (const [id, restaurant] of Object.entries(menuData)) {
        restaurants.push({
            id: id,
            name: restaurant.info.name,
            image: restaurant.info.image,
            rating: restaurant.info.rating,
            deliveryTime: restaurant.info.deliveryTime,
            priceRange: restaurant.info.priceRange,
            cuisine: restaurant.info.cuisine,
            tags: restaurant.info.tags
        });
    }
    
    // Load restaurants from menuData2
    for (const [id, restaurant] of Object.entries(menuData2)) {
        restaurants.push({
            id: id,
            name: restaurant.info.name,
            image: restaurant.info.image,
            rating: restaurant.info.rating,
            deliveryTime: restaurant.info.deliveryTime,
            priceRange: restaurant.info.priceRange,
            cuisine: restaurant.info.cuisine,
            tags: restaurant.info.tags
        });
    }
    
    displayRestaurants(restaurants);
}

function debounceSearch(e) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        handleSearch(e.target.value);
    }, 300);
}

function handleSearch(searchTerm) {
    if (!searchTerm) {
        displayRestaurants(restaurants);
        return;
    }

    searchTerm = searchTerm.toLowerCase().trim();
    
    const searchResults = restaurants.filter(restaurant => {
        const matchName = restaurant.name.toLowerCase().includes(searchTerm);
        const matchCuisine = restaurant.cuisine.some(cuisine => 
            cuisine.toLowerCase().includes(searchTerm)
        );
        const matchDescription = restaurant.description && 
            restaurant.description.toLowerCase().includes(searchTerm);
        
        return matchName || matchCuisine || matchDescription;
    });

    // Reset cuisine filter buttons
    cuisineButtons.forEach(btn => {
        if (btn.dataset.cuisine === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Show results with animation
    displayRestaurants(searchResults);
    
    // Show feedback if no results
    if (searchResults.length === 0) {
        restaurantsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="no-results">
                    <i class="fas fa-search mb-3" style="font-size: 3rem; color: var(--gray-400);"></i>
                    <h3>No restaurants found</h3>
                    <p class="text-muted">Try different keywords or browse by cuisine</p>
                </div>
            </div>
        `;
    }
}

function filterRestaurants(cuisine) {
    if (cuisine === 'all') {
        displayRestaurants(restaurants);
        return;
    }

    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.cuisine.includes(cuisine)
    );
    displayRestaurants(filteredRestaurants);
}

function displayRestaurants(restaurants) {
    if (restaurants.length === 0) {
        restaurantsGrid.innerHTML = '<div class="col-12 text-center"><p>No restaurants found</p></div>';
        return;
    }

    restaurantsGrid.innerHTML = restaurants.map(restaurant => `
        <div class="col-md-4 mb-4">
            <div class="restaurant-card" onclick="showRestaurantMenu('${restaurant.id}')">
                <div class="restaurant-image">
                    <img src="${restaurant.image}" alt="${restaurant.name}" 
                         onerror="this.src='https://via.placeholder.com/300x200?text=Restaurant'">
                    ${restaurant.tags.includes('Promo') ? 
                        '<span class="restaurant-badge">Promo</span>' : ''}
                </div>
                <div class="restaurant-info">
                    <h5 class="restaurant-name">${restaurant.name}</h5>
                    <p class="restaurant-cuisine">${restaurant.cuisine.join(' • ')}</p>
                    <div class="restaurant-meta">
                        <div class="restaurant-rating">
                            <i class="fas fa-star"></i>
                            <span>${restaurant.rating.toFixed(1)}</span>
                        </div>
                        <div class="restaurant-delivery">
                            <i class="fas fa-clock"></i>
                            <span>${restaurant.deliveryTime} mins</span>
                        </div>
                        <div class="restaurant-price">
                            <span>${restaurant.priceRange}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function showRestaurantMenu(restaurantId) {
    const restaurant = menuData[restaurantId] || menuData2[restaurantId];
    if (!restaurant) {
        showToast('Restaurant not found', 'error');
        return;
    }

    const modalContent = document.getElementById('menuModalContent');
    modalContent.innerHTML = `
        <div class="menu-modal-header" style="background-image: url('${restaurant.info.image}')">
            <div class="menu-modal-overlay">
                <h2 class="menu-modal-title">${restaurant.info.name}</h2>
                <div class="menu-modal-info">
                    <span><i class="fas fa-star"></i> ${restaurant.info.rating.toFixed(1)}</span>
                    <span><i class="fas fa-clock"></i> ${restaurant.info.deliveryTime} mins</span>
                    <span>${restaurant.info.cuisine.join(' • ')}</span>
                    <span>${restaurant.info.priceRange}</span>
                </div>
            </div>
        </div>
        <div class="menu-categories">
            ${restaurant.categories.map(category => `
                <div class="menu-category">
                    <h3 class="category-title">${category.name}</h3>
                    ${category.items.map(item => {
                        // Create a safe version of the item for passing to addToCart
                        const safeItem = {
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            description: item.description,
                            isVeg: item.isVeg,
                            isSpicy: item.isSpicy,
                            restaurantId: restaurantId,
                            restaurantName: restaurant.info.name
                        };
                        
                        return `
                            <div class="menu-item">
                                <div class="menu-item-image">
                                    <img src="${item.image}" alt="${item.name}"
                                         onerror="this.src='https://via.placeholder.com/100x100?text=Food'">
                                </div>
                                <div class="menu-item-details">
                                    <h4 class="menu-item-title">
                                        ${item.name}
                                        ${item.isVeg ? '<span class="badge bg-success">Veg</span>' : ''}
                                        ${item.isSpicy ? '<span class="badge bg-danger">Spicy</span>' : ''}
                                    </h4>
                                    <p class="menu-item-description">${item.description}</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                                        <button class="btn btn-primary btn-sm" 
                                            onclick='addToCart(${JSON.stringify(safeItem).replace(/'/g, "&#39;")})'>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `).join('')}
        </div>
    `;

    menuModal.show();
}

// Cart Functions
function addToCart(item) {
    if (!currentUser) {
        menuModal.hide();
        loginModal.show();
        return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Create a unique cart item ID that includes both restaurant and item
    const cartItemId = `${item.restaurantId}_${item.id}`;
    const existingItem = cartItems.find(i => `${i.restaurantId}_${i.id}` === cartItemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            ...item,
            quantity: 1
        });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    showToast('Item added to cart successfully!', 'success');
}

function removeFromCart(cartItemId) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const [restaurantId, itemId] = cartItemId.split('_');
    const updatedItems = cartItems.filter(item => 
        `${item.restaurantId}_${item.id}` !== cartItemId
    );
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    updateCartCount();
    updateCartModal();
    showToast('Item removed from cart', 'success');
}

function clearCart() {
    localStorage.removeItem('cartItems');
            updateCartCount();
    updateCartModal();
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize some sample data
function initializeSampleData() {
    // Sample restaurants
    const restaurants = [
        {
            id: '1',
            name: 'Pizza Palace',
            cuisine_type: 'Italian',
            rating: 4.5,
            delivery_time: '30-40',
            image_url: 'https://via.placeholder.com/300x200'
        },
        {
            id: '2',
            name: 'Burger House',
            cuisine_type: 'American',
            rating: 4.3,
            delivery_time: '25-35',
            image_url: 'https://via.placeholder.com/300x200'
        }
    ];

    // Sample menu items
    const menuItems = [
        {
            id: '1',
            restaurant_id: '1',
            name: 'Margherita Pizza',
            description: 'Classic tomato and mozzarella',
            price: 12.99
        },
        {
            id: '2',
            restaurant_id: '1',
            name: 'Pepperoni Pizza',
            description: 'Spicy pepperoni with cheese',
            price: 14.99
        }
    ];

    if (!localStorage.getItem('restaurants')) {
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
    }
    if (!localStorage.getItem('menu_items')) {
        localStorage.setItem('menu_items', JSON.stringify(menuItems));
    }
}

// Initialize sample data
initializeSampleData();

function showSuggestions(query, suggestionsElement) {
    if (!query || !suggestionsElement) {
        suggestionsElement?.classList.remove('show');
        return;
    }

    query = query.toLowerCase();
    
    // Filter restaurants that start with the query
    const matchingRestaurants = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to 5 suggestions

    if (matchingRestaurants.length === 0) {
        suggestionsElement.classList.remove('show');
        return;
    }

    // Render suggestions
    suggestionsElement.innerHTML = matchingRestaurants
        .map(restaurant => `
            <div class="suggestion-item" data-id="${restaurant.id}">
                <img src="${restaurant.image}" alt="${restaurant.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${restaurant.name}</div>
                    <div style="font-size: 0.8rem; color: #666;">${restaurant.cuisine.join(', ')}</div>
                </div>
            </div>
        `).join('');

    // Add click handlers to suggestions
    suggestionsElement.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const restaurantId = item.dataset.id;
            const restaurantName = item.querySelector('div').textContent.trim();
            
            // Update both search inputs
            heroSearchInput.value = restaurantName;
            navSearchInput.value = restaurantName;

            // Show restaurant menu
            showRestaurantMenu(restaurantId);

            // Hide suggestions
            suggestionsElement.classList.remove('show');
        });
    });

    suggestionsElement.classList.add('show');
} 