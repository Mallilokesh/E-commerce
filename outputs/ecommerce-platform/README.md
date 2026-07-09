# SmartStore - Full-Stack E-commerce Platform

SmartStore is a complete e-commerce platform with a responsive storefront, user authentication, product catalog, cart management, checkout, and order tracking.

## Features

- User registration, login, logout, and session-based authorization
- Product catalog with search, category filtering, sorting, and inventory
- Server-side cart API
- Demo checkout with tokenized payment simulation
- Order creation and customer order history
- Responsive storefront, cart drawer, checkout modal, and account panel
- Operations dashboard for revenue, order, and cart metrics
- Vercel deployment support

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- Database: JSON file storage for demo use
- Deployment: Vercel

## Run Locally

```bash
npm start
```

Open `http://localhost:3000`.

## API Routes

- `GET /api/products`
- `GET /api/me`
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/cart`
- `PUT /api/cart`
- `DELETE /api/cart`
- `GET /api/orders`
- `POST /api/orders`

## Demo Payment

Use any cardholder name, any future expiry date, any CVC, and a card number ending in at least four digits. The app creates a demo payment token and sends only the token plus last four digits to the server.

## Deployment Note

The root `vercel.json` file routes Vercel requests to this app's Node server. Vercel storage is temporary, so use a production database for real users, carts, and orders.
