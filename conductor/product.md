# MagicSystem Shop Product

**Name**: MagicSystem Shop
**Type**: E-commerce Storefront
**Stack**: Next.js App Router, React, TailwindCSS, Firebase (Auth/Firestore), Cloudinary
**Description**: A complete, modular, and scalable e-commerce storefront with product catalog, authentication, persistent shopping cart, search, filtering, checkout flow, stock management, and order history.

## Architecture Guidelines
- Modular architecture with a clear separation of UI and business logic (Service Layer pattern).
- Reusable components under `components/`.
- Strict TypeScript typing (types under `types/`).
- Consistent standard Next.js App Router structure (`app/`).
- Services for business logic (`services/`).
- Library configurations (`lib/`).
- Zod schemas for validation (`schemas/`).
- Custom hooks (`hooks/`).
- Helper utilities (`utils/`).
- Scripts for automation (`scripts/`).

## Design Aesthetics
- Clean, minimal, responsive, accessible, fast.
- Primary font: sans-serif stack.
- Primary color: neutral gray scale. Accent color: subtle blue.
- Header, Main Content, Footer layout.
- Interactive elements explicitly designated.
