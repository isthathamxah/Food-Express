document.addEventListener('DOMContentLoaded', function() {
    // Cuisines data
    const cuisines = [
        {
            id: 'pizza',
            name: 'Pizza',
            image: 'images/cuisines/pizza.jpg',
            description: 'Authentic Italian pizzas and more'
        },
        {
            id: 'burger',
            name: 'Burger',
            image: 'images/cuisines/burger.jpg',
            description: 'Juicy burgers and fast food'
        },
        {
            id: 'sushi',
            name: 'Sushi',
            image: 'images/cuisines/sushi.jpg',
            description: 'Fresh Japanese cuisine'
        },
        {
            id: 'desi',
            name: 'Desi',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60',
            description: 'Spicy and flavorful Desi dishes'
        },
        {
            id: 'chinese',
            name: 'Chinese',
            image: 'images/cuisines/chinese.jpg',
            description: 'Traditional Chinese cuisine'
        },
        {
            id: 'mexican',
            name: 'Mexican',
            image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=60',
            description: 'Authentic Mexican flavors'
        },
        {
            id: 'thai',
            name: 'Thai',
            image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=60',
            description: 'Exotic Thai dishes'
        },
        {
            id: 'italian',
            name: 'Italian',
            image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=60',
            description: 'Classic Italian cuisine'
        }
    ];

    // Function to create cuisine card
    function createCuisineCard(cuisine) {
        return `
            <a href="restaurants.html?cuisine=${cuisine.id}" class="cuisine-card">
                <img src="${cuisine.image}" alt="${cuisine.name}">
                <div class="cuisine-info">
                    <span class="cuisine-name">${cuisine.name}</span>
                    <p class="cuisine-description">${cuisine.description}</p>
                </div>
            </a>
        `;
    }

    // Function to render cuisines
    function renderCuisines() {
        const cuisineGrid = document.querySelector('.cuisine-grid');
        if (cuisineGrid) {
            cuisineGrid.innerHTML = cuisines
                .map(cuisine => createCuisineCard(cuisine))
                .join('');
        }
    }

    // Initialize
    renderCuisines();
}); 