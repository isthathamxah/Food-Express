const menuData2 = {
    'spice-garden': {
        info: {
            id: 'spice-garden',
            name: 'Spice Garden',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60',
            rating: 4.6,
            deliveryTime: '35-45',
            priceRange: '$$',
            cuisine: ['Desi', 'Indian'],
            tags: ['Free Delivery', 'Promo']
        },
        categories: [
            {
                name: 'Popular',
                items: [
                    {
                        id: 19,
                        name: 'Butter Chicken',
                        description: 'Tender chicken in rich tomato-butter sauce',
                        price: 14.99,
                        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: true
                    },
                    {
                        id: 20,
                        name: 'Paneer Tikka Masala',
                        description: 'Grilled cottage cheese in spiced tomato gravy',
                        price: 13.99,
                        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: true
                    }
                ]
            },
            {
                name: 'Main Course',
                items: [
                    {
                        id: 21,
                        name: 'Dal Makhani',
                        description: 'Black lentils cooked overnight with cream',
                        price: 11.99,
                        image: 'images/menu/dal-makhani.jpg',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 22,
                        name: 'Biryani',
                        description: 'Fragrant rice with spices and choice of protein',
                        price: 15.99,
                        image: 'images/menu/biryani.jpg',
                        isVeg: false,
                        isSpicy: true
                    }
                ]
            },
            {
                name: 'Breads',
                items: [
                    {
                        id: 23,
                        name: 'Naan Bread',
                        description: 'Traditional Indian flatbread',
                        price: 2.99,
                        image: 'images/menu/naan.jpg',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 24,
                        name: 'Garlic Naan',
                        description: 'Naan bread with garlic and butter',
                        price: 3.49,
                        image: 'images/menu/garlic-naan.jpg',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            }
        ]
    },
    'wok-n-roll': {
        info: {
            id: 'wok-n-roll',
            name: 'Wok N Roll',
            image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60',
            rating: 4.4,
            deliveryTime: '25-35',
            priceRange: '$$',
            cuisine: ['Chinese', 'Asian'],
            tags: ['Free Delivery']
        },
        categories: [
            {
                name: 'Popular',
                items: [
                    {
                        id: 25,
                        name: 'Kung Pao Chicken',
                        description: 'Diced chicken with peanuts and vegetables in spicy sauce',
                        price: 13.99,
                        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: true
                    },
                    {
                        id: 26,
                        name: 'Chow Mein',
                        description: 'Stir-fried noodles with vegetables',
                        price: 11.99,
                        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=60',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            },
            {
                name: 'Main Course',
                items: [
                    {
                        id: 27,
                        name: 'Sweet & Sour Pork',
                        description: 'Crispy pork with pineapple in sweet and sour sauce',
                        price: 14.99,
                        image: 'images/menu/sweet-sour.jpg',
                        isVeg: false,
                        isSpicy: false
                    },
                    {
                        id: 28,
                        name: 'Mapo Tofu',
                        description: 'Soft tofu in spicy sauce with minced meat',
                        price: 12.99,
                        image: 'images/menu/mapo-tofu.jpg',
                        isVeg: false,
                        isSpicy: true
                    }
                ]
            },
            {
                name: 'Sides',
                items: [
                    {
                        id: 29,
                        name: 'Spring Rolls',
                        description: 'Crispy rolls with vegetables',
                        price: 5.99,
                        image: 'images/menu/spring-rolls.jpg',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 30,
                        name: 'Fried Rice',
                        description: 'Wok-fried rice with eggs and vegetables',
                        price: 8.99,
                        image: 'images/menu/fried-rice.jpg',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            }
        ]
    },
    'taco-fiesta': {
        info: {
            id: 'taco-fiesta',
            name: 'Taco Fiesta',
            image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=60',
            rating: 4.5,
            deliveryTime: '20-30',
            priceRange: '$$',
            cuisine: ['Mexican', 'Latin'],
            tags: ['Promo']
        },
        categories: [
            {
                name: 'Popular',
                items: [
                    {
                        id: 31,
                        name: 'Street Tacos',
                        description: 'Three soft corn tortillas with choice of meat, onions, cilantro',
                        price: 8.99,
                        image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: true
                    },
                    {
                        id: 32,
                        name: 'Quesadilla',
                        description: 'Large flour tortilla with cheese and choice of filling',
                        price: 9.99,
                        image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&auto=format&fit=crop&q=60',
                        isVeg: false,
                        isSpicy: false
                    }
                ]
            },
            {
                name: 'Burritos',
                items: [
                    {
                        id: 33,
                        name: 'Super Burrito',
                        description: 'Large burrito with rice, beans, meat, guacamole, and salsa',
                        price: 11.99,
                        image: 'images/menu/burrito.jpg',
                        isVeg: false,
                        isSpicy: true
                    },
                    {
                        id: 34,
                        name: 'Veggie Burrito',
                        description: 'Rice, beans, grilled vegetables, guacamole',
                        price: 10.99,
                        image: 'images/menu/veggie-burrito.jpg',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            },
            {
                name: 'Sides',
                items: [
                    {
                        id: 35,
                        name: 'Guacamole & Chips',
                        description: 'Fresh guacamole with crispy tortilla chips',
                        price: 6.99,
                        image: 'images/menu/guacamole.jpg',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 36,
                        name: 'Mexican Rice',
                        description: 'Traditional Mexican rice with vegetables',
                        price: 3.99,
                        image: 'images/menu/mexican-rice.jpg',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            }
        ]
    },
    'thai-spice': {
        info: {
            id: 'thai-spice',
            name: 'Thai Spice',
            image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=60',
            rating: 4.6,
            deliveryTime: '30-40',
            priceRange: '$$',
            cuisine: ['Thai', 'Asian'],
            tags: ['Free Delivery']
        },
        categories: [
            {
                name: 'Popular',
                items: [
                    {
                        id: 37,
                        name: 'Pad Thai',
                        description: 'Rice noodles with tofu, shrimp, peanuts, bean sprouts',
                        price: 13.99,
                        image: 'images/menu/pad-thai.jpg',
                        isVeg: false,
                        isSpicy: false
                    },
                    {
                        id: 38,
                        name: 'Green Curry',
                        description: 'Spicy coconut curry with bamboo shoots and basil',
                        price: 14.99,
                        image: 'images/menu/green-curry.jpg',
                        isVeg: false,
                        isSpicy: true
                    }
                ]
            },
            {
                name: 'Main Course',
                items: [
                    {
                        id: 39,
                        name: 'Drunken Noodles',
                        description: 'Wide rice noodles stir-fried with basil and chili',
                        price: 13.99,
                        image: 'images/menu/drunken-noodles.jpg',
                        isVeg: false,
                        isSpicy: true
                    },
                    {
                        id: 40,
                        name: 'Vegetable Curry',
                        description: 'Mixed vegetables in yellow coconut curry',
                        price: 12.99,
                        image: 'images/menu/veg-curry.jpg',
                        isVeg: true,
                        isSpicy: true
                    }
                ]
            },
            {
                name: 'Appetizers',
                items: [
                    {
                        id: 41,
                        name: 'Spring Rolls',
                        description: 'Crispy rolls with glass noodles and vegetables',
                        price: 6.99,
                        image: 'images/menu/thai-spring-rolls.jpg',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 42,
                        name: 'Satay',
                        description: 'Grilled chicken skewers with peanut sauce',
                        price: 8.99,
                        image: 'images/menu/satay.jpg',
                        isVeg: false,
                        isSpicy: false
                    }
                ]
            }
        ]
    },
    'pasta-paradise': {
        info: {
            id: 'pasta-paradise',
            name: 'Pasta Paradise',
            image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=60',
            rating: 4.4,
            deliveryTime: '25-35',
            priceRange: '$$',
            cuisine: ['Italian', 'Pasta'],
            tags: ['Promo']
        },
        categories: [
            {
                name: 'Popular',
                items: [
                    {
                        id: 43,
                        name: 'Spaghetti Carbonara',
                        description: 'Classic carbonara with pancetta, egg, pecorino',
                        price: 14.99,
                        image: 'images/menu/carbonara.jpg',
                        isVeg: false,
                        isSpicy: false
                    },
                    {
                        id: 44,
                        name: 'Fettuccine Alfredo',
                        description: 'Creamy parmesan sauce with fettuccine',
                        price: 13.99,
                        image: 'images/menu/alfredo.jpg',
                        isVeg: true,
                        isSpicy: false
                    }
                ]
            },
            {
                name: 'Pasta',
                items: [
                    {
                        id: 45,
                        name: 'Penne Arrabbiata',
                        description: 'Spicy tomato sauce with garlic and red chili',
                        price: 12.99,
                        image: 'images/menu/arrabbiata.jpg',
                        isVeg: true,
                        isSpicy: true
                    },
                    {
                        id: 46,
                        name: 'Seafood Linguine',
                        description: 'Mixed seafood in white wine sauce',
                        price: 16.99,
                        image: 'images/menu/seafood-pasta.jpg',
                        isVeg: false,
                        isSpicy: false
                    }
                ]
            },
            {
                name: 'Sides',
                items: [
                    {
                        id: 47,
                        name: 'Garlic Bread',
                        description: 'Toasted bread with garlic butter and herbs',
                        price: 4.99,
                        image: 'images/menu/italian-garlic-bread.jpg',
                        isVeg: true,
                        isSpicy: false
                    },
                    {
                        id: 48,
                        name: 'Caprese Salad',
                        description: 'Fresh mozzarella, tomatoes, basil, balsamic glaze',
                        price: 8.99,
                        image: 'images/menu/caprese.jpg',
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
    module.exports = menuData2;
} else {
    window.menuData2 = menuData2;
} 