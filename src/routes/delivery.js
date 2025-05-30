const express = require('express');
const router = express.Router();
const deliveryService = require('../services/DeliveryService');

// Initialize some sample locations
const initializeLocations = () => {
    // Add restaurants
    deliveryService.addLocation('R1', 'Restaurant A', 40.7128, -74.0060, 'restaurant');
    deliveryService.addLocation('R2', 'Restaurant B', 40.7589, -73.9851, 'restaurant');
    
    // Add some delivery points
    deliveryService.addLocation('D1', 'Delivery Point 1', 40.7549, -73.9840);
    deliveryService.addLocation('D2', 'Delivery Point 2', 40.7489, -73.9680);
    
    // Add routes with calculated distances
    deliveryService.addRoute('R1', 'D1', 2.5);
    deliveryService.addRoute('R1', 'D2', 3.0);
    deliveryService.addRoute('R2', 'D1', 1.5);
    deliveryService.addRoute('R2', 'D2', 2.0);
    deliveryService.addRoute('D1', 'D2', 1.0);
};

// Initialize sample data
initializeLocations();

// Get shortest route between two points
router.get('/route', (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({
                status: 'error',
                message: 'Both "from" and "to" locations are required'
            });
        }

        const route = deliveryService.findShortestPath(from, to);
        res.json({
            status: 'success',
            data: route
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Calculate optimal route for multiple deliveries
router.post('/optimal-route', (req, res) => {
    try {
        const { startLocation, deliveryPoints } = req.body;
        if (!startLocation || !deliveryPoints || !Array.isArray(deliveryPoints)) {
            return res.status(400).json({
                status: 'error',
                message: 'Start location and array of delivery points are required'
            });
        }

        const route = deliveryService.calculateOptimalRoute(startLocation, deliveryPoints);
        res.json({
            status: 'success',
            data: route
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Start a new delivery
router.post('/start', (req, res) => {
    try {
        const { orderId, restaurantId, deliveryLocation } = req.body;
        if (!orderId || !restaurantId || !deliveryLocation) {
            return res.status(400).json({
                status: 'error',
                message: 'Order ID, restaurant ID, and delivery location are required'
            });
        }

        const delivery = deliveryService.startDelivery(orderId, restaurantId, deliveryLocation);
        res.json({
            status: 'success',
            data: delivery
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Update delivery status
router.put('/status/:deliveryId', (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { currentLocation, status } = req.body;
        if (!currentLocation || !status) {
            return res.status(400).json({
                status: 'error',
                message: 'Current location and status are required'
            });
        }

        const delivery = deliveryService.updateDeliveryStatus(deliveryId, currentLocation, status);
        res.json({
            status: 'success',
            data: delivery
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get delivery status
router.get('/status/:deliveryId', (req, res) => {
    try {
        const { deliveryId } = req.params;
        const status = deliveryService.getDeliveryStatus(deliveryId);
        
        if (!status) {
            return res.status(404).json({
                status: 'error',
                message: 'Delivery not found'
            });
        }

        res.json({
            status: 'success',
            data: status
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router; 