"use client";

import { useState, useEffect } from "react";
import { Plus, X, Image as ImageIcon, Loader2, Grid3x3 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ImageUploader from "./ImageUploader";

interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

interface GalleryManagerProps {
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
  maxImages?: number;
}

export default function GalleryManager({
  images,
  onImagesChange,
  maxImages = 20
}: GalleryManagerProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  const handleAddImage = async (url: string) => {
    if (!url) return;
    
    const newImage: GalleryImage = {
      id: `img-${Date.now()}`,
      url,
      alt: "",
      order: images.length
    };
    
    onImagesChange([...images, newImage]);
  };

  const handleRemoveImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id).map((img, index) => ({
      ...img,
      order: index
    })));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages.map((img, index) => ({
      ...img,
      order: index
    })));
  };

  const handleUpdateAlt = (id: string, alt: string) => {
    onImagesChange(images.map(img =>
      img.id === id ? { ...img, alt } : img
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Grid3x3 className="w-5 h-5" />
          Gallery Images ({images.length}/{maxImages})
        </h3>
        {images.length < maxImages && (
          <ImageUploader
            onUploadComplete={handleAddImage}
            folder="gallery"
            className="w-auto"
          />
        )}
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gsv-gray mb-4">No images in gallery</p>
          <ImageUploader
            onUploadComplete={handleAddImage}
            folder="gallery"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group border rounded-lg overflow-hidden"
            >
              <img
                src={image.url}
                alt={image.alt || `Gallery image ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newIndex = index > 0 ? index - 1 : images.length - 1;
                      handleReorder(index, newIndex);
                    }}
                    className="px-2 py-1 bg-white text-gray-800 rounded text-xs hover:bg-gray-100"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => {
                      const newIndex = index < images.length - 1 ? index + 1 : 0;
                      handleReorder(index, newIndex);
                    }}
                    className="px-2 py-1 bg-white text-gray-800 rounded text-xs hover:bg-gray-100"
                    title="Move right"
                  >
                    →
                  </button>
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="p-2 bg-white">
                <input
                  type="text"
                  value={image.alt || ""}
                  onChange={(e) => handleUpdateAlt(image.id, e.target.value)}
                  placeholder="Alt text (optional)"
                  className="w-full text-xs border rounded px-2 py-1"
                />
              </div>
            </div>
          ))}
          {images.length < maxImages && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center min-h-[128px]">
              <ImageUploader
                onUploadComplete={handleAddImage}
                folder="gallery"
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

