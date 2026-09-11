export type PaperSizeId = "letter" | "a4" | "folio";

export interface PaperSize {
  id: PaperSizeId;
  label: string;
  /** Physical page dimensions in inches — drives the on-screen aspect
   *  ratio, the print/@page size, and the DOCX page size, so every
   *  output stays in sync from a single source of truth. */
  widthIn: number;
  heightIn: number;
}

export const paperSizes: Record<PaperSizeId, PaperSize> = {
  letter: {
    id: "letter",
    label: "Letter (8.5\" × 11\")",
    widthIn: 8.5,
    heightIn: 11,
  },
  a4: {
    id: "a4",
    label: "A4 (210 × 297 mm)",
    widthIn: 8.27,
    heightIn: 11.69,
  },
  folio: {
    id: "folio",
    label: "Folio (8.5\" × 13\")",
    widthIn: 8.5,
    heightIn: 13,
  },
};

export const paperSizeList: PaperSize[] = Object.values(paperSizes);

export function getPaperSize(id: PaperSizeId): PaperSize {
  return paperSizes[id] ?? paperSizes.letter;
}

/** The widest supported paper — the on-screen preview's sizing reference,
 *  so every format renders at its true width relative to the others
 *  instead of all formats stretching to fill the same box. */
export const widestPaperIn = Math.max(...paperSizeList.map((p) => p.widthIn));

/** Preview width in px for a given paper size, proportional to its real
 *  width relative to the widest supported paper at `basePx`. Letter and
 *  Folio share a width, so they render at `basePx`; A4, being ~3%
 *  narrower, renders correspondingly narrower — matching the printed
 *  page instead of always filling the same box. */
export function getPreviewWidthPx(paperSize: PaperSize, basePx: number): number {
  return Math.round((paperSize.widthIn / widestPaperIn) * basePx);
}
