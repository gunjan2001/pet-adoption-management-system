// src/components/ImageUploadField.tsx (Updated for Cloudinary API)
import { MediaItem } from "@/types";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  mediaItems: MediaItem[]; // Array of uploaded media items with IDs
  onChange: (items: MediaItem[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploadField({
  mediaItems,
  onChange,
  maxImages = 5,
  maxSizeMB = 5,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check if adding these files would exceed max images
    if (mediaItems.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const newMediaItems: MediaItem[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
          toast.error(`${file.name} is too large (max ${maxSizeMB}MB)`);
          continue;
        }

        // Upload to backend API
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/media/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const result = await response.json();

        // Add to media items with sequence
        newMediaItems.push({
          id: result.data.mediaId,
          url: result.data.url,
          sequence: mediaItems.length + newMediaItems.length,
        });
      }

      if (newMediaItems.length > 0) {
        onChange([...mediaItems, ...newMediaItems]);
        toast.success(
          `${newMediaItems.length} image${newMediaItems.length > 1 ? "s" : ""} uploaded`
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload images"
      );
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const newItems = mediaItems.filter((_, i) => i !== index);
    // Resequence remaining items
    const resequenced = newItems.map((item, i) => ({
      ...item,
      sequence: i,
    }));
    onChange(resequenced);
    toast.success("Image removed");
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1.5 block">
          Pet Images{" "}
          {mediaItems.length > 0 && `(${mediaItems.length}/${maxImages})`}
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || mediaItems.length >= maxImages}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || mediaItems.length >= maxImages}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2 text-gray-600">
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-sm font-medium">
                  Uploading to Cloudinary...
                </span>
              </>
            ) : mediaItems.length >= maxImages ? (
              <>
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Maximum images reached
                </span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Click to upload images (max {maxSizeMB}MB each)
                </span>
              </>
            )}
          </div>
        </button>

        <p className="text-xs text-gray-500 mt-1.5">
          Supported: JPG, PNG, GIF, WebP • Max {maxImages} images • Max{" "}
          {maxSizeMB}MB per image
        </p>
      </div>

      {/* Image Previews */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mediaItems.map((item, index) => (
            <div key={item.id} className="relative group">
              {/* Image */}
              <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                <img
                  src={item.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>

              {/* First image badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-amber-500 text-white text-xs font-semibold shadow-lg">
                  Main
                </div>
              )}

              {/* Image number */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help text for first image */}
      {mediaItems.length > 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          💡 The first image will be used as the main thumbnail in listings
        </p>
      )}
    </div>
  );
}
