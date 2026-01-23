# Hospital Navigation & Service Directory - Implementation Plan

## Objective
To implement a navigation system that helps patients find their way around the hospital, locate specific departments, and access service information.

## 1. Core Features

### A. Digital Hospital Map
- **Interactive Floor Plans:** Toggle between different floors (Ground, 1st, 2nd, etc.).
- **Points of Interest (POIs):** Markers for Departments, Wards, Restrooms, Cafeteria, Pharmacy, Elevators, and Exits.
- **User Interaction:** Click on a marker to see details (opening hours, services).

### B. Service Directory
- **Searchable List:** Filter departments and services by name or category.
- **Detailed Information:** Phone numbers, head of department, operating hours.
- **Quick Actions:** "Show on Map" button.

### C. Basic Wayfinding (Directions)
- **Static Directions:** "How to get here" text descriptions from main entrance.
- **Visual Path:** (MVP) Highlight the destination node on the map. (Advanced) Draw a line from Entry to Destination.

---

## 2. Technical Design

### Data Model (JSON/Database)

Even for MVP, we should structure the data properly.

**1. `floors`**
```json
[
  { "id": "g", "name": "Ground Floor", "map_url": "/maps/ground_floor.svg", "level": 0 },
  { "id": "1", "name": "First Floor", "map_url": "/maps/first_floor.svg", "level": 1 }
]
```

**2. `locations` (Nodes)**
```json
[
  {
    "id": "reception",
    "name": "Main Reception",
    "type": "poi",
    "category": "admin",
    "floor_id": "g",
    "coordinates": { "x": 50, "y": 80 }, // Percentage or pixels
    "description": "General enquiries and registration."
  },
  {
    "id": "cardio_dept",
    "name": "Cardiology Department",
    "type": "department",
    "category": "medical",
    "floor_id": "1",
    "coordinates": { "x": 30, "y": 40 },
    "phone": "+1234567890",
    "hours": "9:00 AM - 5:00 PM"
  }
]
```

### Frontend Components

1.  **`HospitalMap`**:
    -   Uses a container with `relative` positioning.
    -   Map image as background or `img`.
    -   Markers placed absolutely using `%` coordinates for responsiveness.
    -   `TransformWrapper` (from `react-zoom-pan-pinch`) for zoom/pan interaction.

2.  **`ServiceDirectory`**:
    -   List layout with search bar.
    -   Cards for each service.

3.  **`NavigationSidebar`**:
    -   Controls to switch floors.
    -   Legend for map icons.

### Backend Requirements
-   **GET /hospital/floors**: Retrieve floor metadata.
-   **GET /hospital/locations**: Retrieve all POIs and departments.
-   *Note:* For initial MVP, we can serve this data from a static JSON file or constants in the frontend if backend changes are restricted, but a database is preferred for scalability.

---

## 3. Implementation Steps

### Phase 1: Setup & Data (Day 1)
1.  **Define Types:** Create `src/types/navigation.ts`.
2.  **Mock Data:** Create `src/lib/mock-map-data.ts` with at least 2 floors and 10 locations.
3.  **Assets:** Generate or find placeholder floor plan images (SVG/PNG).

### Phase 2: Service Directory (Day 1)
1.  **Component:** Create `ServiceDirectory.tsx`.
2.  **Search Logic:** Implement fuzzy search for departments.
3.  **Page:** Create `/patient/navigation` page (or separate tab).

### Phase 3: Interactive Map (Day 2)
1.  **Library Setup:** Install `react-zoom-pan-pinch` for map interaction.
2.  **Map Component:** Build `HospitalMap.tsx` rendering basic map image.
3.  **Markers:** Implement `MapMarker.tsx` and render mostly based on coordinates.
4.  **Interactivity:** Click marker -> Open Drawer/Dialog with details.

### Phase 4: Integration & Polish (Day 2-3)
1.  **"Show on Map":** Link Directory items to Map view (auto-switch floor and center map).
2.  **Responsiveness:** Ensure map works on mobile (touch gestures).
3.  **Sidebar Update:** Add "Hospital Map" link to Sidebar.

---

## 4. Dependencies
-   `react-zoom-pan-pinch`: For seamless zooming and panning of floor plans.
-   `lucide-react`: For map icons (Stethoscope, Pizza, Pill, etc.).
-   `framer-motion`: For smooth floor switching transitions.
