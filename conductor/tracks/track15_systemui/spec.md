# Track 15: System UI Overhaul

## Objective
The store must be converted completely into a "System Shop" window acting like an RPG HUD overlay. All basic e-commerce elements must be redesigned into translucent dark system panels with glowing neon/cyan borders.

## Requirements
1. **Theming**:
   - `tailwind.config.ts` must introduce a deep black/blue background, translucent background shades, and neon cyan accents.
   - Inject a futuristic Google Font (`Rajdhani` or `Orbitron`) across `app/layout.tsx`.
2. **Terminology Mapping**:
   - Shop → SYSTEM SHOP
   - Inventory → INVENTORY (Cart)
   - Add to Cart → Acquire
   - Checkout → CONFIRM PURCHASE
   - Items → Products
3. **Components**:
   - Update `app/page.tsx` with a floating main layout header indicating "SYSTEM SHOP" and gold counter.
   - Update `ProductCard.tsx` into an RPG Item Panel (Glowing stock borders, Acquire button, subtle stats).
   - Update `components/Navbar.tsx` to resemble a minimal game top-bar.
   - Create custom `SystemNotification` toast hook for displaying popup messages like `[SYSTEM MESSAGE] Item Acquired`.
4. **Checkout & Profile**:
   - Update the UI to match "CONFIRM PURCHASE" wizard styling using translucent modules.
   - Update user profile UI heavily reflecting "PLAYER STATUS".
