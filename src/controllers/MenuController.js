const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');

class MenuController {
    static async create(req, res) {
        try {
            const restaurant = await Restaurant.findById(req.body.restaurant_id);
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to add menu items to this restaurant' });
            }

            const menuItem = new Menu(req.body);
            const newMenuItem = await Menu.create(menuItem);

            res.status(201).json({
                message: 'Menu item created successfully',
                menuItem: newMenuItem
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating menu item', error: error.message });
        }
    }

    static async getByRestaurant(req, res) {
        try {
            const menuItems = await Menu.findByRestaurant(req.params.restaurantId);
            res.json(menuItems);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching menu items', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const menuItem = await Menu.findById(req.params.id);
            if (!menuItem) {
                return res.status(404).json({ message: 'Menu item not found' });
            }
            res.json(menuItem);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching menu item', error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const menuItem = await Menu.findById(req.params.id);
            if (!menuItem) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            const restaurant = await Restaurant.findById(menuItem.restaurant_id);
            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this menu item' });
            }

            const updated = await Menu.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            res.json({ message: 'Menu item updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating menu item', error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const menuItem = await Menu.findById(req.params.id);
            if (!menuItem) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            const restaurant = await Restaurant.findById(menuItem.restaurant_id);
            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this menu item' });
            }

            const deleted = await Menu.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            res.json({ message: 'Menu item deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting menu item', error: error.message });
        }
    }

    static async updateAvailability(req, res) {
        try {
            const { isAvailable } = req.body;
            const menuItem = await Menu.findById(req.params.id);
            if (!menuItem) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            const restaurant = await Restaurant.findById(menuItem.restaurant_id);
            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this menu item' });
            }

            const updated = await Menu.updateAvailability(req.params.id, isAvailable);
            if (!updated) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            res.json({ message: 'Menu item availability updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating menu item availability', error: error.message });
        }
    }

    static async search(req, res) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ message: 'Search query is required' });
            }

            const menuItems = await Menu.searchByRestaurant(req.params.restaurantId, query);
            res.json(menuItems);
        } catch (error) {
            res.status(500).json({ message: 'Error searching menu items', error: error.message });
        }
    }

    static async getCategories(req, res) {
        try {
            const categories = await Menu.getCategories(req.params.restaurantId);
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error: error.message });
        }
    }
}

module.exports = MenuController; 