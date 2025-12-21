"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoUploadProps {
  preview: string | null;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  error?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-32 h-32",
  md: "w-48 h-48",
  lg: "w-64 h-64",
};

export function LogoUpload({
  preview,
  onUpload,
  uploading = false,
  error,
  className,
  size = "md",
}: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file && !uploading) {
      await onUpload(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  if (preview) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden border-2 border-primary bg-muted/30 p-1 transition-all hover:border-primary/50",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={preview}
          alt="Company logo"
          fill
          className="object-contain p-1"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-full"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Pencil />
            )}
            Change
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "group relative cursor-pointer overflow-hidden border-2 border-dashed transition-all duration-300 flex items-center justify-center",
        error
          ? "border-destructive bg-destructive/5"
          : isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/50",
        uploading && "pointer-events-none opacity-60",
        sizeClasses[size],
        className
      )}
    >
      <div className="flex flex-col items-center justify-center p-8 text-center pointer-events-none">
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300",
            error
              ? "bg-destructive/10 text-destructive"
              : isDragging
              ? "bg-primary/20 text-primary scale-110"
              : "bg-muted-foreground/10 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary group-hover:scale-110"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <ImageIcon className="h-8 w-8" />
          )}
        </div>
        {error ? (
          <p className="text-sm text-destructive font-medium">{error}</p>
        ) : (
          <>
            <p className="text-sm font-semibold mb-1 hidden sm:block">
              {uploading
                ? "Uploading..."
                : isDragging
                ? "Drop your logo here"
                : "Click or drag to upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP • Max 2MB
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInput}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}
