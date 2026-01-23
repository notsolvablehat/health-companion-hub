import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Heart, 
  Stethoscope, 
  Info, 
  Coffee, 
  DoorOpen, 
  ArrowUp,
  MapPin, 
  Clock,
  Phone,
  User,
  Baby
} from 'lucide-react';
import { Location } from '@/types/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MapMarkerProps {
  location: Location;
  isSelected?: boolean;
  onSelect: (location: Location) => void;
}

// Map category IDs to Lucide icons
const ICON_MAP: Record<string, React.ReactNode> = {
  dept: <Stethoscope className="w-5 h-5" />,
  service: <Info className="w-5 h-5" />,
  amenity: <Coffee className="w-5 h-5" />,
  restroom: <User className="w-5 h-5" />, // Placeholder
  elevator: <ArrowUp className="w-5 h-5" />,
  exit: <DoorOpen className="w-5 h-5" />,
};

// Map specific IDs to specific icons (overrides)
const SPECIAL_ICONS: Record<string, React.ReactNode> = {
  'loc-201': <Heart className="w-5 h-5 text-rose-500" />, // Cardiology
  'loc-301': <Baby className="w-5 h-5 text-sky-500" />, // Pediatrics
};

export function MapMarker({ location, isSelected, onSelect }: MapMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    if (SPECIAL_ICONS[location.id]) return SPECIAL_ICONS[location.id];
    return ICON_MAP[location.categoryId] || <MapPin className="w-5 h-5" />;
  };

  const getColorClass = () => {
    switch(location.categoryId) {
      case 'dept': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300';
      case 'service': return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300';
      case 'amenity': return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300';
      case 'exit': return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300';
      case 'elevator': return 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300';
    }
  };

  // Convert 0-1000 coordinates to percentages
  const style = {
    left: `${(location.coordinates.x / 1000) * 100}%`,
    top: `${(location.coordinates.y / 1000) * 100}%`,
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
          style={style}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(location);
            setIsOpen(true);
          }}
        >
          {/* Marker Pin */}
          <div className={cn(
            "relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-sm transition-all duration-200",
            getColorClass(),
            isSelected ? "scale-125 ring-4 ring-primary/20 bg-background z-20" : "scale-100 group-hover:scale-110"
          )}>
            {getIcon()}
            
            {/* Label (Tooltip) */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border font-medium z-30">
              {location.name}
            </div>
          </div>
        </div>
      </SheetTrigger>
      
      {/* Location Details Sheet */}
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
            getColorClass()
          )}>
            {getIcon()}
          </div>
          <SheetTitle className="text-2xl">{location.name}</SheetTitle>
          <SheetDescription>
            {location.details?.description || 'No description available.'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Services */}
          {location.details?.services && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">SERVICES</h4>
              <div className="flex flex-wrap gap-2">
                {location.details.services.map((service) => (
                  <span key={service} className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-4 border-t pt-6">
            <h4 className="text-sm font-medium text-muted-foreground">CONTACT & HOURS</h4>
            
            {location.details?.headOfDept && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{location.details.headOfDept}</p>
                  <p className="text-xs text-muted-foreground">Head of Department</p>
                </div>
              </div>
            )}

            {location.details?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <a href={`tel:${location.details.phone}`} className="text-sm text-blue-600 hover:underline">
                  {location.details.phone}
                </a>
              </div>
            )}

            {location.details?.openingHours && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-foreground">{location.details.openingHours}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
