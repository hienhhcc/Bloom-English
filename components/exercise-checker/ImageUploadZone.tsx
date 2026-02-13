'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImageUploadZoneProps {
  label: string;
  description: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
}

const MAX_WIDTH = 1500;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      // Strip the data:image/jpeg;base64, prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function ImageUploadZone({ label, description, image, onImageChange }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const base64 = await compressImage(file);
      onImageChange(base64);
    } catch (error) {
      console.error('Image compression failed:', error);
    }
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  if (image) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="relative">
          <img
            src={`data:image/jpeg;base64,${image}`}
            alt={label}
            className="w-full rounded-lg border border-border object-cover max-h-64"
          />
          <Button
            variant="destructive"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={() => onImageChange(null)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Card
        className={`relative cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-dashed border-muted-foreground/30 hover:border-primary/50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="p-3 bg-muted rounded-full mb-3">
            {isDragging ? (
              <ImageIcon className="size-6 text-primary" />
            ) : (
              <Upload className="size-6 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{description}</p>
          <p className="text-xs text-muted-foreground/70">
            Tap to take a photo or drag & drop an image
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            // Reset so same file can be re-selected
            e.target.value = '';
          }}
        />
      </Card>
    </div>
  );
}
