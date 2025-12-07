import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2, Search } from 'lucide-react';

interface LocationPickerProps {
  value: string;
  onChange: (address: string) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderControlRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  // Default: Hanoi Coordinates (fallback)
  const DEFAULT_LAT = 21.0285;
  const DEFAULT_LNG = 105.8542;

  // --- 1. CORE FUNCTION: Update Marker & Fetch Address ---
  const updateLocation = async (lat: number, lng: number, shouldFlyTo: boolean = false) => {
    if (!leafletMap.current || !markerRef.current) return;

    // Visual Update
    const newLatLng = new (window as any).L.LatLng(lat, lng);
    markerRef.current.setLatLng(newLatLng);
    
    if (shouldFlyTo) {
      leafletMap.current.flyTo(newLatLng, 16); // Close Zoom for precision
    }

    setCoords({ lat, lng });
    setIsLoading(true);

    try {
      // Nominatim Reverse Geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        onChange(data.display_name);
      } else {
        onChange(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      onChange(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. INITIALIZE MAP & PLUGINS ---
  useEffect(() => {
    // @ts-ignore
    if (typeof window.L === 'undefined' || !mapRef.current) return;
    if (leafletMap.current) return; // Initialize once

    // @ts-ignore
    const L = window.L;

    // A. Create Map
    const map = L.map(mapRef.current).setView([DEFAULT_LAT, DEFAULT_LNG], 13);
    leafletMap.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // B. Custom Marker
    const icon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563eb;"></div>
             </div>`,
      iconSize: [24, 30],
      iconAnchor: [12, 30] // Tip of the pin
    });

    const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
      draggable: true,
      icon: icon
    }).addTo(map);
    markerRef.current = marker;

    // C. Add Geocoder (Search Box)
    // @ts-ignore
    if (L.Control.Geocoder) {
        const geocoder = L.Control.Geocoder.nominatim();
        const control = L.Control.geocoder({
            geocoder: geocoder,
            defaultMarkGeocode: false, // We handle the result manually
            placeholder: 'Search street, city...',
            collapsed: false,
            position: 'topright'
        })
        .on('markgeocode', function(e: any) {
            const { lat, lng } = e.geocode.center;
            // Update app state when search result is clicked
            updateLocation(lat, lng, true);
        })
        .addTo(map);
        geocoderControlRef.current = control;
    }

    // D. Event Listeners
    // Drag End
    marker.on('dragend', function(event: any) {
      const position = event.target.getLatLng();
      updateLocation(position.lat, position.lng, false); // Don't zoom on drag
    });

    // Map Click
    map.on('click', function(e: any) {
      updateLocation(e.latlng.lat, e.latlng.lng, false); // Don't zoom on click, just move pin
    });

    // E. Auto Geolocation (GPS) on Load
    triggerUserLocation();

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // --- 3. GEOLOCATION HANDLER ---
  const triggerUserLocation = () => {
    if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            updateLocation(latitude, longitude, true); // Zoom to user
        },
        (error) => {
            console.error("GPS Error:", error);
            setIsLoading(false);
            // Fallback is already handled by default initialization
        },
        { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-3 animate-fade-in">
        {/* Map Display */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 shadow-sm group z-0">
            <div 
                ref={mapRef} 
                id="map" 
                className="w-full h-full z-0"
            ></div>
            
            {/* Custom GPS Button (Leaflet controls can be small on mobile) */}
            <button
                type="button"
                onClick={triggerUserLocation}
                className="absolute bottom-4 right-4 z-[400] bg-white p-2 rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                title="Locate Me"
            >
                <Navigation size={20} fill={coords ? "#2563eb" : "none"} className={isLoading && !value ? "animate-pulse" : ""}/>
            </button>

            {/* Overlay Instruction */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-600 shadow-sm border border-white/50 pointer-events-none">
                {coords ? (
                   <span className="font-mono">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
                ) : (
                   <span>📍 Search or drag pin</span>
                )}
            </div>
        </div>

        {/* Input Display Field (Result) */}
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                {isLoading ? <Loader2 size={18} className="animate-spin text-brand-600" /> : <MapPin size={18} />}
            </div>
            <input 
                required 
                placeholder="Selected address will appear here..." 
                value={value} 
                onChange={handleManualInput} 
                className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all ${isLoading ? 'bg-gray-50 text-gray-400' : 'bg-white border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'}`} 
            />
        </div>
        
        <style>{`
            /* Leaflet Geocoder Customization to match Tailwind */
            .leaflet-control-geocoder {
                border-radius: 0.75rem !important; /* rounded-xl */
                border: 1px solid #e2e8f0 !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                overflow: hidden;
            }
            .leaflet-control-geocoder-form input {
                padding: 8px 12px !important;
                font-size: 14px !important;
                outline: none !important;
            }
            .leaflet-control-geocoder-icon {
                width: 36px !important;
                height: 36px !important;
                border-radius: 0.75rem !important;
            }
        `}</style>
    </div>
  );
};

export default LocationPicker;