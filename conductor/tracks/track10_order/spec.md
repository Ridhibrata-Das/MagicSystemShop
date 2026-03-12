# Track 10: Order Creation

## Objective
Persist the confirmed Checkout data to Firestore securely using atomic transactions, ensuring product stock doesn't oversell and correctly recording the transaction history.

## Requirements
- Add `createOrder(userId, items, shippingAddress, total)` to `services/orders.ts`.
- The `createOrder` function must use `runTransaction` to:
  1. Read the current stock of all items in the cart.
  2. Verify enough stock exists. If not, throw and abort the transaction.
  3. Decrement product stock in the database.
  4. Write the new Order document to the `orders` collection.
- Upon successful order creation, `checkout/page.tsx` clears the cart (using existing clearCart).
- Redirect to an `app/order-success/page.tsx` confirming the transaction.
