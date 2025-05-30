document.addEventListener('DOMContentLoaded', function() {
    // Debug: Check if menu data is loaded
    console.log('Menu data available?', {
        menuData: typeof menuData !== 'undefined' ? 'Yes' : 'No',
        menuData2: typeof menuData2 !== 'undefined' ? 'Yes' : 'No'
    });

    if (typeof menuData === 'undefined' || typeof menuData2 === 'undefined') {
        console.error('Menu data not loaded. Please check if menu-data.js and menu-data-2.js are loaded correctly.');
        return;
    }

    const menuItemsContainer = document.querySelector('.menu-items');
    const menuSearch = document.querySelector('#menu-search');
    const restaurantId = new URLSearchParams(window.location.search).get('id');
    let menuItems = {};

    // Debug: Check URL parameters
    console.log('URL parameters:', {
        restaurantId,
        fullUrl: window.location.href
    });

    // Load restaurant data
    function loadRestaurantData() {
        console.log('Loading restaurant data...');
        console.log('Restaurant ID:', restaurantId);
        
        // Combine menu data from both files
        const allMenuData = { ...menuData, ...menuData2 };
        console.log('Combined menu data:', allMenuData);
        
        const restaurant = allMenuData[restaurantId];
        console.log('Selected restaurant:', restaurant);
            
        if (!restaurant) {
            console.error('Restaurant not found:', restaurantId);
            window.location.href = '/restaurants.html';
            return;
        }

        // Update restaurant info
        updateRestaurantInfo(restaurant.info);
        
        // Store menu items
        menuItems = restaurant;
        
        // Render menu items
        renderMenuItems(restaurant.categories);
    }

    // Update restaurant info
    function updateRestaurantInfo(info) {
        console.log('Updating restaurant info:', info);
        
        try {
            document.querySelector('.restaurant-name').textContent = info.name;
            document.querySelector('.restaurant-cuisine').textContent = Array.isArray(info.cuisine) ? info.cuisine.join(' • ') : info.cuisine;
            document.querySelector('.restaurant-rating').innerHTML = `
                <i class="fas fa-star"></i>
                <span>${info.rating}</span>
                <span class="rating-count">(${info.ratingCount || '100+'})</span>
            `;
            document.querySelector('.restaurant-delivery-time').textContent = `${info.deliveryTime} min`;
            document.querySelector('.restaurant-min-order').textContent = info.minOrder ? `Min. order: $${info.minOrder}` : '';
            
            // Update hero image
            const heroImage = document.querySelector('.restaurant-hero');
            if (heroImage) {
                heroImage.style.backgroundImage = `url(${info.image})`;
            } else {
                console.error('Hero image element not found');
            }

            // Update page title
            document.title = `${info.name} - Food Express`;
        } catch (error) {
            console.error('Error updating restaurant info:', error);
            showToast('Error updating restaurant information', 'error');
        }
    }

    // Filter menu items
    function filterMenuItems() {
        const searchTerm = menuSearch.value.toLowerCase();
        const filteredCategories = menuItems.categories.map(category => ({
            ...category,
            items: category.items.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            )
        })).filter(category => category.items.length > 0);

        renderMenuItems(filteredCategories);
    }

    // Render menu items
    function renderMenuItems(categories) {
        console.log('Rendering menu items:', categories);
        
        try {
            menuItemsContainer.innerHTML = categories
                .map(category => `
                    <div class="menu-category">
                        <h3 class="category-title">${category.name}</h3>
                        <div class="menu-grid">
                            ${category.items.map(item => createMenuItemCard(item)).join('')}
                        </div>
                    </div>
                `)
                .join('');

            // Add event listeners to add to cart buttons
            const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const itemId = parseInt(button.getAttribute('data-item-id'));
                    addToCart(itemId);
                });
            });
        } catch (error) {
            console.error('Error rendering menu items:', error);
            showToast('Error displaying menu items', 'error');
        }
    }

    // Create menu item card
    function createMenuItemCard(item) {
        return `
            <div class="menu-item-card">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60'">
                    ${item.isVeg ? '<span class="veg-badge"><i class="fas fa-leaf"></i></span>' : ''}
                    ${item.isSpicy ? '<span class="spicy-badge"><i class="fas fa-pepper-hot"></i></span>' : ''}
                </div>
                <div class="menu-item-info">
                    <h4 class="menu-item-name">${item.name}</h4>
                    <p class="menu-item-description">${item.description}</p>
                    <div class="menu-item-footer">
                        <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                        <button class="add-to-cart-btn" data-item-id="${item.id}">
                            <i class="fas fa-plus"></i>
                            Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Add to cart functionality
    function addToCart(itemId) {
        // Find the menu item
        const restaurant = menuItems;
        let menuItem = null;
        
        for (const category of restaurant.categories) {
            const item = category.items.find(item => item.id === itemId);
            if (item) {
                menuItem = item;
                break;
            }
        }

        if (menuItem) {
            const success = CartUtils.addToCart(menuItem, restaurantId, restaurant.info.name);
            if (success) {
                showToast('Item added to cart!');
            }
        }
    }

    // Show toast message
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 2000);
        }, 100);
    }

    // Add search functionality
    menuSearch.addEventListener('input', filterMenuItems);

    // Initialize
    console.log('Initializing restaurant detail page...');
    loadRestaurantData();
}); 