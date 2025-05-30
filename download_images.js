const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
    'hero-bg.jpg': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920',
    'cuisines/pizza.jpg': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    'cuisines/burger.jpg': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    'cuisines/sushi.jpg': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    'cuisines/indian.jpg': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    'cuisines/chinese.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
    'restaurants/rest1.jpg': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    'restaurants/rest2.jpg': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
    'restaurants/rest3.jpg': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600',
    'app-store.png': 'https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg',
    'play-store.png': 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png',
    'app-mockup.png': 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=400'
};

// Create directories if they don't exist
const dirs = ['public/images', 'public/images/cuisines', 'public/images/restaurants'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Download each image
Object.entries(images).forEach(([filename, url]) => {
    const filepath = path.join('public/images', filename);
    https.get(url, (response) => {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${filename}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${filename}:`, err.message);
    });
}); 