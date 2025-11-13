"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type School = { id: number; name: string | null; lat?: number | null; lng?: number | null };
type Chapter = { id: number; name: string | null; region?: string | null; lat?: number | null; lng?: number | null };

export default function ImpactMap() {
  const [schools, setSchools] = useState<School[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [region, setRegion] = useState<string>("all");
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from("schools").select("id, name, lat, lng");
      const { data: c } = await supabase.from("chapters").select("id, name, region, lat, lng");
      setSchools((s ?? []));
      setChapters((c ?? []));
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3 flex gap-2 items-center">
        <label className="text-sm text-gsv-gray">Region</label>
        <select className="border rounded px-2 py-1 text-sm" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">All</option>
          {[...new Set(chapters.map((c) => c.region).filter(Boolean))].map((r) => (
            <option key={String(r)} value={String(r)}>{String(r)}</option>
          ))}
        </select>
      </div>
      <div className="h-96 w-full rounded-xl overflow-hidden border border-gray-100">
      <MapContainer center={[37.36, -121.95]} zoom={9} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {schools.filter((s) => !isNaN(Number(s.lat)) && !isNaN(Number(s.lng))).map((s) => (
          <Marker key={`s-${s.id}`} position={[s.lat as number, s.lng as number]}>
            <Popup>
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-gsv-gray">School visited</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {chapters
          .filter((c) => (region === "all" || c.region === region) && !isNaN(Number(c.lat)) && !isNaN(Number(c.lng)))
          .map((c) => (
          <Marker key={`c-${c.id}`} position={[c.lat as number, c.lng as number]}>
            <Popup>
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gsv-gray">Active Chapter</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      </div>
    </div>
  );
}


