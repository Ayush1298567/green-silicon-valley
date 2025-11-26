"use client";

import { useState, useEffect } from "react";
import { MapPin, ZoomIn, ZoomOut, Globe } from "lucide-react";

interface SchoolLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  presentationsCount: number;
  lastPresentation: string;
}

export default function SchoolsMap() {
  const [schools, setSchools] = useState<SchoolLocation[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolLocation | null>(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchoolLocations();
  }, []);

  const fetchSchoolLocations = async () => {
    try {
      const res = await fetch("/api/impact/schools");
      const data = await res.json();
      if (data.ok) {
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error("Error fetching school locations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample school data for demonstration
  useEffect(() => {
    if (schools.length === 0 && !loading) {
      // Sample data - in a real app, this would come from the API
      const sampleSchools: SchoolLocation[] = [
        { id: "1", name: "Lincoln High School", latitude: 37.7749, longitude: -122.4194, country: "USA", presentationsCount: 12, lastPresentation: "2024-01-15" },
        { id: "2", name: "Toronto District School", latitude: 43.6532, longitude: -79.3832, country: "Canada", presentationsCount: 8, lastPresentation: "2024-01-20" },
        { id: "3", name: "London Academy", latitude: 51.5074, longitude: -0.1278, country: "UK", presentationsCount: 15, lastPresentation: "2024-01-10" },
        { id: "4", name: "Berlin Technical School", latitude: 52.5200, longitude: 13.4050, country: "Germany", presentationsCount: 6, lastPresentation: "2024-01-25" },
        { id: "5", name: "Tokyo International School", latitude: 35.6762, longitude: 139.6503, country: "Japan", presentationsCount: 9, lastPresentation: "2024-01-18" },
        { id: "6", name: "Sydney Grammar School", latitude: -33.8688, longitude: 151.2093, country: "Australia", presentationsCount: 11, lastPresentation: "2024-01-22" }
      ];
      setSchools(sampleSchools);
    }
  }, [schools, loading]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading school locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.2))}
          className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
          className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* Map Container */}
      <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative overflow-hidden border border-gray-200">
        {/* World Map Background (Simplified SVG) */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          {/* Simplified world map outline */}
          <path
            d="M200,150 Q250,120 300,140 T400,130 Q450,150 500,140 T600,150 Q650,160 700,150 T800,160 Q850,170 900,160 L900,350 Q850,360 800,350 T700,360 Q650,350 600,360 T500,350 Q450,360 400,350 T300,360 Q250,350 200,360 Z"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="1"
          />

          {/* Country borders (simplified) */}
          <path d="M300,200 L350,180 L400,200 L380,220 Z" fill="none" stroke="#6b7280" strokeWidth="0.5" />
          <path d="M500,180 L550,170 L600,180 L580,200 Z" fill="none" stroke="#6b7280" strokeWidth="0.5" />
          <path d="M650,190 L700,180 L750,190 L730,210 Z" fill="none" stroke="#6b7280" strokeWidth="0.5" />

          {/* School markers */}
          {schools.map((school) => {
            // Convert lat/lng to SVG coordinates (simplified)
            const x = ((school.longitude + 180) / 360) * 1000;
            const y = ((90 - school.latitude) / 180) * 500;

            return (
              <g key={school.id}>
                {/* Marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(4, school.presentationsCount / 2)}
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-blue-500 transition-colors"
                  onClick={() => setSelectedSchool(school)}
                />

                {/* Pulse effect for schools with recent presentations */}
                {new Date(school.lastPresentation) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={Math.max(6, school.presentationsCount / 2 + 4)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow">
          <div className="text-sm font-medium text-gray-900 mb-2">Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>School location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              <span>Recent activity (30 days)</span>
            </div>
            <div className="text-gray-500">Circle size = # of presentations</div>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow">
          <div className="text-sm font-medium text-gray-900">
            {schools.length} Schools Reached
          </div>
          <div className="text-xs text-gray-600">
            Across {new Set(schools.map(s => s.country)).size} countries
          </div>
        </div>
      </div>

      {/* Selected School Details */}
      {selectedSchool && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-blue-900">{selectedSchool.name}</h4>
              <div className="flex items-center gap-4 text-sm text-blue-700 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {selectedSchool.country}
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={12} />
                  {selectedSchool.presentationsCount} presentations
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Last presentation: {new Date(selectedSchool.lastPresentation).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => setSelectedSchool(null)}
              className="text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">{schools.length}</div>
          <div className="text-xs text-gray-600">Total Schools</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {new Set(schools.map(s => s.country)).size}
          </div>
          <div className="text-xs text-gray-600">Countries</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {schools.reduce((sum, s) => sum + s.presentationsCount, 0)}
          </div>
          <div className="text-xs text-gray-600">Presentations</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {schools.filter(s =>
              new Date(s.lastPresentation) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length}
          </div>
          <div className="text-xs text-gray-600">Active (30 days)</div>
        </div>
      </div>
    </div>
  );
}
