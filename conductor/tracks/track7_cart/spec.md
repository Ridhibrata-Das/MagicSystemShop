# Track 7: Cart System

## Objective
Implement a persistent shopping cart using Firestore that tracks items added by authenticated users, persisting across sessions.

## Requirements
- Create `services/cartService.ts`: `getCart`, `addToCart`, `updateQuantity`, `removeItem`, `clearCart`.
- Add context or hook wrapper so components (like Add to Cart button on product cards) can easily add items.
- Ensure only authenticated users can save to Firestore cart (or guest cart functionality fallback). Wait, the prompt says "Ensure cart persists across sessions" and "Store cart in Firestore". 
- Add "Add to Cart" button actions on `ProductCard`.
