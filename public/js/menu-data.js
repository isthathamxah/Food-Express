const menuData = {
    'pizza-paradise': {
        info: {
            id: 'pizza-paradise',
            name: 'Pizza Paradise',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
            rating: 4.5,
            deliveryTime: '25-35',
            priceRange: '$$',
            cuisine: ['Pizza', 'Italian'],
            tags: ['Free Delivery', 'Promo']
        },
        categories: [
            {
                name: 'Popular',
                items: [
                    {
                        id: 1,
                        name: 'Margherita Pizza',
                        description: 'Fresh tomatoes, mozzarella, basil, olive oil',
                        price: 12.99,
                        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 2,
                        name: 'Pepperoni Pizza',
                        description: 'Pepperoni, mozzarella, tomato sauce',
                        price: 14.99,
                        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: true
                    }
                ]
            },
            {
                name: 'Pizzas',
                items: [
                    {
                        id: 3,
                        name: 'BBQ Chicken Pizza',
                        description: 'Grilled chicken, BBQ sauce, red onions, mozzarella',
                        price: 15.99,
                        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: false
                    },
                    {
                        id: 4,
                        name: 'Vegetarian Supreme',
                        description: 'Bell peppers, mushrooms, onions, olives, tomatoes',
                        price: 13.99,
                        image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            },
            {
                name: 'Sides',
                items: [
                    {
                        id: 5,
                        name: 'Garlic Bread',
                        description: 'Freshly baked bread with garlic butter',
                        price: 4.99,
                        image: 'https://images.unsplash.com/photo-1619531040576-f9416740661b?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 6,
                        name: 'Caesar Salad',
                        description: 'Romaine lettuce, croutons, parmesan, caesar dressing',
                        price: 6.99,
                        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            }
        ]
    },
    'burger-king': {
        info: {
            id: 'burger-king',
            name: 'Burger King',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
            rating: 4.3,
            deliveryTime: '20-30',
            priceRange: '$',
            cuisine: ['Burger', 'Fast Food'],
            tags: ['Free Delivery']
        },
        categories: [
            {
                name: 'Popular',
                items: [
                    {
                        id: 7,
                        name: 'Classic Whopper',
                        description: 'Flame-grilled beef patty, lettuce, tomatoes, mayo, pickles, onions',
                        price: 6.99,
                        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: false
                    },
                    {
                        id: 8,
                        name: 'Spicy Chicken Burger',
                        description: 'Crispy chicken patty with spicy sauce, lettuce, tomatoes',
                        price: 5.99,
                        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: true
                    }
                ]
            },
            {
                name: 'Burgers',
                items: [
                    {
                        id: 9,
                        name: 'Double Cheeseburger',
                        description: 'Two beef patties, double cheese, pickles, onions, mustard',
                        price: 7.99,
                        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: false
                    },
                    {
                        id: 10,
                        name: 'Veggie Burger',
                        description: 'Plant-based patty, lettuce, tomatoes, vegan mayo',
                        price: 5.99,
                        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            },
            {
                name: 'Sides',
                items: [
                    {
                        id: 11,
                        name: 'French Fries',
                        description: 'Crispy golden fries with seasoning',
                        price: 2.99,
                        image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 12,
                        name: 'Onion Rings',
                        description: 'Crispy battered onion rings',
                        price: 3.49,
                        image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            }
        ]
    },
    'sushi-master': {
        info: {
            id: 'sushi-master',
            name: 'Sushi Master',
            image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60',
            rating: 4.7,
            deliveryTime: '30-40',
            priceRange: '$$$',
            cuisine: ['Sushi', 'Japanese'],
            tags: ['Promo']
        },
        categories: [
            {
                name: 'Popular',
                items: [
                    {
                        id: 13,
                        name: 'California Roll',
                        description: 'Crab meat, avocado, cucumber, tobiko',
                        price: 8.99,
                        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: false
                    },
                    {
                        id: 14,
                        name: 'Spicy Tuna Roll',
                        description: 'Fresh tuna, spicy mayo, cucumber',
                        price: 9.99,
                        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: true
                    }
                ]
            },
            {
                name: 'Rolls',
                items: [
                    {
                        id: 15,
                        name: 'Dragon Roll',
                        description: 'Eel, cucumber, avocado, eel sauce',
                        price: 12.99,
                        image: 'images/menu/dragon-roll.jpg',
                        isVeg: false,
                        isSpicy: false
                    },
                    {
                        id: 16,
                        name: 'Vegetable Roll',
                        description: 'Avocado, cucumber, carrot, asparagus',
                        price: 7.99,
                        image: 'images/menu/veggie-roll.jpg',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            },
            {
                name: 'Sides',
                items: [
                    {
                        id: 17,
                        name: 'Miso Soup',
                        description: 'Traditional Japanese soup with tofu and seaweed',
                        price: 3.99,
                        image: 'images/menu/miso-soup.jpg',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 18,
                        name: 'Edamame',
                        description: 'Steamed soybeans with sea salt',
                        price: 4.99,
                        image: 'images/menu/edamame.jpg',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            }
        ]
    }
};

// Export the menu data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = menuData;
} else {
    window.menuData = menuData;
} 