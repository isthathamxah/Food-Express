const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./src/routes/api');
const { initializeStorage } = require('./src/services/localStorage');

const app = express();
const port = process.env.PORT || 3000;

// Initialize storage
initializeStorage();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Disabled for development
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Special route for test-delivery.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-delivery.html'));
});

// Handle all other routes
app.get('*', (req, res) => {
    // Extract the path from the URL
    const route = req.path;
    
    // Map routes to HTML files
    if (route.endsWith('.html')) {
        res.sendFile(path.join(__dirname, 'public', route));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

// Start the server with error handling
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Trying port ${port + 1}...`);
        // Try the next port
        const nextPort = port + 1;
        app.listen(nextPort, () => {
            console.log(`Server is running at http://localhost:${nextPort}`);
            console.log('Press Ctrl+C to stop the server');
        });
    } else {
        console.error('Server failed to start:', err.message);
        process.exit(1);
    }
}); 