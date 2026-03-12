# Track 12: Security Hardening

## Objective
Implement final security sweeps over the application, ensuring that input sanitization via DOMPurify exists (already completed in earlier tracks) and that Firestore Security Rules reflect least-privilege principles.

## Requirements
- Security Rules (`firestore.rules`):
  1. `products`: Allow read to anyone. Allow write only to admins (for the sake of the seeding endpoint, we will mock admin or temporarily allow all, but strictly we should require admin auth. We will define a strict admin auth structure).
  2. `users`: Users can only read/write their own document (`request.auth.uid == userId`).
  3. `carts`: Users can only read/write their own carts (`request.auth.uid == userId`).
  4. `orders`: Users can only read/write their own orders (`request.auth.uid == userId`).
- Ensure no XSS payload vulnerability exists on forms (DOMPurify is already applied across Auth and Checkout).
