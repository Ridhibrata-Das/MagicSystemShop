# Track 8: Cart Page

## Objective
Create a dedicated cart page displaying the contents of the user's cart. Users should see what they've added, be able to adjust quantities, remove items, and view total costs.

## Requirements
- Create `components/Navbar.tsx` that includes a cart icon directing to `/cart`, showing an item count badge derived from `useCart`. Ensure `Navbar` is included in `layout.tsx`.
- Create `app/cart/page.tsx` displaying the cart items sequentially.
- The Cart page will need a method to lookup Product details (name, image) based on standard `productId` since the CartItem schema only stores IDs and quantities. (Create `services/products.ts` multi-fetch if necessary, or just fetch all and filter client side given the small product size context.)
- Allow modifying quantity integers (+ / -) directly altering `updateQuantity`.
- Show a subtotal calculation.
- Link to Checkout flow.
