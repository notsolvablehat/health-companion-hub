import { useRef, useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapMarker } from './MapMarker';
import { Floor, Location } from '@/types/navigation';

interface HospitalMapProps {
  floor: Floor;
  selectedLocationId?: string | null;
  onLocationSelect: (location: Location) => void;
}

// Map content is always 1000x1000 pixels
const MAP_SIZE = 1000;

export function HospitalMap({ floor, selectedLocationId, onLocationSelect }: HospitalMapProps) {
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 600 });

  // Track container size for centering calculations
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-center on selected location using setTransform
  useEffect(() => {
    if (selectedLocationId && transformRef.current) {
      const location = floor.locations.find(l => l.id === selectedLocationId);
      if (location) {
        // Use a small delay to ensure floor switch has rendered
        setTimeout(() => {
          if (!transformRef.current) return;
          
          const scale = 2;
          
          // Location coordinates are 0-1000, map to pixel position
          const targetX = location.coordinates.x;
          const targetY = location.coordinates.y;
          
          // To center point (targetX, targetY) in the viewport:
          // offsetX = (viewportWidth / 2) - (targetX * scale)
          // offsetY = (viewportHeight / 2) - (targetY * scale)
          const offsetX = (containerSize.width / 2) - (targetX * scale);
          const offsetY = (containerSize.height / 2) - (targetY * scale);
          
          transformRef.current.setTransform(offsetX, offsetY, scale, 500, 'easeOut');
        }, 150);
      }
    }
  }, [selectedLocationId, floor, containerSize]);

  return (
    <div 
      ref={containerRef}
      className="relative border rounded-xl overflow-hidden bg-slate-50 h-full w-full min-h-[500px]"
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.3}
        maxScale={4}
        centerOnInit
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
              <Button variant="ghost" size="icon" onClick={() => zoomIn()}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => zoomOut()}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => resetTransform()}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <TransformComponent 
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: MAP_SIZE, height: MAP_SIZE }}
            >
              <div 
                className="relative bg-white shadow-lg"
                style={{
                  width: MAP_SIZE,
                  height: MAP_SIZE,
                  backgroundImage: `url(${floor.mapImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              >
                {/* Markers - positioned using pixel values now */}
                {floor.locations.map((location) => (
                  <MapMarker 
                    key={location.id}
                    location={location} 
                    isSelected={selectedLocationId === location.id}
                    onSelect={onLocationSelect} 
                  />
                ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      
      {/* Legend / Floor Label */}
      <div className="absolute bottom-4 left-4 z-20 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm">
        <span className="font-semibold text-sm">{floor.name}</span>
      </div>
    </div>
  );
}
