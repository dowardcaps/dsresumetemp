"use client";

import { useRef, useState } from "react";
import {
  loadImage,
  displayedSize,
  clampPos,
  centeredPos,
  exportCrop,
} from "@/lib/imageUtils";
import { Circle, ImageUp, Maximize2, Square, UserRound, X, ZoomIn } from "lucide-react";

interface PhotoCropperProps {
  photoDataUrl?: string;
  photoShape: "round" | "square";
  photoSizeIn: number;
  onPhotoChange: (dataUrl: string | undefined) => void;
  onPhotoShapeChange: (shape: "round" | "square") => void;
  onPhotoSizeChange: (size: number) => void;
}

const BOX = 240; // display viewport size in px, square
const SIZE_PRESETS = [1, 1.5, 2] as const;
const MIN_SIZE_IN = 0.5;
const MAX_SIZE_IN = 5;

function clampSize(size: number): number {
  if (!Number.isFinite(size)) return 1;
  return Math.round(Math.min(MAX_SIZE_IN, Math.max(MIN_SIZE_IN, size)) * 100) / 100;
}

export default function PhotoCropper({
  photoDataUrl,
  photoShape,
  photoSizeIn,
  onPhotoChange,
  onPhotoShapeChange,
  onPhotoSizeChange,
}: PhotoCropperProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPreset = (SIZE_PRESETS as readonly number[]).includes(photoSizeIn);
  const [customSizeText, setCustomSizeText] = useState(
    isPreset ? "" : String(photoSizeIn)
  );

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
    // 300dpi keeps every quick size selector print-ready without storing the
    // original full-size upload in resume state.
    const dataUrl = exportCrop(img, BOX, { zoom, pos }, photoSizeIn * 300, photoShape);
    onPhotoChange(dataUrl);
  };

  const handleRemove = () => {
    setImg(null);
    setZoom(1);
    setPos({ x: 0, y: 0 });
    onPhotoChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePhotoSizeChange = (rawSize: number) => {
    const size = clampSize(rawSize);
    onPhotoSizeChange(size);
    // Only re-export if a crop has already been attached to the resume —
    // otherwise this would silently attach a photo the user never confirmed
    // with "Attach to resume".
    if (img && photoDataUrl) {
      onPhotoChange(exportCrop(img, BOX, { zoom, pos }, size * 300, photoShape));
    }
  };

  const handleCustomSizeInput = (text: string) => {
    setCustomSizeText(text);
    const parsed = parseFloat(text);
    if (!Number.isNaN(parsed) && parsed > 0) {
      handlePhotoSizeChange(parsed);
    }
  };

  const handleCustomSizeBlur = () => {
    // On blur, snap the field to whatever size actually ended up applied
    // (e.g. after clamping) so the input never shows an invalid value.
    setCustomSizeText(String(clampSize(parseFloat(customSizeText) || photoSizeIn)));
  };

  const handlePhotoShapeChange = (shape: "round" | "square") => {
    onPhotoShapeChange(shape);
    // Bake the shape into the exported PNG too, so DOCX keeps a round photo —
    // but again, only once a crop has actually been attached.
    if (img && photoDataUrl) {
      onPhotoChange(exportCrop(img, BOX, { zoom, pos }, photoSizeIn * 300, shape));
    }
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
            <div className="pointer-events-none absolute inset-3 rounded-full border-2 border-white/50" />
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

          <div className="rounded-lg border border-ink-700 bg-paper-200 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Maximize2 size={13} className="text-stamp" />
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-stamp/80">
                Resume photo style
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePhotoShapeChange("round")}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${photoShape === "round" ? "border-stamp bg-stamp text-white" : "border-ink-700 bg-white text-stamp-dark hover:border-stamp/60"}`}
              >
                <Circle size={12} /> Rounded full
              </button>
              <button
                onClick={() => handlePhotoShapeChange("square")}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${photoShape === "square" ? "border-stamp bg-stamp text-white" : "border-ink-700 bg-white text-stamp-dark hover:border-stamp/60"}`}
              >
                <Square size={12} /> Perfect square
              </button>
            </div>
            <p className="mb-1.5 mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-stamp/80">
              Printed size
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_PRESETS.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setCustomSizeText("");
                    handlePhotoSizeChange(size);
                  }}
                  className={`rounded-md border px-2 py-2 text-center text-[11px] font-semibold transition-colors ${isPreset && photoSizeIn === size ? "border-stamp bg-stamp text-white" : "border-ink-700 bg-white text-stamp-dark hover:border-stamp/60"}`}
                >
                  {size} × {size}<span className="ml-0.5 text-[9px] font-normal">in</span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label
                className={`flex items-center gap-1.5 rounded-md border px-2 py-2 text-[11px] font-semibold transition-colors ${!isPreset ? "border-stamp bg-stamp/5 text-stamp-dark" : "border-ink-700 bg-white text-stamp-dark"}`}
              >
                Custom
                <input
                  type="number"
                  inputMode="decimal"
                  min={MIN_SIZE_IN}
                  max={MAX_SIZE_IN}
                  step={0.1}
                  value={customSizeText}
                  onChange={(e) => handleCustomSizeInput(e.target.value)}
                  onBlur={handleCustomSizeBlur}
                  placeholder={String(photoSizeIn)}
                  className="w-14 rounded border border-ink-700 bg-white px-1.5 py-0.5 text-center text-[11px] text-stamp-dark outline-none focus:border-stamp/60"
                />
                <span className="text-[10px] font-normal text-ink-600">in × in</span>
              </label>
              {!isPreset && (
                <span className="text-[10px] text-stamp">
                  {photoSizeIn} × {photoSizeIn} in
                </span>
              )}
            </div>
            <p className="mt-2 text-[10px] leading-snug text-ink-600">
              Your crop stays square. Choose its shape and display size here (a preset or your own size from {MIN_SIZE_IN}" to {MAX_SIZE_IN}"), then update the resume photo to save the crop at the selected print quality.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-ink-700 px-2.5 py-1.5 text-[11px] text-ink-600 hover:border-stamp/60 hover:text-stamp-light"
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
