import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, ChevronRight, Stethoscope, Info, User, Coffee, ArrowUp, DoorOpen } from 'lucide-react';
import { HospitalData, Location } from '@/types/navigation';

interface ServiceDirectoryProps {
  data: HospitalData;
  onSelectLocation: (location: Location) => void;
  className?: string;
}

// Map category IDs to Lucide icons
const ICON_MAP: Record<string, React.ReactNode> = {
  dept: <Stethoscope className="w-4 h-4" />,
  service: <Info className="w-4 h-4" />,
  amenity: <Coffee className="w-4 h-4" />,
  restroom: <User className="w-4 h-4" />, 
  elevator: <ArrowUp className="w-4 h-4" />,
  exit: <DoorOpen className="w-4 h-4" />,
};

export function ServiceDirectory({ data, onSelectLocation, className }: ServiceDirectoryProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Flatten all locations
  const allLocations = data.floors.flatMap(floor => 
    floor.locations.map(loc => ({ ...loc, floorName: floor.name }))
  );

  const filteredLocations = allLocations.filter(loc => {
    const matchesQuery = loc.name.toLowerCase().includes(query.toLowerCase()) || 
                         loc.details?.services?.some(s => s.toLowerCase().includes(query.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || loc.categoryId === activeCategory;
    
    return matchesQuery && matchesCategory;
  });

  return (
    <div className={`flex flex-col h-full bg-background border-l ${className}`}>
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Directory</h2>
          <p className="text-xs text-muted-foreground">Find departments and services</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search e.g. Cardiology, X-Ray..." 
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button 
            variant={activeCategory === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveCategory('all')}
            className="rounded-full h-8"
          >
            All
          </Button>
          {data.categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-full h-8 whitespace-nowrap gap-2"
            >
              {ICON_MAP[cat.id]}
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No results found.
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const categoryName = data.categories.find(c => c.id === loc.categoryId)?.name;
              
              return (
                <div 
                  key={loc.id}
                  className="group flex flex-col gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onSelectLocation(loc)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {loc.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {categoryName} • {loc.floorName}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {loc.floorName}
                    </Badge>
                  </div>
                  
                  {loc.details?.openingHours && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {loc.details.openingHours}
                    </div>
                  )}

                  <div className="flex items-center text-xs text-primary font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin className="w-3 h-3 mr-1" />
                    Show on map <ChevronRight className="w-3 h-3 ml-auto" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
