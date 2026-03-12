# Track 6: User Profile

## Objective
Provide an interface for authenticated users to view their account details and previous order history.

## Requirements
- Create `services/orders.ts` providing `getUserOrders(userId)` method natively hitting Firestore.
- Create `app/(user)/profile/page.tsx` displaying:
  - User details (Name, Email, Account created date).
  - Order history list showing order ID, date, total price.
  - Expandable order items list when clicked.
- This UI requires retrieving the current Firebase session to query securely, enforcing the user context.
