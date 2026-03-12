# Track 4: Search and Filter System

## Objective
Implement product discovery mechanisms through SearchBar and FilterSidebar.

## Requirements
- Create `components/SearchBar.tsx` with debounced input and prefix search queries.
- Create `components/FilterSidebar.tsx` with category filters (checkboxes) and price range (min/max).
- Combine logical filtering on the main Catalog page without full page reload.
- Adjust `app/page.tsx` layout to include the Sidebar on the left.
- Ensure Firestore queries and rendering remain efficient.
