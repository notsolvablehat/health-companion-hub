export interface HospitalData {
  hospitalName: string;
  metadata: {
    totalFloors: number;
    coordinateSystem: string;
    lastUpdated: string;
  };
  categories: Category[];
  floors: Floor[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  mapImageUrl: string;
  locations: Location[];
}

export interface Location {
  id: string;
  name: string;
  categoryId: string;
  coordinates: {
    x: number;
    y: number;
  };
  isNavigable: boolean;
  details?: LocationDetails;
}

export interface LocationDetails {
  headOfDept?: string;
  phone?: string;
  openingHours?: string;
  services?: string[];
  description?: string;
}
