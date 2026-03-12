# Track 3: Product Catalog

## Objective
Implement the core product catalog landing page, UI components, and the product service layer.

## Requirements
- Create `services/products.ts` exporting: `getAllProducts`, `getProductById`, `searchProducts`, `filterProducts`.
- All methods must use the typed `collections.products` defined in Track 2.
- UI components must not access Firestore directly.
- Create `components/ProductCard.tsx` (shows image, title, description, price, category, stock, Add to Cart button).
- Create `components/ProductGrid.tsx` (responsive Tailwind grid: Desktop 4 cols, Tablet 2 cols, Mobile 1 col).
- Support loading states using skeletons.
