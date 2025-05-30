document.addEventListener('DOMContentLoaded', function() {
    // Sample restaurant data
    const restaurants = [
        {
            id: 'pizza-paradise',
            name: 'Pizza Paradise',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
            rating: 4.5,
            deliveryTime: '25-35',
            priceRange: '$$',
            cuisine: ['Pizza', 'Italian'],
            tags: ['Free Delivery', 'Promo'],
            isNew: true
        },
        {
            id: 'burger-king',
            name: 'Burger King',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
            rating: 4.3,
            deliveryTime: '20-30',
            priceRange: '$',
            cuisine: ['Burger', 'Fast Food'],
            tags: ['Free Delivery'],
            isNew: false
        },
        {
            id: 'sushi-master',
            name: 'Sushi Master',
            image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60',
            rating: 4.7,
            deliveryTime: '30-40',
            priceRange: '$$$',
            cuisine: ['Sushi', 'Japanese'],
            tags: ['Promo'],
            isNew: false
        },
        {
            id: 'spice-garden',
            name: 'Spice Garden',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60',
            rating: 4.6,
            deliveryTime: '35-45',
            priceRange: '$$',
            cuisine: ['Desi', 'Indian'],
            tags: ['Free Delivery', 'Promo'],
            isNew: true
        },
        {
            id: 'wok-n-roll',
            name: 'Wok N Roll',
            image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60',
            rating: 4.4,
            deliveryTime: '25-35',
            priceRange: '$$',
            cuisine: ['Chinese', 'Asian'],
            tags: ['Free Delivery'],
            isNew: false
        },
        {
            id: 'taco-fiesta',
            name: 'Taco Fiesta',
            image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=60',
            rating: 4.5,
            deliveryTime: '20-30',
            priceRange: '$$',
            cuisine: ['Mexican', 'Latin'],
            tags: ['Promo'],
            isNew: true
        },
        {
            id: 'thai-spice',
            name: 'Thai Spice',
            image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=60',
            rating: 4.6,
            deliveryTime: '30-40',
            priceRange: '$$',
            cuisine: ['Thai', 'Asian'],
            tags: ['Free Delivery'],
            isNew: false
        },
        {
            id: 'pasta-paradise',
            name: 'Pasta Paradise',
            image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=60',
            rating: 4.4,
            deliveryTime: '25-35',
            priceRange: '$$',
            cuisine: ['Italian', 'Pasta'],
            tags: ['Promo'],
            isNew: false
        }
    ];

    // DOM Elements
    const restaurantsGrid = document.querySelector('.restaurants-grid');
    const searchInput = document.querySelector('.search-box input');
    const sortSelect = document.querySelector('.filter-select');
    const priceFilters = document.querySelectorAll('.price-filters input');
    const cuisineFilters = document.querySelectorAll('.cuisine-filters input');
    const loadMoreBtn = document.querySelector('.load-more button');

    // State
    let currentPage = 1;
    const restaurantsPerPage = 6;
    let filteredRestaurants = [...restaurants];

    // Get cuisine from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCuisine = urlParams.get('cuisine');

    // Create restaurant card
    function createRestaurantCard(restaurant) {
        return `
            <a href="restaurant-detail.html?id=${restaurant.id}" class="restaurant-card">
                <div class="restaurant-image">
                    <img src="${restaurant.image}" alt="${restaurant.name}">
                    ${restaurant.isNew ? '<div class="restaurant-badge">New</div>' : ''}
                </div>
                <div class="restaurant-info">
                    <h3>${restaurant.name}</h3>
                    <div class="restaurant-meta">
                        <span class="rating">
                            <i class="fas fa-star"></i>
                            ${restaurant.rating}
                        </span>
                        <span class="delivery-time">
                            <i class="fas fa-clock"></i>
                            ${restaurant.deliveryTime} min
                        </span>
                        <span class="price-range">${restaurant.priceRange}</span>
                    </div>
                    <p class="restaurant-cuisine">${restaurant.cuisine.join(' • ')}</p>
                    <div class="restaurant-tags">
                        ${restaurant.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </a>
        `;
    }

    // Filter restaurants
    function filterRestaurants() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedPrices = Array.from(priceFilters)
            .filter(input => input.checked)
            .map(input => input.value);
        const selectedCuisines = Array.from(cuisineFilters)
            .filter(input => input.checked)
            .map(input => input.value);

        filteredRestaurants = restaurants.filter(restaurant => {
            const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm) ||
                                restaurant.cuisine.some(c => c.toLowerCase().includes(searchTerm));
            const matchesPrice = selectedPrices.length === 0 || 
                               selectedPrices.includes(restaurant.priceRange.length.toString());
            const matchesCuisine = selectedCuisines.length === 0 ||
                                 restaurant.cuisine.some(c => selectedCuisines.includes(c.toLowerCase()));

            return matchesSearch && matchesPrice && matchesCuisine;
        });

        // If cuisine is selected in URL, filter by that cuisine
        if (selectedCuisine) {
            filteredRestaurants = filteredRestaurants.filter(restaurant =>
                restaurant.cuisine.some(c => c.toLowerCase() === selectedCuisine.toLowerCase())
            );
        }

        renderRestaurants();
    }

    // Sort restaurants
    function sortRestaurants() {
        const sortBy = sortSelect.value;
        switch (sortBy) {
            case 'rating':
                filteredRestaurants.sort((a, b) => b.rating - a.rating);
                break;
            case 'delivery':
                filteredRestaurants.sort((a, b) => {
                    const aTime = parseInt(a.deliveryTime.split('-')[0]);
                    const bTime = parseInt(b.deliveryTime.split('-')[0]);
                    return aTime - bTime;
                });
                break;
            case 'price-low':
                filteredRestaurants.sort((a, b) => a.priceRange.length - b.priceRange.length);
                break;
            case 'price-high':
                filteredRestaurants.sort((a, b) => b.priceRange.length - a.priceRange.length);
                break;
            default: // 'popular'
                filteredRestaurants.sort((a, b) => b.rating - a.rating);
        }
        renderRestaurants();
    }

    // Render restaurants
    function renderRestaurants() {
        const startIndex = 0;
        const endIndex = currentPage * restaurantsPerPage;
        const restaurantsToShow = filteredRestaurants.slice(startIndex, endIndex);

        restaurantsGrid.innerHTML = restaurantsToShow
            .map(restaurant => createRestaurantCard(restaurant))
            .join('');

        // Show/hide load more button
        loadMoreBtn.style.display = endIndex >= filteredRestaurants.length ? 'none' : 'block';

        // Update page title if cuisine is selected
        if (selectedCuisine) {
            const cuisineName = selectedCuisine.charAt(0).toUpperCase() + selectedCuisine.slice(1);
            document.title = `${cuisineName} Restaurants - FoodExpress`;
            document.querySelector('.section-header h2').textContent = `${cuisineName} Restaurants`;
        }
    }

    // Event Listeners
    searchInput.addEventListener('input', filterRestaurants);
    sortSelect.addEventListener('change', sortRestaurants);
    priceFilters.forEach(filter => filter.addEventListener('change', filterRestaurants));
    cuisineFilters.forEach(filter => filter.addEventListener('change', filterRestaurants));

    // Load More
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderRestaurants();
    });

    // Initialize
    filterRestaurants();
}); 