# SmartStore

A complete full-stack e-commerce demo built with a dependency-free Node.js API and a responsive storefront.

## Run

```bash
npm start
```

Open `http://localhost:3000`.

## Included

- User registration, login, logout, and session-based authorization
- Product catalog with search, category filtering, sorting, and inventory
- Server-side cart API
- Demo checkout with tokenized payment simulation
- Order creation and customer order history
- Responsive storefront, cart drawer, checkout modal, and account panel
- JSON-backed database for easy inspection during demos

## Demo Payment

Use any cardholder name, any future expiry date, any CVC, and a card number ending in at least four digits. The app creates a demo payment token and sends only the token plus last four digits to the server.
