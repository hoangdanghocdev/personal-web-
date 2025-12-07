
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { 
  Search, MapPin, Loader2, Navigation, ArrowLeft, 
  Menu, Star, Share2, Info, Layers, Plus, Minus, ChevronDown,
  Utensils, X
} from 'lucide-react';

// --- CONFIG & STYLES ---

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

// Custom "Google Maps Style" Pin using DivIcon for CSS styling
const createCustomIcon = (isActive: boolean) => {
    return L.divIcon({
        className: 'custom-map-marker',
        html: `
            <div class="relative w-full h-full group">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    ${isActive ? 'w-8 h-8 bg-red-600 z-50' : 'w-5 h-5 bg-red-500 z-10'} 
                    rounded-full border-2 border-white shadow-md transition-all duration-300 ease-out flex items-center justify-center">
                    ${isActive ? '<div class="w-2 h-2 bg-white rounded-full"></div>' : ''}
                </div>
                ${isActive ? '<div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600 -mt-1"></div>' : ''}
            </div>
        `,
        iconSize: isActive ? [40, 40] : [30, 30],
        iconAnchor: isActive ? [20, 36] : [15, 15],
    });
};

interface LeafletLocationPickerProps {
  value: string;
  onChange: (address: string) => void;
  defaultPosition?: { lat: number; lng: number };
}

// --- DATA ENRICHMENT ---
const enrichPlaceData = (place: any) => {
    const seed = parseInt(place.place_id, 10) || Math.random() * 10000;
    const rand = (mod: number) => (seed % mod);
    const rating = (3.5 + (rand(15) / 10)).toFixed(1);
    const reviews = 50 + rand(900);
    const price = ['$', '$$', '$$$', '$$'][rand(4)];
    const isOpen = rand(10) > 2;
    const imgId = rand(70) + 10; 
    let category = place.type.replace('_', ' ');
    category = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        ...place,
        rich: {
            rating,
            reviews,
            price,
            isOpen,
            category,
            amenities: rand(2) === 0 ? "Dine-in • Takeaway" : "In-store shopping",
            closes: `${8 + rand(4)}:00 PM`,
            image: `https://picsum.photos/id/${imgId}/200/200`
        }
    };
};

// --- SUB-COMPONENTS ---

// 1. Map Effect Controller: Handles "Search & Plot" Auto-Zoom Logic
const MapEffect = ({ 
    results, 
    selectedId, 
    mapCenter 
}: { 
    results: any[], 
    selectedId: string | null,
    mapCenter: { lat: number, lng: number } | null 
}) => {
    const map = useMap();

    // A. Auto Fit Bounds when Search Results change
    useEffect(() => {
        if (results.length > 0 && !selectedId) {
            const bounds = L.latLngBounds(results.map(r => [parseFloat(r.lat), parseFloat(r.lon)]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [results, map]);

    // B. Fly To when a specific place is selected or Dragged
    useEffect(() => {
        if (mapCenter) {
             map.flyTo(mapCenter, 16, { animate: true, duration: 1.0 });
        }
    }, [mapCenter, map]);

    // C. Fix Grey Tiles on Load
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 300);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
};

// 2. Interactive Marker
const SearchResultMarker = ({ 
    place, 
    isSelected, 
    isHovered, 
    onClick 
}: { 
    place: any, 
    isSelected: boolean, 
    isHovered: boolean, 
    onClick: (p: any) => void 
}) => {
    const position = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    
    // Z-Index boost for active items
    const zIndexOffset = isSelected || isHovered ? 1000 : 0;
    
    return (
        <Marker 
            position={position} 
            icon={createCustomIcon(isSelected || isHovered)}
            zIndexOffset={zIndexOffset}
            eventHandlers={{
                click: () => onClick(place),
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup()
            }}
        />
    );
};

// 3. Draggable "Selected" Pin (For manual refinement)
const DraggablePin = ({ position, onDragEnd }: { position: {lat: number, lng: number}, onDragEnd: (lat: number, lng: number) => void }) => {
    const markerRef = useRef<L.Marker>(null);
    const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }), [onDragEnd]);

    // Only show if we have a specific position and NO generic search results active
    // OR if this pin denotes the "Selected" location.
    // For this specific UX, we use the SearchResultMarker for list items, 
    // and this pin only if the user manually drags or locates me.
    
    return (
        <Marker 
            draggable={true} 
            eventHandlers={eventHandlers} 
            position={position} 
            ref={markerRef}
            icon={createCustomIcon(true)} // Always active style
            zIndexOffset={2000}
        />
    );
};


