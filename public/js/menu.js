document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('menuSearch');
    const menuContainer = document.getElementById('menuItems');
    let allMenuItems = [];

    // Load menu items
    async function loadMenuItems() {
        try {
            const response = await fetch('/api/menu');
            const data = await response.json();
            allMenuItems = data.items;

            // Add all items to the search trie
            allMenuItems.forEach(item => {
                window.DSA.menuSearch.insert(item);
            });

            displayMenuItems(allMenuItems);
        } catch (error) {
            console.error('Error loading menu items:', error);
            showToast('Failed to load menu items', 'error');
        }
    }

    // Display menu items
    function displayMenuItems(items) {
        menuContainer.innerHTML = items.map(item => `
            <div class="menu-item">
                <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                <div class="menu-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="menu-item-footer">
                        <span class="price">$${item.price.toFixed(2)}</span>
                        <button onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Handle search
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            if (!query) {
                displayMenuItems(allMenuItems);
                return;
            }

            // Use Trie for efficient search
            const results = window.DSA.menuSearch.search(query);
            displayMenuItems(results);
        });
    }

    // Initialize
    loadMenuItems();
});

// Add to cart function
function addToCart(item) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if item already exists in cart
        const existingItem = cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...item,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
        showToast('Item added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add item to cart', 'error');
    }
}

// Update cart count in navigation
function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Show toast message
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
} 