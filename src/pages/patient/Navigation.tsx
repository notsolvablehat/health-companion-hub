import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, Map as MapIcon, Menu } from 'lucide-react';
import { HospitalMap } from '@/components/navigation/HospitalMap';
import { ServiceDirectory } from '@/components/navigation/ServiceDirectory';
import { HOSPITAL_DATA } from '@/lib/hospital-data';
import { Location } from '@/types/navigation';
import { cn } from '@/lib/utils';

export default function PatientNavigation() {
  const [activeFloorId, setActiveFloorId] = useState(HOSPITAL_DATA.floors[0].id);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false); // For mobile

  const activeFloor = HOSPITAL_DATA.floors.find(f => f.id === activeFloorId) || HOSPITAL_DATA.floors[0];

  const handleLocationSelect = (location: Location) => {
    // 1. Switch to correct floor
    const floor = HOSPITAL_DATA.floors.find(f => f.locations.some(l => l.id === location.id));
    if (floor && floor.id !== activeFloorId) {
      setActiveFloorId(floor.id);
    }

    // 2. Highlight location
    setSelectedLocationId(location.id);
    
    // 3. Close directory on mobile
    setIsDirectoryOpen(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-0 md:gap-4 p-0 md:p-6 overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header / Floor Switcher */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <div className="bg-background/80 backdrop-blur rounded-lg border shadow-sm p-1">
             <Tabs value={activeFloorId} onValueChange={setActiveFloorId} className="w-auto">
              <TabsList className="h-9">
                {HOSPITAL_DATA.floors.map(floor => (
                  <TabsTrigger key={floor.id} value={floor.id} className="text-xs px-3">
                    {floor.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Mobile Directory Toggle */}
        <div className="absolute top-4 right-4 z-10 md:hidden">
          <Sheet open={isDirectoryOpen} onOpenChange={setIsDirectoryOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="secondary" className="shadow-md">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl">
               <ServiceDirectory 
                  data={HOSPITAL_DATA} 
                  onSelectLocation={handleLocationSelect}
                  className="rounded-t-xl"
                />
            </SheetContent>
          </Sheet>
        </div>

        {/* Map Component */}
        <div className="flex-1 w-full h-full bg-slate-100 md:rounded-xl overflow-hidden border">
           <HospitalMap 
              floor={activeFloor} 
              selectedLocationId={selectedLocationId}
              onLocationSelect={handleLocationSelect}
            />
        </div>
      </div>

      {/* Desktop Directory Sidebar */}
      <div className="hidden md:block w-96 h-full border rounded-xl overflow-hidden shadow-sm">
        <ServiceDirectory 
          data={HOSPITAL_DATA} 
          onSelectLocation={handleLocationSelect}
        />
      </div>
    </div>
  );
}
