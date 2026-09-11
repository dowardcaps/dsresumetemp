export type FontSizeId = "small" | "medium" | "large";

export interface FontSizeOption {
  id: FontSizeId;
  label: string;
  /** Multiplier applied to every font size in the template — in the
   *  preview via a CSS variable, and in the DOCX export via the same
   *  factor applied to each run's half-point size. Keeping this a
   *  single relative scale (rather than one fixed base size) preserves
   *  each template's existing size hierarchy (name vs. headings vs.
   *  body) instead of flattening it. */
  scale: number;
}

export const fontSizes: FontSizeOption[] = [
  { id: "small", label: "Small", scale: 0.85 },
  { id: "medium", label: "Medium", scale: 1 },
  { id: "large", label: "Large", scale: 1.3 },
];

export const defaultFontSizeId: FontSizeId = "medium";

export function getFontSize(id: FontSizeId): FontSizeOption {
  return fontSizes.find((s) => s.id === id) ?? fontSizes[1];
}
