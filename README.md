# MagicSystem Shop

## Overview
MagicSystem Shop is a specialized e-commerce platform designed with a high-fidelity interface inspired by manhwa RPG system aesthetics. The application provides a seamless transition between traditional digital commerce and a gamified user experience, specifically engineered for digital asset procurement and inventory management.

## System Features

### Core Commerce Modules
*   **Product Registry**: A centralized catalog of digital assets with hierarchical categorization and attribute-based filtering.
*   **Inventory Protocol**: A persistent shopping cart system managed via localized state and synchronized with a Firestore backend.
*   **Transactional Engine**: A secure checkout sequence involving coordinate verification and multi-tier fund transfer methods.

### RPG System Integrations
*   **Entity Onboarding**: A structured initialization sequence to collect and register user specificities, professional designations, and skill sets.
*   **Registry Funds (Gold)**: A specialized internal currency system with secure transactional deduction and balance recalibration protocols.
*   **Item Rarity Grading**: Implementation of a five-tier rarity classification system (Common, Rare, Epic, Legendary, Mythic) with dynamic visual manifestation.
*   **Command Dashboard**: A personalized user portal featuring curated asset recommendations and status analysis.

### Navigation and Routing
*   **Authenticated Channeling**: Client-side and server-side guards ensuring that authenticated entities are streamlined into specialized dashboard sectors.
*   **Command Sidebar**: A collapsible navigation interface with localized padding synchronization for viewport optimization.

## Technology Stack

### Frontend Framework
*   **Next.js 14**: Utilizing the App Router architecture for optimized routing and server-side rendering.
*   **React**: Component-driven UI development.
*   **TypeScript**: Enforcement of strict type safety across the entire codebase.

### Styling and Interface
*   **Tailwind CSS**: Utility-first styling with specialized system-themed utility classes.
*   **Framer Motion / CSS Keyframes**: Implementation of high-tier visual effects and grand manifestations.

### Backend Infrastructure
*   **Firebase Authentication**: Secure entity verification and session management.
*   **Firestore Database**: Real-time NoSQL data structure for item registries and transaction logs.
*   **Supabase Storage**: Centralized asset hosting with optimized content delivery.

## Architecture

### Directory Structure
*   `/app`: Contains the routing logic and page-level manifestations.
*   `/components`: Reusable UI modules, including the specialized SystemWindow wrapper.
*   `/services`: Domain logic for authentication, product management, and order processing.
*   `/contexts`: Global state providers for Cart, Authentication, and System Messaging.
*   `/public`: Static asset registry.

## Installation and Setup

### Prerequisites
*   Node.js (LTS version recommended)
*   npm or yarn package manager
*   Firebase Project Credentials
*   Supabase Storage Bucket API keys

### Procedure
1.  Clone the repository to the local environment.
2.  Execute `npm install` to manifest the dependency tree.
3.  Configure the `.env.local` file with the following variables:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    ```
4.  Initiate the development server via `npm run dev`.
5.  Access the interface at `http://localhost:3000`.

## Security Protocols
*   **Input Sanitization**: Utilization of DOMPurify for all user-provided data inputs.
*   **Asynchronous Persistence**: Firebase Auth persistence configured for secure terminal session retention.
*   **Middleware Guards**: Protection of user sectors through Next.js middleware and client-side auth listeners.
