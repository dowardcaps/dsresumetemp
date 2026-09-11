"use client";

import { useEffect } from "react";
import { X, RotateCcw } from "lucide-react";

interface ThemeColorPickerProps {
  /** Currently active accent color (custom, or the template's default). */
  color: string;
  /** The selected template's own built-in accent color. */
  defaultColor: string;
  /** Whether `color` is a user override rather than the template default. */
  isCustom: boolean;
  onChange: (hex: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const SWATCHES = [
  "#0F3D2E",
  "#1B1F29",
  "#4A4A4A",
  "#7A263A",
  "#116466",
  "#1550C9",
  "#0B2545",
  "#6E8B5D",
  "#3E63DD",
  "#111111",
  "#8C7A6B",
  "#4B315E",
  "#9A4D5A",
  "#30343B",
];

export default function ThemeColorPicker({
  color,
  defaultColor,
  isCustom,
  onChange,
  onReset,
  onClose,
}: ThemeColorPickerProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-600/40 px-4 py-8 backdrop-blur-[2px] print:hidden"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xs overflow-hidden rounded-xl border border-ink-700 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-ink-700 bg-stamp px-4 py-3">
          <p className="font-display text-[14px] font-bold tracking-tight text-white">
            Theme color
          </p>
          <button
            onClick={onClose}
            aria-label="Close color picker"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/30 text-white hover:border-white/60 hover:bg-stamp-light"
          >
            <X size={13} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <label className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-md border border-ink-700 bg-transparent p-0.5"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold text-stamp-dark">
                Pick any color
              </span>
              <span className="font-mono text-[10px] uppercase text-ink-600">
                {color}
              </span>
            </div>
          </label>

          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-600">
              Quick swatches
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {SWATCHES.map((sw) => (
                <button
                  key={sw}
                  onClick={() => onChange(sw)}
                  aria-label={`Use ${sw}`}
                  title={sw}
                  className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 ${
                    color.toLowerCase() === sw.toLowerCase()
                      ? "border-stamp ring-2 ring-stamp ring-offset-1"
                      : "border-ink-700"
                  }`}
                  style={{ backgroundColor: sw }}
                />
              ))}
            </div>
          </div>

          {isCustom && (
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-[11px] font-semibold text-stamp-dark hover:border-stamp/60"
            >
              <RotateCcw size={12} />
              Reset to template default ({defaultColor})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
