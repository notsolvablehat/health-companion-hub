# Hospital Navigation & Service Directory - Implementation Plan

## Objective
To implement an interactive Digital Hospital Map and Service Directory to guide patients within the hospital. This feature will allow users to view floor plans, locate departments, finds amenities, and search for services.

## 1. Chosen Data Model (St. Gemini General Hospital)
We have selected the **St. Gemini General Hospital** data model for its hierarchical structure (`Hospital -> Floors -> Locations`) which aligns perfectly with a map interface.

### Schema Structure
```typescript
interface HospitalData {
  hospitalName: string;
  metadata: {
    totalFloors: number;
    coordinateSystem: string; // e.g., "cartesian-1000" (0-1000 scale)
    lastUpdated: string;
  };
  categories: Category[]; // Definitions for icons/legend
  floors: Floor[];
}

interface Category {
  id: string; // e.g., "dept", "restroom"
  name: string;
  icon: string; // Lucide icon name
}

interface Floor {
  id: string; // "F1"
  name: string; // "Ground Floor"
  level: number; // 0
  mapImageUrl: string; // URL to SVG/Image
  locations: Location[];
}

interface Location {
  id: string;
  name: string;
  categoryId: string; // FK to Category
  coordinates: { x: number; y: number }; // 0-1000
  isNavigable: boolean;
  details?: {
    headOfDept?: string;
    phone?: string;
    openingHours?: string;
    services?: string[];
    description?: string;
  };
}
```

---

## 2. Core Features

### A. Hospital Map
- **Floor Switcher**: Tabs/Dropdown to switch between floors.
- **Interactive Map**: Zoomable/Pannable canvas (using `react-zoom-pan-pinch`).
- **Markers**: Icons plotted on the map based on coordinates.
- **Location Details**: Clicking a marker opens a sheet/dialog with info (phone, hours, etc.).

### B. Service Directory
- **Searchable List**: Filter locations by name or category.
- **Quick Navigation**: "Show on Map" button jumps to the floor and centers the location.

---

## 3. Implementation Steps

### Phase 1: Setup & Data (Current)
1.  **Define Types**: Create `src/types/navigation.ts` with the schema above.
2.  **Asset Generation**: Create placeholder SVG maps for 3 floors.
3.  **Data File**: Create `src/lib/hospital-data.ts` exporting the selected JSON data.

### Phase 2: Core Components
1.  **`HospitalMap` Component**:
    -   Implement `TransformWrapper` and `TransformComponent`.
    -   Render the active floor's image.
    -   Render `MapMarker` components absolutely positioned on top.
2.  **`MapMarker` Component**:
    -   Render icon based on category.
    -   Handle click events.
3.  **`FloorSwitcher` Component**:
    -   Simple tab interface to change active floor state.

### Phase 3: Service Directory & Integration
1.  **`ServiceDirectory` Component**:
    -   List view with search/filter.
    -   Link to map view (pass `floorId` and `locationId` via state/props).
2.  **Page Layout**:
    -   Create `/patient/navigation`.
    -   Split view: Map on Left (or Top on mobile), Directory on Right (or Bottom sheet).

### Phase 4: Refinement
1.  **Responsiveness**: Ensure touch gestures work for zoom/pan.
2.  **category Legend**: Show what icons mean.

---

## 4. Dependencies
-   `react-zoom-pan-pinch`: For map interactions.
-   `lucide-react`: For icons.
-   `framer-motion`: For transitions (optional).
