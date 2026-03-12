# Track 5: Authentication System

## Objective
Implement user signup, login, and robust authentication with Firebase Auth. Store complementary user document info in Firestore.

## Requirements
- `services/authService.ts`: `signup`, `login`, `logout`, `getCurrentUser`.
- User object should be saved to Firestore under `users` collection upon first signup.
- Create UI pages: `app/signup/page.tsx` and `app/login/page.tsx`.
- Form validation implemented using `zod` module (min length, standard email formatting).
- Strict DOMPurify sanitization before processing any string fields.
- Responsive mobile-first forms matching the clean site aesthetic.
