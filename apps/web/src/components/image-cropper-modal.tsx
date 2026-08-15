'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  X,
  Move,
  RotateCcw as ResetIcon,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number; // 1 for square avatar
  cropShape?: 'round' | 'rect';
  title?: string;
}

export function ImageCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'round',
  title = 'Adjust & Crop Photo',
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when a new image source opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Load natural dimensions of the image
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Mouse & Touch Pan Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && e.touches[0]) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1 || !e.touches[0]) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3.5));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleRotate = (dir: 1 | -1) => {
    setRotation((prev) => (prev + dir * 90 + 360) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Perform Canvas crop & export as high-quality Blob/File
  const handleConfirmCrop = async () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const targetSize = 600; // 600x600 px high-res avatar
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Smooth image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Viewport box is roughly 280x280 in UI
    const viewportSize = 280;
    const scaleFactor = targetSize / viewportSize;

    // Move origin to center of canvas
    ctx.translate(targetSize / 2, targetSize / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply pan offset (scaled to canvas size)
    const rad = (-rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rotatedOffsetX = (offset.x * cos - offset.y * sin) * scaleFactor;
    const rotatedOffsetY = (offset.x * sin + offset.y * cos) * scaleFactor;

    ctx.translate(rotatedOffsetX, rotatedOffsetY);

    // Calculate image render dimensions preserving natural aspect ratio
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let renderW = targetSize * zoom;
    let renderH = targetSize * zoom;

    if (imgAspect > 1) {
      renderW = targetSize * imgAspect * zoom;
    } else {
      renderH = (targetSize / imgAspect) * zoom;
    }

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

    // Convert canvas to Blob -> File
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `avatar-${Date.now()}.webp`, {
          type: 'image/webp',
          lastModified: Date.now(),
        });
        onCropComplete(file);
        onClose();
      },
      'image/webp',
      0.92,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="card bg-background-elevated border-surface-border shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-0 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-text-primary">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          className="relative w-full h-80 bg-black/90 flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Target Image with Transforms */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop target"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
              transformOrigin: 'center center',
              maxWidth: 'none',
              maxHeight: 'none',
              width:
                naturalSize.width > naturalSize.height
                  ? `${280 * (naturalSize.width / (naturalSize.height || 1))}px`
                  : '280px',
              height:
                naturalSize.height >= naturalSize.width
                  ? `${280 * (naturalSize.height / (naturalSize.width || 1))}px`
                  : '280px',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className="pointer-events-none"
          />

          {/* Mask Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Dark vignette backdrop */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Clear crop window with glow border & grid lines */}
            <div
              className={`relative z-10 w-[280px] h-[280px] border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ${
                cropShape === 'round' ? 'rounded-full' : 'rounded-2xl'
              }`}
            >
              {/* Rule of thirds grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>
            </div>
          </div>

          {/* Drag instruction overlay badge */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-text-muted flex items-center gap-1.5 pointer-events-none border border-white/10">
            <Move className="w-3 h-3 text-primary" /> Drag to reposition · Scroll to zoom
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="p-5 space-y-4 bg-surface/40 border-t border-surface-border">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))}
              className="p-1.5 rounded-lg bg-surface hover:bg-surface-light text-text-secondary hover:text-text-primary border border-surface-border transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs font-mono text-text-muted w-10 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))}
              className="p-1.5 rounded-lg bg-surface hover:bg-surface-light text-text-secondary hover:text-text-primary border border-surface-border transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Rotation & Reset Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotate(-1)}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                title="Rotate 90° Counter-Clockwise"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 90° Left
              </button>
              <button
                type="button"
                onClick={() => handleRotate(1)}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" /> 90° Right
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1 py-1 px-2"
            >
              <ResetIcon className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-surface/70 border-t border-surface-border flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary py-2 px-4 text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Crop & Upload Photo
          </button>
        </div>
      </div>
    </div>
  );
}
