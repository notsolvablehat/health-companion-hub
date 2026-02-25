import { HospitalData } from '@/types/navigation';

export const HOSPITAL_DATA: HospitalData = {
  hospitalName: "St. Gemini General Hospital",
  metadata: {
    totalFloors: 3,
    coordinateSystem: "cartesian-1000",
    lastUpdated: "2023-10-27T10:00:00Z"
  },
  categories: [
    { id: "dept", name: "Medical Department", icon: "stethoscope" },
    { id: "service", name: "Patient Services", icon: "info-circle" },
    { id: "amenity", name: "Amenities", icon: "coffee" },
    { id: "restroom", name: "Restroom", icon: "restroom" },
    { id: "elevator", name: "Elevator", icon: "elevator" },
    { id: "exit", name: "Exit/Entrance", icon: "door-open" }
  ],
  floors: [
    {
      id: "F1",
      name: "Ground Floor",
      level: 0,
      mapImageUrl: "/maps/ground_floor.png",
      locations: [
        {
          id: "loc-101",
          name: "Main Entrance",
          categoryId: "exit",
          coordinates: { x: 500, y: 950 },
          isNavigable: true
        },
        {
          id: "loc-102",
          name: "Emergency Room (ER)",
          categoryId: "dept",
          coordinates: { x: 800, y: 800 },
          isNavigable: true,
          details: {
            headOfDept: "Dr. Sarah Conner",
            phone: "+1-555-0199",
            openingHours: "24/7",
            services: ["Trauma", "Triage", "Ambulance Bay"]
          }
        },
        {
          id: "loc-103",
          name: "Radiology & Imaging",
          categoryId: "dept",
          coordinates: { x: 200, y: 200 },
          isNavigable: true,
          details: {
            headOfDept: "Dr. Roentgen",
            phone: "+1-555-0123",
            openingHours: "08:00 - 20:00",
            services: ["X-Ray", "MRI", "CT Scan"]
          }
        },
        {
          id: "loc-104",
          name: "Central Pharmacy",
          categoryId: "service",
          coordinates: { x: 200, y: 600 },
          isNavigable: true,
          details: {
            openingHours: "24/7"
          }
        },
        {
          id: "loc-105",
          name: "Elevator Bank A",
          categoryId: "elevator",
          coordinates: { x: 500, y: 500 },
          isNavigable: true
        },
        {
          id: "loc-106",
          name: "Restroom (Male/Female)",
          categoryId: "restroom",
          coordinates: { x: 550, y: 450 },
          isNavigable: true
        }
      ]
    },
    {
      id: "F2",
      name: "First Floor",
      level: 1,
      mapImageUrl: "/maps/first_floor.png",
      locations: [
        {
          id: "loc-201",
          name: "Cardiology",
          categoryId: "dept",
          coordinates: { x: 250, y: 300 },
          isNavigable: true,
          details: {
            headOfDept: "Dr. Strange",
            phone: "+1-555-0144",
            openingHours: "09:00 - 17:00",
            services: ["ECG", "Stress Test", "Heart Surgery"]
          }
        },
        {
          id: "loc-202",
          name: "General Surgery",
          categoryId: "dept",
          coordinates: { x: 750, y: 300 },
          isNavigable: true,
          details: {
            headOfDept: "Dr. Bailey",
            phone: "+1-555-0155",
            openingHours: "08:00 - 18:00"
          }
        },
        {
          id: "loc-203",
          name: "Elevator Bank A",
          categoryId: "elevator",
          coordinates: { x: 500, y: 500 },
          isNavigable: true
        },
        {
          id: "loc-204",
          name: "Cafeteria",
          categoryId: "amenity",
          coordinates: { x: 200, y: 800 },
          isNavigable: true,
          details: {
            openingHours: "07:00 - 21:00",
            description: "Healthy meals and coffee."
          }
        },
        {
          id: "loc-205",
          name: "Restroom (Accessible)",
          categoryId: "restroom",
          coordinates: { x: 550, y: 450 },
          isNavigable: true
        }
      ]
    },
    {
      id: "F3",
      name: "Second Floor",
      level: 2,
      mapImageUrl: "/maps/second_floor.png",
      locations: [
        {
          id: "loc-301",
          name: "Pediatrics",
          categoryId: "dept",
          coordinates: { x: 300, y: 200 },
          isNavigable: true,
          details: {
            headOfDept: "Dr. Dolittle",
            phone: "+1-555-0166",
            openingHours: "09:00 - 17:00",
            services: ["Vaccinations", "Checkups", "Neonatal Care"]
          }
        },
        {
          id: "loc-302",
          name: "Neurology",
          categoryId: "dept",
          coordinates: { x: 700, "y": 200 },
          isNavigable: true,
          details: {
            headOfDept: "Dr. Shepherd",
            phone: "+1-555-0177",
            openingHours: "09:00 - 16:00"
          }
        },
        {
          id: "loc-303",
          name: "Elevator Bank A",
          categoryId: "elevator",
          coordinates: { x: 500, y: 500 },
          isNavigable: true
        },
        {
          id: "loc-304",
          name: "Chapel / Quiet Room",
          categoryId: "amenity",
          coordinates: { x: 800, y: 800 },
          isNavigable: true,
          details: {
            openingHours: "24/7"
          }
        }
      ]
    }
  ]
};
