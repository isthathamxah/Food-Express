const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const pool = require('../config/db.config');
const { userService } = require('../services/localStorage');

const protect = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        // Get user ID from token
        const userId = authHeader.split(' ')[1];
        
        // Get user from service
        const user = userService.getById(userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
}; 