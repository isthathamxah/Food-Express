const User = require('../models/User');

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, phone, address } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create new user
            const user = new User({
                name,
                email,
                password,
                phone,
                address
            });

            const newUser = await User.create(user);
            const token = User.generateToken(newUser);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await User.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = User.generateToken(user);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching profile', error: error.message });
        }
    }

    static async updateProfile(req, res) {
        try {
            const { name, email, phone, address } = req.body;
            const updated = await User.update(req.user.id, { name, email, phone, address });

            if (!updated) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating profile', error: error.message });
        }
    }
}

module.exports = AuthController; 