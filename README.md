# Food Express

A modern food delivery web application that allows users to order food from various restaurants and track their deliveries in real-time.

## Features

- User authentication (login/register)
- Restaurant browsing and searching
- Menu viewing and ordering
- Shopping cart functionality
- Real-time order tracking
- Delivery status updates
- Responsive design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- UI Framework: Bootstrap 5
- Icons: Font Awesome
- Backend: Node.js (Express)
- Database: MySQL

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/food-express.git
cd food-express
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=food_express
JWT_SECRET=your_jwt_secret
```

4. Import the database schema:
```bash
mysql -u your_username -p your_database < food_express_complete.sql
```

5. Start the server:
```bash
npm start
```

## Project Structure

```
food-express/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── views/
├── routes/
├── models/
├── config/
└── server.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Bootstrap team for the amazing UI framework
- Font Awesome for the icons
- All contributors who have helped with the project 