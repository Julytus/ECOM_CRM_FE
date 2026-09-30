import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios/instance";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  compact?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  label,
  required = false,
  error,
  className = "",
  compact = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axiosInstance.post("/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        }
      });

      if (data.code === 200 && data.result) {
        onChange(data.result);
      } else {
        throw new Error(data.message || "Upload thất bại");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Có lỗi xảy ra khi upload ảnh");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  // Compact version for variant images
  if (compact) {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="group relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
          {value ? (
            <>
              <img src={value} className="h-full w-full object-cover" alt="Preview" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-white p-1.5 text-stone-900 hover:bg-stone-100"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-full bg-white p-1.5 text-red-500 hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-white" />
                    <p className="mt-1 text-xs text-white">{uploadProgress}%</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-full w-full items-center justify-center text-stone-300 hover:text-amber-500"
            >
              {uploading ? (
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-1 text-xs">{uploadProgress}%</p>
                </div>
              ) : (
                <ImageIcon className="h-8 w-8" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full version with URL input
  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {/* Image Preview Area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="group relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 transition-all hover:border-amber-300">
          {value ? (
            <>
              <img src={value} className="h-full w-full object-cover" alt="Preview" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-full bg-white p-2 text-stone-900 hover:bg-stone-100"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-full bg-white p-2 text-red-500 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
                    <p className="mt-2 text-sm font-medium text-white">{uploadProgress}%</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-full w-full flex-col items-center justify-center text-stone-300 hover:text-amber-500"
            >
              {uploading ? (
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                  <p className="mt-2 text-sm font-medium">{uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <ImagePlus className="h-12 w-12" />
                  <p className="mt-2 text-sm font-medium">Click để upload</p>
                </>
              )}
            </button>
          )}
        </div>

        {/* URL Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc nhập URL trực tiếp"
            className={`flex-1 rounded-xl border-2 bg-white px-4 py-2 transition-colors focus:outline-none ${
              error ? "border-red-500" : "border-stone-200 focus:border-amber-400"
            }`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-10"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}

interface MultiImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
}

export function MultiImageUploader({
  values,
  onChange,
  label,
  maxImages = 10
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (values.length + files.length > maxImages) {
      alert(`Chỉ được upload tối đa ${maxImages} ảnh`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: totalFiles });

        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axiosInstance.post("/file/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (data.code === 200 && data.result) {
          uploadedUrls.push(data.result);
        }
      }

      onChange([...values, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Có lỗi xảy ra khi upload ảnh");
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || values.length >= maxImages}
            className="rounded-xl"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                {uploadProgress.current}/{uploadProgress.total}
              </>
            ) : (
              <>
                <Upload className="mr-1 h-4 w-4" />
                Upload ({values.length}/{maxImages})
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
        {values.map((img, idx) => (
          <div
            key={idx}
            className="group relative aspect-video overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 shadow-sm"
          >
            <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-red-500 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-xs text-white">Ảnh {idx + 1}</p>
            </div>
          </div>
        ))}

        {/* Add button */}
        {values.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 text-stone-300 transition-all hover:border-amber-300 hover:bg-stone-50 hover:text-amber-500"
          >
            {uploading ? (
              <div className="text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                <p className="mt-1 text-xs">
                  {uploadProgress.current}/{uploadProgress.total}
                </p>
              </div>
            ) : (
              <ImagePlus className="h-8 w-8" />
            )}
          </button>
        )}

        {values.length === 0 && (
          <div className="col-span-3 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 py-12 text-center text-stone-400 md:col-span-4">
            <ImageIcon className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p className="text-sm font-medium">Chưa có hình ảnh</p>
            <p className="mt-1 text-xs">Click nút Upload để thêm ảnh</p>
          </div>
        )}
      </div>
    </div>
  );
}
