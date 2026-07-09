# SmartStore - Full-Stack E-commerce Platform

SmartStore is a complete e-commerce platform built for a business that wants to sell products online with a responsive storefront, user accounts, cart management, checkout, and order tracking.

## Project Overview

The goal of this project is to provide a scalable and secure full-stack shopping experience. It includes a customer-facing website and backend APIs for authentication, products, cart actions, demo payment processing, and order management.

## Features

- Responsive e-commerce website
- User registration and login
- Session-based authentication and authorization
- Product catalog with search, category filtering, and sorting
- Shopping cart with quantity controls
- Secure demo checkout flow using tokenized payment data
- Order creation and order history
- Operations dashboard with revenue, order, and cart metrics
- JSON-backed local database for demo use
- Vercel deployment configuration

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- Runtime: Node HTTP server
- Database: JSON file storage for local/demo use
- Deployment: Vercel

## Project Structure

```text
.
|-- README.md
|-- vercel.json
`-- outputs/
    `-- ecommerce-platform/
        |-- package.json
        |-- README.md
        |-- server.js
        `-- public/
            |-- index.html
            |-- styles.css
            `-- app.js
```

## How to Run Locally

Go to the application folder:

```bash
cd outputs/ecommerce-platform
```

Start the server:

```bash
npm start
```

Open this URL in your browser:

```text
http://localhost:3000
```

## Demo Payment

Use any cardholder name, any future expiry date, any CVC, and a card number with at least four digits.

Example:

```text
Card number: 4242 4242 4242 4242
Expiry: 12/30
CVC: 123
```

The browser creates a demo payment token. The server receives only the token and the last four digits, not the full card number.

## API Routes

- `GET /api/products` - Fetch all products
- `GET /api/me` - Get current logged-in user
- `POST /api/register` - Create a new account
- `POST /api/login` - Log in
- `POST /api/logout` - Log out
- `GET /api/cart` - Fetch user cart
- `PUT /api/cart` - Add, update, or remove cart items
- `DELETE /api/cart` - Clear cart
- `GET /api/orders` - Fetch user orders
- `POST /api/orders` - Place a new order

## Deployment Notes

This project includes `vercel.json`, which routes Vercel traffic to the Node server inside `outputs/ecommerce-platform/server.js`.

For Vercel:

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Deploy from the `main` branch.

Note: Vercel serverless storage is temporary, so demo users, carts, and orders can reset between deployments or cold starts. For a production version, connect the backend to a persistent database such as PostgreSQL, MongoDB, or MySQL.

## Security Notes

- Passwords are hashed using PBKDF2 before storage.
- Sessions use HTTP-only cookies.
- Checkout uses demo tokenization and does not store full card details.
- Local demo database files should not be committed if they contain user data.

## Future Improvements

- Add a production database
- Add real payment gateway integration such as Stripe or Razorpay
- Add admin product management
- Add email order confirmations
- Add product reviews and wishlist support
- Add inventory and shipment status management
