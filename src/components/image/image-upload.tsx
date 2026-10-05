import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle
} from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";
import axiosInstance from "@/lib/axios/instance";
import { cn } from "@/lib/utils";

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

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

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

  if (compact) {
    return (
      <div className={cn("h-full w-full", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="group relative h-full w-full">
          {value && !uploading ? (
            <div className="relative h-full w-full overflow-hidden rounded-md border">
              <img src={value} alt="Preview" className="block h-full w-full object-cover" />

              {/* Overlay actions */}
              <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/10 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Change image"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-background/90 hover:bg-background flex h-6 w-6 items-center justify-center rounded shadow-sm"
                >
                  <ImagePlus className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="bg-background/90 hover:bg-background flex h-6 w-6 items-center justify-center rounded shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : uploading ? (
            <div className="flex h-full w-full items-center justify-center rounded-md border">
              <div className="flex flex-col items-center gap-1">
                <Spinner />
                <span className="text-muted-foreground text-[10px]">{uploadProgress}%</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-input bg-background hover:border-primary hover:bg-accent flex h-full w-full items-center justify-center rounded-md border-2 border-dashed transition-colors"
            >
              <ImageIcon className="text-muted-foreground h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {value && !uploading ? (
          <Attachment orientation="vertical" className="max-w-xs">
            <AttachmentMedia variant="image" className="aspect-square">
              <img src={value} className="h-full w-full object-cover" alt="Preview" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Hình ảnh & Truyền thống</AttachmentTitle>
              <AttachmentDescription>Thumbnail và gallery</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                aria-label="Change image"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
              </AttachmentAction>
              <AttachmentAction aria-label="Remove image" onClick={handleRemove}>
                <X className="h-4 w-4" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ) : uploading ? (
          <Attachment state="uploading" className="max-w-xs">
            <AttachmentMedia>
              <Spinner />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Đang upload...</AttachmentTitle>
              <AttachmentDescription>Uploading · {uploadProgress}%</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Cancel upload" onClick={handleRemove}>
                <X className="h-4 w-4" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-input bg-background hover:border-primary hover:bg-accent flex aspect-square w-full max-w-xs flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
          >
            <ImagePlus className="text-muted-foreground h-12 w-12" />
            <p className="text-muted-foreground mt-2 text-sm font-medium">Click để upload</p>
          </button>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc nhập URL trực tiếp"
            className={cn(
              "bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex-1 rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-destructive" : "border-input"
            )}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
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

        {error && <p className="text-destructive text-sm">{error}</p>}
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

  const getFileName = (url: string) => {
    try {
      const fileName = url.split("/").pop() || "image";
      return fileName.length > 20 ? fileName.substring(0, 20) + "..." : fileName;
    } catch {
      return "image";
    }
  };

  const getFileSize = (index: number) => {
    return `${index + 1}/${values.length}`;
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

      {values.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {values.map((img, idx) => (
              <Attachment key={idx} orientation="vertical" className="w-full">
                <AttachmentMedia variant="image" className="aspect-video w-full">
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{getFileName(img)}</AttachmentTitle>
                  <AttachmentDescription>{getFileSize(idx)}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction
                    aria-label={`Remove ${getFileName(img)}`}
                    onClick={() => handleRemove(idx)}
                  >
                    <X className="h-4 w-4" />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            ))}
          </div>

          {uploading && (
            <Attachment state="uploading" className="w-full">
              <AttachmentMedia>
                <Spinner />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>Đang upload...</AttachmentTitle>
                <AttachmentDescription>
                  Uploading · {uploadProgress.current}/{uploadProgress.total}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Cancel upload">
                  <X className="h-4 w-4" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border-input bg-background hover:border-primary hover:bg-accent flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 transition-colors"
        >
          {uploading ? (
            <div className="text-center">
              <Spinner className="mx-auto" />
              <p className="text-muted-foreground mt-2 text-sm">
                {uploadProgress.current}/{uploadProgress.total}
              </p>
            </div>
          ) : (
            <>
              <ImageIcon className="text-muted-foreground h-12 w-12 opacity-50" />
              <p className="text-foreground mt-3 text-sm font-medium">Chưa có hình ảnh</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Click để upload hoặc kéo thả ảnh vào đây
              </p>
            </>
          )}
        </button>
      )}
    </div>
  );
}
