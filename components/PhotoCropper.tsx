"use client";

import { useRef, useState } from "react";
import {
  loadImage,
  displayedSize,
  clampPos,
  centeredPos,
  exportCrop,
} from "@/lib/imageUtils";
import { ImageUp, ZoomIn, X, UserRound } from "lucide-react";

interface PhotoCropperProps {
  photoDataUrl?: string;
  onPhotoChange: (dataUrl: string | undefined) => void;
}

const BOX = 240; // display viewport size in px, square

export default function PhotoCropper({
  photoDataUrl,
  onPhotoChange,
}: PhotoCropperProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispSize = img ? displayedSize(img, BOX, zoom) : { width: 0, height: 0 };

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const src = reader.result as string;
      const loaded = await loadImage(src);
      const { width, height } = displayedSize(loaded, BOX, 1);
      setImg(loaded);
      setZoom(1);
      setPos(centeredPos(width, height, BOX));
    };
    reader.readAsDataURL(file);
  };

  const handleZoom = (newZoom: number) => {
    if (!img) return;
    const old = displayedSize(img, BOX, zoom);
    const fx = BOX / 2;
    const fy = BOX / 2;
    const fracX = (fx - pos.x) / old.width;
    const fracY = (fy - pos.y) / old.height;
    const next = displayedSize(img, BOX, newZoom);
    const newPos = clampPos(
      { x: fx - fracX * next.width, y: fy - fracY * next.height },
      next.width,
      next.height,
      BOX
    );
    setZoom(newZoom);
    setPos(newPos);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!img) return;
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    dragOrigin.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !img) return;
    const dx = e.clientX - dragOrigin.current.x;
    const dy = e.clientY - dragOrigin.current.y;
    const next = displayedSize(img, BOX, zoom);
    setPos(
      clampPos(
        { x: dragOrigin.current.posX + dx, y: dragOrigin.current.posY + dy },
        next.width,
        next.height,
        BOX
      )
    );
  };

  const onPointerUp = () => setDragging(false);

  const handleUseAsResumePhoto = () => {
    if (!img) return;
    const dataUrl = exportCrop(img, BOX, { zoom, pos }, 400);
    onPhotoChange(dataUrl);
  };

  const handleRemove = () => {
    setImg(null);
    setZoom(1);
    setPos({ x: 0, y: 0 });
    onPhotoChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {!img ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-[240px] w-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-700 bg-ink-800/40 text-ink-600 hover:border-ink-600 hover:bg-ink-800"
        >
          <ImageUp size={22} />
          <span className="text-[12px]">Upload a photo</span>
          <span className="text-[10px]">JPG or PNG</span>
        </button>
      ) : (
        <>
          <div
            className="relative h-[240px] w-[240px] cursor-move touch-none overflow-hidden rounded-lg border border-ink-700 bg-ink-950"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt="Crop preview"
              draggable={false}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: dispSize.width,
                height: dispSize.height,
                maxWidth: "none",
              }}
            />
            {/* Guide overlay: circle for face framing reference */}
            <div className="pointer-events-none absolute inset-0 border-2 border-white/40" />
          </div>

          <div className="flex items-center gap-2">
            <ZoomIn size={13} className="text-ink-600" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => handleZoom(parseFloat(e.target.value))}
              className="w-[180px] accent-stamp"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-ink-700 px-2.5 py-1.5 text-[11px] text-paper-200 hover:border-ink-600 hover:bg-ink-800"
            >
              Change photo
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1 rounded-md border border-ink-700 px-2.5 py-1.5 text-[11px] text-ink-600 hover:border-stamp/60 hover:text-stamp-light"
            >
              <X size={12} /> Remove
            </button>
          </div>

          <button
            onClick={handleUseAsResumePhoto}
            className="flex w-fit items-center gap-1.5 rounded-md bg-stamp px-3 py-1.5 text-[11px] font-semibold text-paper-100 hover:bg-stamp-light"
          >
            <UserRound size={12} />
            {photoDataUrl ? "Update resume photo" : "Attach to resume"}
          </button>
          {photoDataUrl && (
            <p className="text-[10.5px] text-ink-600">
              This photo will appear on the resume preview and DOCX export.
            </p>
          )}
        </>
      )}
    </div>
  );
}
