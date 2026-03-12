# Track 9: Checkout Flow

## Objective
Implement a multi-step checkout process converting the user's cart into an impending order, gathering shipping information and a payment method.

## Requirements
- Create `schemas/checkoutSchemas.ts` leveraging `zod` to validate the shipping address form (Name, Address, City, Postal Code, Country) and payment method selection.
- Build `app/checkout/page.tsx` containing a 3-step wizard:
  1. **Shipping Details**: Form validated by Zod.
  2. **Payment Method**: Select "Credit Card" (mock), "PayPal" (mock), etc.
  3. **Review**: Final summary of costs (+ shipping mock calculation) and "Place Order" button.
- Extract `CheckoutWizard` or manage state in the single page utilizing `useForm` (or naive state) to progress through steps.
