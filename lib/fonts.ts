export type FontId =
  | "calibri"
  | "arial"
  | "times-new-roman"
  | "georgia"
  | "garamond"
  | "helvetica"
  | "cambria";

export interface FontOption {
  id: FontId;
  label: string;
  /** CSS font-family stack for the live preview. */
  cssStack: string;
  /** Exact font name passed to the DOCX generator. Using the same
   *  Word-native name here as the CSS stack's first choice keeps the
   *  downloaded .docx looking like the on-screen preview on any
   *  Windows/Mac machine, since these are all fonts Word ships with. */
  docxName: string;
}

export const fonts: FontOption[] = [
  {
    id: "calibri",
    label: "Calibri",
    cssStack: '"Calibri", "Carlito", Arial, sans-serif',
    docxName: "Calibri",
  },
  {
    id: "arial",
    label: "Arial",
    cssStack: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    docxName: "Arial",
  },
  {
    id: "times-new-roman",
    label: "Times New Roman",
    cssStack: '"Times New Roman", Times, serif',
    docxName: "Times New Roman",
  },
  {
    id: "georgia",
    label: "Georgia",
    cssStack: 'Georgia, "Times New Roman", serif',
    docxName: "Georgia",
  },
  {
    id: "garamond",
    label: "Garamond",
    cssStack: 'Garamond, "EB Garamond", "Times New Roman", serif',
    docxName: "Garamond",
  },
  {
    id: "helvetica",
    label: "Helvetica",
    cssStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    docxName: "Helvetica",
  },
  {
    id: "cambria",
    label: "Cambria",
    cssStack: "Cambria, Georgia, serif",
    docxName: "Cambria",
  },
];

export const defaultFontId: FontId = "calibri";

export function getFont(id: FontId): FontOption {
  return fonts.find((f) => f.id === id) ?? fonts[0];
}