// --- MAIN COMPONENT ---

const LeafletLocationPicker: React.FC<LeafletLocationPickerProps> = ({ 
  value, 
  onChange, 
  defaultPosition = { lat: 21.0285, lng: 105.8542 } 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Map State
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  
  // Search Data State
  const [query, setQuery] = useState(''); 
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Interaction State
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState(value || ''); 
  
  // Refs for scrolling
  const sidebarRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Sync prop value
  useEffect(() => { if (value) setSelectedAddress(value); }, [value]);

  // --- ACTIONS ---

  const handleSearch = async () => {
      if (!query || query.length < 2) return;
      setIsSearching(true);
      setResults([]); 
      setSelectedId(null); // Clear selection on new search
      
      try {
        const res = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
            params: { q: query, format: 'json', addressdetails: 1, limit: 15, countrycodes: 'vn' }
        });
        const enriched = res.data.map(enrichPlaceData);
        setResults(enriched);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
  };

  const selectPlace = (place: any) => {
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);
      
      setMapCenter({ lat, lng });
      setSelectedId(place.place_id);
      setSelectedAddress(place.display_name);
      
      // Scroll sidebar to item
      const el = sidebarRefs.current[place.place_id];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDragEnd = async (lat: number, lng: number) => {
      setMapCenter({ lat, lng });
      setSelectedId('manual_pin'); // Special ID for manual drag
      try {
          const res = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
              params: { lat, lon: lng, format: 'json' }
          });
          if (res.data?.display_name) setSelectedAddress(res.data.display_name);
      } catch (e) { console.error(e); }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter({ lat: latitude, lng: longitude });
        handleDragEnd(latitude, longitude); // Update address too
        // Clear search results to focus on user
        setResults([]);
      });
    }
  };

  const handleConfirm = () => {
    onChange(selectedAddress);
    setIsOpen(false);
  };

  // --- MODAL RENDER ---
  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col md:flex-row font-sans text-slate-700 animate-fade-in">
        
        {/* === SIDEBAR === */}
        <div className="w-full md:w-[400px] flex flex-col bg-white h-2/5 md:h-full shadow-2xl relative z-20 shrink-0 border-r border-gray-200">
            
            {/* Header */}
            <div className="pt-4 px-4 pb-2 shrink-0">
                <div className="flex items-center gap-2 mb-3">
                     <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft size={20}/>
                     </button>
                     <h1 className="font-bold text-lg text-slate-800">Select Location</h1>
                </div>

                <div className="relative group shadow-sm hover:shadow-md transition-shadow rounded-3xl border border-gray-300 bg-white flex items-center p-1 pr-4">
                    <button className="p-2.5 ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors" onClick={handleSearch}>
                        <Search size={20} />
                    </button>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Search Google Maps" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 py-2.5 px-2 outline-none font-medium text-slate-700 placeholder:text-slate-400 text-base"
                    />
                    {isSearching && <Loader2 size={20} className="animate-spin text-blue-600 ml-2"/>}
                    {query && <button onClick={() => {setQuery(''); setResults([])}} className="ml-2 text-slate-400 hover:text-slate-600"><X size={20}/></button>}
                </div>
            </div>

            {/* List Header */}
            <div className="px-5 py-3 flex items-center justify-between shrink-0">
                 <h2 className="font-bold text-base text-slate-800">
                    {results.length > 0 ? `Results (${results.length})` : 'Recent'}
                 </h2>
                 <div className="flex gap-2">
                     <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full"><Share2 size={18}/></button>
                     <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full"><Info size={18}/></button>
                 </div>
            </div>

            {/* Result List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-2 space-y-1">
                {results.length > 0 ? (
                    results.map((place) => {
                        const isSelected = selectedId === place.place_id;
                        const isHovered = hoveredId === place.place_id;

                        return (
                            <div 
                                key={place.place_id} 
                                ref={(el) => { sidebarRefs.current[place.place_id] = el; }}
                                onClick={() => selectPlace(place)}
                                onMouseEnter={() => setHoveredId(place.place_id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className={`
                                    flex gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
                                    ${isSelected ? 'bg-blue-50 border-blue-100 shadow-sm' : 'hover:bg-slate-50'}
                                    ${isHovered && !isSelected ? 'bg-slate-50' : ''}
                                `}
                            >
                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                    <h3 className={`font-bold text-[15px] truncate leading-tight ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                                        {place.display_name.split(',')[0]}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-slate-800">{place.rich.rating}</span>
                                        <div className="flex text-yellow-400 gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < Math.round(place.rich.rating) ? "currentColor" : "#e2e8f0"} strokeWidth={0} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-500">({place.rich.reviews})</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{place.rich.category} • {place.rich.price}</p>
                                    <div className="text-xs flex items-center gap-1">
                                        {place.rich.isOpen ? <span className="text-green-700 font-bold">Open</span> : <span className="text-red-700 font-bold">Closed</span>}
                                        <span className="text-slate-500">⋅ Closes {place.rich.closes}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                        <Utensils size={10} /> {place.rich.amenities}
                                    </div>
                                </div>
                                <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-slate-100">
                                    <img src={place.rich.image} alt="thumb" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Map')}/>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-4">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2 shadow-inner">
                            <MapPin size={32} className="text-slate-300"/>
                         </div>
                         <p className="text-sm font-medium">Search to see results on map</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] shrink-0">
                <div className="flex items-start gap-3 mb-4">
                    <div className="mt-1 text-red-600"><MapPin size={24} fill="currentColor" strokeWidth={1} /></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-0.5">Selected Location</p>
                        <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                            {selectedAddress || 'No location selected'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleConfirm}
                    disabled={!selectedAddress}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                >
                    Confirm Location
                </button>
            </div>
        </div>

        {/* === MAP AREA === */}
        <div className="flex-1 relative h-3/5 md:h-full bg-slate-100 z-10">
            <MapContainer center={mapCenter} zoom={13} className="w-full h-full outline-none" zoomControl={false}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Logic Controller */}
                <MapEffect 
                    results={results} 
                    selectedId={selectedId} 
                    mapCenter={selectedId ? mapCenter : null} // Only FlyTo if a specific item is selected
                />

                {/* A. Render Search Results Markers */}
                {results.map((place) => (
                    <SearchResultMarker 
                        key={place.place_id} 
                        place={place} 
                        isSelected={selectedId === place.place_id}
                        isHovered={hoveredId === place.place_id}
                        onClick={selectPlace}
                    />
                ))}

                {/* B. Render Manual Pin (If dragged or no search results) */}
                {(!results.length || selectedId === 'manual_pin') && (
                     <DraggablePin position={mapCenter} onDragEnd={handleDragEnd} />
                )}

            </MapContainer>

            {/* Overlays */}
            <div className="absolute top-3 left-3 z-[1000] flex gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar pl-1">
                {['Price', 'Rating', 'Hours', 'All filters'].map((filter, idx) => (
                    <button key={filter} className={`px-4 py-1.5 rounded-full shadow-sm border border-gray-300 text-xs font-bold flex items-center gap-1 whitespace-nowrap bg-white text-slate-700 hover:bg-slate-50`}>
                        {filter} <ChevronDown size={14} className="text-slate-400"/>
                    </button>
                ))}
            </div>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
                 <button onClick={handleSearch} className="bg-white px-5 py-2.5 rounded-full shadow-md text-sm font-bold text-blue-600 hover:bg-slate-50 transition-transform active:scale-95 flex items-center gap-2">
                    <Search size={14} strokeWidth={3} /> Search this area
                 </button>
            </div>

            <div className="absolute bottom-6 left-3 z-[1000]">
                 <button className="w-14 h-14 bg-white rounded-lg shadow-md border-2 border-white overflow-hidden relative group hover:border-blue-500 transition-colors">
                     <img src="https://mt1.google.com/vt/lyrs=s&x=0&y=0&z=0" className="w-full h-full object-cover" alt="sat"/>
                     <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent">
                         <Layers className="text-white drop-shadow-md" size={20}/>
                     </div>
                 </button>
            </div>

            <div className="absolute bottom-8 right-4 z-[1000] flex flex-col gap-3">
                <button onClick={handleLocateMe} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
                    <Navigation size={22}/>
                </button>
                <div className="bg-white rounded-lg shadow-md flex flex-col">
                    <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-black border-b border-gray-100"><Plus size={24}/></button>
                    <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-black"><Minus size={24}/></button>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="group cursor-pointer w-full p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-brand-400 hover:shadow-md transition-all active:scale-[0.99]">
        <div className="p-2 bg-brand-50 text-brand-600 rounded-lg group-hover:bg-brand-100 transition-colors">
            <MapPin size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
            <p className={`text-sm truncate font-medium ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                {value || 'Tap to select location on map...'}
            </p>
        </div>
        <div className="bg-slate-100 p-1.5 rounded-md text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500"><MapPin size={16} /></div>
      </div>
      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
};

export default LeafletLocationPicker;
