const { v4: uuidv4 } = require('uuid');

const sampleRestaurants = [
    {
        id: uuidv4(),
        name: "Pizza Palace",
        cuisine_type: "Italian",
        rating: 4.5,
        delivery_time: "30-40",
        price_range: "$$",
        image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3",
        description: "Authentic Italian pizzas and pasta"
    },
    {
        id: uuidv4(),
        name: "Burger House",
        cuisine_type: "American",
        rating: 4.3,
        delivery_time: "25-35",
        price_range: "$$",
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        description: "Gourmet burgers and fries"
    },
    {
        id: uuidv4(),
        name: "Sushi Master",
        cuisine_type: "Japanese",
        rating: 4.7,
        delivery_time: "35-45",
        price_range: "$$$",
        image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
        description: "Fresh sushi and Japanese specialties"
    }
];

const sampleMenuItems = [
    {
        id: uuidv4(),
        restaurant_id: sampleRestaurants[0].id,
        name: "Margherita Pizza",
        description: "Fresh tomatoes, mozzarella, and basil",
        price: 12.99,
        category: "Pizza",
        is_vegetarian: true,
        image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002"
    },
    {
        id: uuidv4(),
        restaurant_id: sampleRestaurants[0].id,
        name: "Pepperoni Pizza",
        description: "Classic pepperoni with cheese",
        price: 14.99,
        category: "Pizza",
        is_vegetarian: false,
        image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e"
    },
    {
        id: uuidv4(),
        restaurant_id: sampleRestaurants[1].id,
        name: "Classic Burger",
        description: "Beef patty with lettuce, tomato, and cheese",
        price: 10.99,
        category: "Burgers",
        is_vegetarian: false,
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
    },
    {
        id: uuidv4(),
        restaurant_id: sampleRestaurants[2].id,
        name: "California Roll",
        description: "Crab, avocado, and cucumber",
        price: 8.99,
        category: "Sushi Rolls",
        is_vegetarian: false,
        image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c"
    }
];

module.exports = {
    sampleRestaurants,
    sampleMenuItems
}; 