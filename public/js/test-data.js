// Sample test data
const testData = {
    restaurants: [
        {
            id: 'R1',
            name: 'Pizza Palace',
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Broadway, New York, NY 10007'
        },
        {
            id: 'R2',
            name: 'Burger Bistro',
            latitude: 40.7589,
            longitude: -73.9851,
            address: '456 5th Ave, New York, NY 10016'
        }
    ],
    orders: [
        {
            id: 'ORDER1',
            orderNumber: '1001',
            userId: 'USER1',
            restaurantId: 'R1',
            restaurantName: 'Pizza Palace',
            status: 'confirmed',
            items: [
                {
                    name: 'Pepperoni Pizza',
                    price: 15.99,
                    quantity: 2
                },
                {
                    name: 'Garlic Knots',
                    price: 5.99,
                    quantity: 1
                }
            ],
            subtotal: 37.97,
            deliveryFee: 5.00,
            tax: 3.42,
            total: 46.39,
            orderDate: new Date().toISOString(),
            estimatedDeliveryTime: 30,
            restaurant: {
                id: 'R1',
                name: 'Pizza Palace',
                latitude: 40.7128,
                longitude: -74.0060,
                address: '123 Broadway, New York, NY 10007'
            },
            delivery: {
                address: '789 Park Ave',
                city: 'New York',
                state: 'NY',
                zipCode: '10021',
                latitude: 40.7739,
                longitude: -73.9652,
                instructions: 'Ring doorbell 4B'
            }
        }
    ],
    users: [
        {
            id: 'USER1',
            name: 'John Doe',
            email: 'john@example.com',
            token: 'test-token-123'
        }
    ]
};

// Initialize local storage with test data
function initializeTestData() {
    localStorage.setItem('restaurants', JSON.stringify(testData.restaurants));
    localStorage.setItem('orders', JSON.stringify(testData.orders));
    localStorage.setItem('users', JSON.stringify(testData.users));
    localStorage.setItem('currentUser', JSON.stringify(testData.users[0]));
}

// Export for use in other modules
window.testData = testData;
window.initializeTestData = initializeTestData; 