"use client";
import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";

interface SchoolLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  presentations: number;
  city: string;
  state: string;
}

interface InteractiveImpactMapProps {
  schoolLocations: SchoolLocation[];
}

export default function InteractiveImpactMap({ schoolLocations }: InteractiveImpactMapProps) {
  const [selectedSchool, setSelectedSchool] = useState<SchoolLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSchools, setFilteredSchools] = useState<SchoolLocation[]>(schoolLocations);

  useEffect(() => {
    if (searchTerm) {
      setFilteredSchools(
        schoolLocations.filter(s =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.city.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredSchools(schoolLocations);
    }
  }, [searchTerm, schoolLocations]);

  // Calculate bounds for the map
  const bounds = schoolLocations.reduce(
    (acc, loc) => {
      return {
        minLat: Math.min(acc.minLat, loc.lat),
        maxLat: Math.max(acc.maxLat, loc.lat),
        minLng: Math.min(acc.minLng, loc.lng),
        maxLng: Math.max(acc.maxLng, loc.lng),
      };
    },
    { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
  );

  // Simple map visualization (in production, use Google Maps or Mapbox)
  const mapWidth = 800;
  const mapHeight = 600;
  const padding = 50;

  const getMarkerPosition = (lat: number, lng: number) => {
    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (mapWidth - 2 * padding);
    const y = mapHeight - padding - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (mapHeight - 2 * padding);
    return { x, y };
  };

  const getMarkerSize = (presentations: number) => {
    if (presentations > 10) return 20;
    if (presentations > 5) return 15;
    return 10;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gsv-gray w-5 h-5" />
        <input
          type="text"
          placeholder="Search schools by name or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <div className="lg:col-span-2 card p-4">
          <div className="relative w-full" style={{ paddingBottom: `${(mapHeight / mapWidth) * 100}%` }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              style={{ background: "linear-gradient(180deg, #e0f2f1 0%, #b2dfdb 100%)" }}
            >
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

              {/* School markers */}
              {filteredSchools.map((school) => {
                const pos = getMarkerPosition(school.lat, school.lng);
                const size = getMarkerSize(school.presentations);
                const isSelected = selectedSchool?.id === school.id;

                return (
                  <g
                    key={school.id}
                    onClick={() => setSelectedSchool(school)}
                    style={{ cursor: "pointer" }}
                    className="transition-all hover:opacity-80"
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size}
                      fill={isSelected ? "#10b981" : "#059669"}
                      stroke="white"
                      strokeWidth="2"
                      opacity={isSelected ? 1 : 0.8}
                    />
                    {school.presentations > 5 && (
                      <text
                        x={pos.x}
                        y={pos.y + 4}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {school.presentations}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gsv-gray">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gsv-green rounded-full"></div>
              <span>1-5 presentations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gsv-green rounded-full"></div>
              <span>6-10 presentations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gsv-green rounded-full"></div>
              <span>10+ presentations</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gsv-gray italic">
            Note: This is a simplified visualization. Production version would use Google Maps or Mapbox for accurate geographic representation.
          </p>
        </div>

        {/* School List & Details */}
        <div className="space-y-4">
          {selectedSchool ? (
            <div className="card p-6">
              <button
                onClick={() => setSelectedSchool(null)}
                className="text-sm text-gsv-green hover:underline mb-3"
              >
                ← Back to list
              </button>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-6 h-6 text-gsv-green flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">{selectedSchool.name}</h3>
                  <p className="text-sm text-gsv-gray">
                    {selectedSchool.city}, {selectedSchool.state}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gsv-gray">Total Presentations:</span>
                  <span className="font-semibold">{selectedSchool.presentations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gsv-gray">Location:</span>
                  <span className="font-semibold">
                    {selectedSchool.lat.toFixed(4)}, {selectedSchool.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-4">
              <h3 className="font-semibold mb-3">School List ({filteredSchools.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => setSelectedSchool(school)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="font-medium text-sm">{school.name}</div>
                    <div className="text-xs text-gsv-gray">
                      {school.city} • {school.presentations} presentations
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

