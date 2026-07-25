// Square photo crop math. A single crop selection (pan + zoom over a square
// viewport) is reused to export at different print resolutions, since 2x2in
// and 1x1in ID photos share the same 1:1 aspect ratio — only the pixel size
// (i.e. DPI at a given physical size) differs.

export interface CropState {
  zoom: number;
  pos: { x: number; y: number }; // top-left offset of the displayed image within the box, in box px
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function baseScaleFor(
  img: HTMLImageElement,
  box: number
): number {
  return Math.max(box / img.naturalWidth, box / img.naturalHeight);
}

export function displayedSize(
  img: HTMLImageElement,
  box: number,
  zoom: number
): { width: number; height: number } {
  const base = baseScaleFor(img, box);
  return {
    width: img.naturalWidth * base * zoom,
    height: img.naturalHeight * base * zoom,
  };
}

export function clampPos(
  pos: { x: number; y: number },
  dispWidth: number,
  dispHeight: number,
  box: number
): { x: number; y: number } {
  const minX = Math.min(0, box - dispWidth);
  const minY = Math.min(0, box - dispHeight);
  return {
    x: Math.max(minX, Math.min(0, pos.x)),
    y: Math.max(minY, Math.min(0, pos.y)),
  };
}

export function centeredPos(
  dispWidth: number,
  dispHeight: number,
  box: number
): { x: number; y: number } {
  return { x: (box - dispWidth) / 2, y: (box - dispHeight) / 2 };
}

/** Export the current crop selection to a square PNG data URL at targetPx x targetPx. */
export function exportCrop(
  img: HTMLImageElement,
  box: number,
  crop: CropState,
  targetPx: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = targetPx;
  canvas.height = targetPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const scaleUp = targetPx / box;
  const { width: dispWidth, height: dispHeight } = displayedSize(
    img,
    box,
    crop.zoom
  );

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    crop.pos.x * scaleUp,
    crop.pos.y * scaleUp,
    dispWidth * scaleUp,
    dispHeight * scaleUp
  );

  return canvas.toDataURL("image/png");
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
