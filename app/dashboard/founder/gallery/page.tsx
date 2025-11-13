"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Image as ImageIcon, Upload, Folder, Grid, List, Search } from "lucide-react";

interface Photo {
  id: number;
  filename: string;
  storage_path: string;
  thumbnail_path?: string;
  album_id?: number;
  caption?: string;
  tags?: string[];
  uploaded_at: string;
  view_count: number;
  download_count: number;
}

interface Album {
  id: number;
  name: string;
  description?: string;
  cover_photo_id?: number;
  is_featured: boolean;
  photos?: Photo[];
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"albums" | "photos">("albums");
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (view === "albums") {
      fetchAlbums();
    } else {
      fetchPhotos();
    }
  }, [view, selectedAlbum]);

  const fetchAlbums = async () => {
    try {
      const res = await fetch("/api/gallery/albums");
      const data = await res.json();
      if (data.ok) {
        setAlbums(data.albums || []);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAlbum) {
        params.append("album_id", selectedAlbum.toString());
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/gallery/photos?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Photo Gallery</h1>
          <p className="text-gsv-gray mt-1">Manage and organize photos from events</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setView("albums");
                setSelectedAlbum(null);
              }}
              className={`px-4 py-2 rounded ${view === "albums" ? "bg-white shadow" : ""}`}
            >
              Albums
            </button>
            <button
              onClick={() => setView("photos")}
              className={`px-4 py-2 rounded ${view === "photos" ? "bg-white shadow" : ""}`}
            >
              All Photos
            </button>
          </div>
          <button className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {view === "albums" ? (
        <>
          {selectedAlbum ? (
            <div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="text-gsv-green hover:text-gsv-greenDark mb-4"
              >
                ← Back to Albums
              </button>
              <PhotoGrid photos={photos} loading={loading} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12 text-gsv-gray">Loading albums...</div>
              ) : albums.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gsv-gray">No albums found</p>
                </div>
              ) : (
                albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbum(album.id)}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      {album.cover_photo_id ? (
                        <img
                          src={`/api/gallery/photos/${album.cover_photo_id}/thumbnail`}
                          alt={album.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gsv-charcoal mb-1">{album.name}</h3>
                      {album.description && (
                        <p className="text-sm text-gsv-gray line-clamp-2">{album.description}</p>
                      )}
                      {album.photos && (
                        <p className="text-xs text-gsv-gray mt-2">{album.photos.length} photos</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gsv-gray w-4 h-4" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              />
            </div>
          </div>
          <PhotoGrid photos={photos} loading={loading} />
        </>
      )}
    </div>
  );
}

function PhotoGrid({ photos, loading }: { photos: Photo[]; loading: boolean }) {
  if (loading) {
    return <div className="text-center py-12 text-gsv-gray">Loading photos...</div>;
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gsv-gray">No photos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="aspect-square bg-gray-200 relative overflow-hidden">
            <img
              src={photo.thumbnail_path || photo.storage_path}
              alt={photo.caption || photo.filename}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium">
                View
              </span>
            </div>
          </div>
          {photo.caption && (
            <div className="p-2">
              <p className="text-sm text-gsv-charcoal line-clamp-2">{photo.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

