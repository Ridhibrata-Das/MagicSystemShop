# Track 2: Database Architecture

## Objective
Design the core Firestore database schema for products, users, carts, and orders to support the MagicSystem Shop. 

## Requirements
- Define comprehensive TypeScript interfaces.
- Create Firestore collection references and core helper functions.
- Fields defined must precisely match the provided schema rules:
  - Product: id, title, description, price, category, stock, imageUrl
  - User: uid, email, displayName, createdAt
  - Cart: userId, items (array of CartItem)
  - CartItem: productId, quantity, priceSnapshot
  - Order: orderId, userId, items, totalPrice, shippingAddress, paymentMethod, createdAt
