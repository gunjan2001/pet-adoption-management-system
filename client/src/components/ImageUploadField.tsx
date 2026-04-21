// src/components/ImageUploadField.tsx
import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  images: string[]; // Array of image URLs or base64 strings
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploadField({
  images,
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
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const newImages: string[] = [];

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

        // Convert to base64
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
        toast.success(`${newImages.length} image${newImages.length > 1 ? "s" : ""} added`);
      }
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success("Image removed");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1.5 block">
          Pet Images {images.length > 0 && `(${images.length}/${maxImages})`}
        </label>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2 text-gray-600">
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-sm font-medium">Uploading...</span>
              </>
            ) : images.length >= maxImages ? (
              <>
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Maximum images reached</span>
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
          Supported: JPG, PNG, GIF, WebP • Max {maxImages} images • Max {maxSizeMB}MB per image
        </p>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              {/* Image */}
              <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                <img
                  src={image}
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
      {images.length > 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          💡 The first image will be used as the main thumbnail in listings
        </p>
      )}
    </div>
  );
}
