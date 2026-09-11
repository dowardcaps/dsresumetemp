import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  ShadingType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  ImageRun,
  convertInchesToTwip,
} from "docx";
import { ResumeData, ResumeTemplate } from "./types";
import { dataUrlToUint8Array } from "./imageUtils";
import { PaperSize, paperSizes } from "./paperSizes";
import { FontOption, fonts } from "./fonts";
import { FontSizeOption, fontSizes as fontSizeOptions } from "./fontSizes";

const hex = (h: string) => h.replace("#", "").toUpperCase();
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const NO_CELL_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
};

// The selected font + size scale for the export currently in progress.
// Set once at the top of generateDocx and read by every builder function
// below it — simpler than threading the same two values through every
// helper in this file, and safe because a single export always runs to
// completion synchronously before another one can start.
let DOCX_FONT = "Calibri";
let DOCX_SCALE = 1;

/** Scales a half-point font size by the user's chosen size scale. */
function sz(halfPoints: number): number {
  return Math.round(halfPoints * DOCX_SCALE);
}

function contactLine(data: ResumeData, separator = "   |   "): string {
  return [data.email, data.phone, data.location, data.links]
    .filter(Boolean)
    .join(separator);
}

/** A section heading rendered as a colored bar across the section width —
 *  mirrors the on-screen "BarSection" component (Clean List, ATS Classic). */
function barHeading(text: string, bgHex: string, fgHex: string): Paragraph {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, color: "auto", fill: hex(bgHex) },
    spacing: { before: 220, after: 90 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: sz(18),
        color: hex(fgHex),
        font: DOCX_FONT,
        characterSpacing: 20,
      }),
    ],
  });
}

/** A section heading in accent-colored text with a thin gray rule under it —
 *  mirrors the on-screen "RuleSection" component (Sidebar's main column). */
function ruleHeading(text: string, accent: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 90 },
    border: {
      bottom: { color: "DDDFE3", space: 2, style: BorderStyle.SINGLE, size: 4 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: sz(18),
        color: hex(accent),
        font: DOCX_FONT,
        characterSpacing: 16,
      }),
    ],
  });
}

/** A small white uppercase heading used inside a colored sidebar column. */
function sidebarHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 180, after: 70 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: sz(16),
        color: "FFFFFF",
        font: DOCX_FONT,
        characterSpacing: 14,
      }),
    ],
  });
}

function textParagraph(text: string, opts: { color?: string; size?: number; after?: number } = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 100 },
    children: [new TextRun({ text, size: sz(opts.size ?? 21), color: opts.color, font: DOCX_FONT })],
  });
}

/** Photo as an ImageRun sized to the user's chosen inches. Returns null if
 *  there's no photo, or if it fails to decode (never breaks the export). */
function photoImageRun(data: ResumeData): ImageRun | null {
  if (!data.photoDataUrl) return null;
  try {
    const imageBytes = dataUrlToUint8Array(data.photoDataUrl);
    const px = (data.photoSizeIn ?? 1) * 96;
    return new ImageRun({
      data: imageBytes,
      transformation: { width: px, height: px },
      type: "png",
    });
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------- */
/* Shared section content (experience / education / references)         */
/* -------------------------------------------------------------------- */

function experienceParagraphs(data: ResumeData, opts: { color?: string } = {}): Paragraph[] {
  const out: Paragraph[] = [];
  data.experience.forEach((exp) => {
    out.push(
      new Paragraph({
        spacing: { before: 120 },
        children: [
          new TextRun({ text: exp.role || "Role", bold: true, size: sz(22), color: opts.color }),
          new TextRun({
            text: `  —  ${exp.company || "Company"}${exp.location ? ", " + exp.location : ""}`,
            size: sz(21),
            color: opts.color,
          }),
        ],
      })
    );
    out.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `${exp.startDate} – ${exp.current ? "Present" : exp.endDate}`,
            italics: true,
            size: sz(19),
            color: "6B7280",
          }),
        ],
      })
    );
    exp.bullets
      .filter((b) => b.trim())
      .forEach((b) =>
        out.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [new TextRun({ text: b, size: sz(21), color: opts.color })],
          })
        )
      );
  });
  return out;
}

function educationParagraphs(data: ResumeData, opts: { color?: string } = {}): Paragraph[] {
  const out: Paragraph[] = [];
  data.education.forEach((edu) => {
    out.push(
      new Paragraph({
        spacing: { before: 80 },
        children: [
          new TextRun({ text: edu.degree || "Degree", bold: true, size: sz(22), color: opts.color }),
          new TextRun({
            text: `  —  ${edu.school || "School"}${edu.location ? ", " + edu.location : ""}`,
            size: sz(21),
            color: opts.color,
          }),
        ],
      })
    );
    out.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `${edu.startDate} – ${edu.endDate}`,
            italics: true,
            size: sz(19),
            color: "6B7280",
          }),
        ],
      })
    );
  });
  return out;
}

function referencesParagraphs(data: ResumeData): Paragraph[] {
  const out: Paragraph[] = [];
  data.references.forEach((r) => {
    out.push(
      new Paragraph({
        spacing: { before: 60 },
        children: [new TextRun({ text: r.name || "Reference", bold: true, size: sz(21) })],
      })
    );
    if (r.relation) {
      out.push(
        new Paragraph({
          children: [new TextRun({ text: r.relation, size: sz(20), color: "6B7280" })],
        })
      );
    }
    const contact = [r.phone, r.email].filter(Boolean).join("  |  ");
    if (contact) {
      out.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: contact, size: sz(20), color: "6B7280" })],
        })
      );
    }
  });
  return out;
}

/* -------------------------------------------------------------------- */
/* Layout 1 — ATS Classic (centered-classic)                             */
/* Centered header, small info-row strip, muted gray bar section labels  */
/* (this template deliberately ignores accent color to stay ATS-neutral, */
/* matching the on-screen template). */
/* -------------------------------------------------------------------- */

function buildAtsClassicBody(data: ResumeData): (Paragraph | Table)[] {
  const BAR_BG = "F1F1F3";
  const BAR_FG = "1B1F29";
  const out: (Paragraph | Table)[] = [];
  const photo = photoImageRun(data);

  const headerParas = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: [data.fullName || "Your Name", data.title].filter(Boolean).join(", "),
          bold: true,
          size: sz(32),
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: contactLine(data), size: sz(19), color: "6B7280" })],
    }),
  ];

  if (photo) {
    out.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: NO_BORDER,
          bottom: NO_BORDER,
          left: NO_BORDER,
          right: NO_BORDER,
          insideHorizontal: NO_BORDER,
          insideVertical: NO_BORDER,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 80, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: NO_CELL_BORDERS,
                children: headerParas,
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: NO_CELL_BORDERS,
                children: [
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [photo] }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  } else {
    out.push(...headerParas);
  }

  const p = data.personal;
  const infoRows: [string, string][] = [
    ["Date / Place of birth", [p.birthDate, p.placeOfBirth].filter(Boolean).join(", ")],
    ["Marital status", p.civilStatus],
    ["Nationality / Gender", [p.nationality, p.gender].filter(Boolean).join(" / ")],
  ].filter(([, v]) => v) as [string, string][];

  if (infoRows.length > 0) {
    infoRows.forEach(([label, value]) => {
      out.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 30 },
          border: { bottom: { color: "E5E7EB", space: 4, style: BorderStyle.SINGLE, size: 4 } },
          children: [
            new TextRun({ text: `${label}: `, bold: true, size: sz(19), color: "6B7280" }),
            new TextRun({ text: value, size: sz(19), color: "1B1F29" }),
          ],
        })
      );
    });
  }

  if (data.summary) {
    out.push(barHeading("Profile", BAR_BG, BAR_FG));
    out.push(textParagraph(data.summary));
  }
  if (data.experience.length > 0) {
    out.push(barHeading("Experience", BAR_BG, BAR_FG));
    out.push(...experienceParagraphs(data));
  }
  if (data.education.length > 0) {
    out.push(barHeading("Education", BAR_BG, BAR_FG));
    out.push(...educationParagraphs(data));
  }
  if (data.skills.length > 0) {
    out.push(barHeading("Skills", BAR_BG, BAR_FG));
    out.push(textParagraph(data.skills.join("   •   ")));
  }
  if (data.languages.length > 0) {
    out.push(barHeading("Languages", BAR_BG, BAR_FG));
    out.push(
      textParagraph(
        data.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join("   •   ")
      )
    );
  }
  if (data.certifications.length > 0) {
    out.push(barHeading("Certifications", BAR_BG, BAR_FG));
    out.push(textParagraph(data.certifications.join("   •   ")));
  }
  if (data.references.length > 0) {
    out.push(barHeading("References", BAR_BG, BAR_FG));
    out.push(...referencesParagraphs(data));
  }

  return out;
}

/* -------------------------------------------------------------------- */
/* Layout 2 — Clean List (banner-headers)                                */
/* Left-aligned header (+ optional photo top-right), accent-colored bars */
/* -------------------------------------------------------------------- */

function buildCleanListBody(data: ResumeData, template: ResumeTemplate): (Paragraph | Table)[] {
  const BAR_BG = template.accentSoft;
  const BAR_FG = template.accent;
  const out: (Paragraph | Table)[] = [];
  const photo = photoImageRun(data);

  const headerParas = [
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: data.fullName || "Your Name", bold: true, size: sz(30) })],
    }),
    ...(data.title
      ? [
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: data.title, size: sz(22), color: "525252" })],
          }),
        ]
      : []),
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: contactLine(data), size: sz(19), color: "6B7280" })],
    }),
  ];

  if (photo) {
    out.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: NO_BORDER,
          bottom: NO_BORDER,
          left: NO_BORDER,
          right: NO_BORDER,
          insideHorizontal: NO_BORDER,
          insideVertical: NO_BORDER,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 80, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: NO_CELL_BORDERS,
                children: headerParas,
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: NO_CELL_BORDERS,
                children: [
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [photo] }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  } else {
    out.push(...headerParas);
  }

  if (data.summary) {
    out.push(barHeading("Profile", BAR_BG, BAR_FG));
    out.push(textParagraph(data.summary));
  }
  if (data.experience.length > 0) {
    out.push(barHeading("Experience", BAR_BG, BAR_FG));
    data.experience.forEach((exp) => {
      out.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: "⬥ ", bold: true, size: sz(22) }),
            new TextRun({ text: `${exp.role || "Role"} — ${exp.company || "Company"}`, bold: true, size: sz(22) }),
          ],
        })
      );
      out.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.startDate} - ${exp.current ? "Current" : exp.endDate}`,
              size: sz(19),
              color: "6B7280",
            }),
          ],
        })
      );
      const bullets = exp.bullets.filter(Boolean).join(" ");
      if (bullets) {
        out.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: bullets, size: sz(21) })] }));
      }
    });
  }
  if (data.education.length > 0) {
    out.push(barHeading("Education", BAR_BG, BAR_FG));
    data.education.forEach((edu) => {
      out.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "⬥ ", bold: true, size: sz(21) }),
            new TextRun({ text: `${edu.degree || "Degree"}, ${edu.school || "School"}`, bold: true, size: sz(21) }),
            new TextRun({ text: `    ${edu.startDate} - ${edu.endDate}`, size: sz(19), color: "6B7280" }),
          ],
        })
      );
    });
  }
  if (data.skills.length > 0 || data.languages.length > 0) {
    out.push(barHeading("Skills", BAR_BG, BAR_FG));
    if (data.skills.length > 0) out.push(textParagraph(data.skills.join("   •   "), { after: 40 }));
    if (data.languages.length > 0) {
      out.push(
        textParagraph(data.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join("   •   "))
      );
    }
  }
  if (data.certifications.length > 0) {
    out.push(barHeading("Certifications", BAR_BG, BAR_FG));
    out.push(textParagraph(data.certifications.join("   •   ")));
  }
  if (data.references.length > 0) {
    out.push(barHeading("References", BAR_BG, BAR_FG));
    out.push(...referencesParagraphs(data));
  }

  return out;
}

/* -------------------------------------------------------------------- */
/* Layout 3 — Sidebar (sidebar-left-dark)                                */
/* Two-column table: colored left sidebar + white main column            */
/* -------------------------------------------------------------------- */

function buildSidebarBody(data: ResumeData, template: ResumeTemplate): (Paragraph | Table)[] {
  const accent = template.accent;
  const sidebarChildren: Paragraph[] = [];

  const photo = photoImageRun(data);
  if (photo) {
    sidebarChildren.push(new Paragraph({ spacing: { after: 120 }, children: [photo] }));
  }
  sidebarChildren.push(
    new Paragraph({
      spacing: { after: 20 },
      children: [new TextRun({ text: data.fullName || "Your Name", bold: true, size: sz(26), color: "FFFFFF" })],
    })
  );
  if (data.title) {
    sidebarChildren.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: data.title.toUpperCase(), size: sz(16), color: "F0F0F0", characterSpacing: 12 }),
        ],
      })
    );
  }

  if (data.email || data.phone || data.location || data.links) {
    sidebarChildren.push(sidebarHeading("Details"));
    [data.phone, data.email, data.location, data.links].filter(Boolean).forEach((v) => {
      sidebarChildren.push(
        new Paragraph({
          spacing: { after: 30 },
          children: [new TextRun({ text: v as string, size: sz(17), color: "FFFFFF" })],
        })
      );
    });
  }

  if (data.skills.length > 0) {
    sidebarChildren.push(sidebarHeading("Skills"));
    data.skills.forEach((s) => {
      sidebarChildren.push(
        new Paragraph({
          spacing: { after: 40 },
          border: { bottom: { color: "E0E0E0", space: 2, style: BorderStyle.SINGLE, size: 2 } },
          children: [new TextRun({ text: s, size: sz(17), color: "FFFFFF" })],
        })
      );
    });
  }

  if (data.languages.length > 0) {
    sidebarChildren.push(sidebarHeading("Language"));
    data.languages.forEach((l) => {
      sidebarChildren.push(
        new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: l.name, size: sz(17), color: "FFFFFF" })],
        })
      );
    });
  }

  if (data.certifications.length > 0) {
    sidebarChildren.push(sidebarHeading("Certifications"));
    data.certifications.forEach((c) => {
      sidebarChildren.push(
        new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: c, size: sz(17), color: "FFFFFF" })],
        })
      );
    });
  }

  const mainChildren: Paragraph[] = [];
  if (data.summary) {
    mainChildren.push(ruleHeading("Profile", accent));
    mainChildren.push(textParagraph(data.summary));
  }
  if (data.experience.length > 0) {
    mainChildren.push(ruleHeading("Employment History", accent));
    mainChildren.push(...experienceParagraphs(data));
  }
  if (data.education.length > 0) {
    mainChildren.push(ruleHeading("Education", accent));
    mainChildren.push(...educationParagraphs(data));
  }
  if (data.references.length > 0) {
    mainChildren.push(ruleHeading("References", accent));
    mainChildren.push(...referencesParagraphs(data));
  }
  if (mainChildren.length === 0) {
    // A table cell can't be empty in docx — keep the column present even
    // if the user hasn't filled in any main-column content yet.
    mainChildren.push(new Paragraph({ children: [] }));
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: hex(accent) },
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            borders: NO_CELL_BORDERS,
            children: sidebarChildren,
          }),
          new TableCell({
            width: { size: 66, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 200, bottom: 200, left: 260, right: 200 },
            borders: NO_CELL_BORDERS,
            children: mainChildren,
          }),
        ],
      }),
    ],
  });

  return [table];
}

/* -------------------------------------------------------------------- */
/* Generic fallback (any layout not covered above)                       */
/* -------------------------------------------------------------------- */

function buildGenericBody(data: ResumeData, template: ResumeTemplate): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  const photo = photoImageRun(data);

  const headerParas = [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: data.fullName || "Your Name", bold: true, size: sz(40), color: hex(template.accent) }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: data.title || "", size: sz(24), color: "444444" })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { color: "CCCCCC", space: 4, style: BorderStyle.SINGLE, size: 4 } },
      children: [new TextRun({ text: contactLine(data), size: sz(19), color: "555555" })],
    }),
  ];

  if (photo) {
    out.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: NO_BORDER,
          bottom: NO_BORDER,
          left: NO_BORDER,
          right: NO_BORDER,
          insideHorizontal: NO_BORDER,
          insideVertical: NO_BORDER,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 80, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: NO_CELL_BORDERS,
                children: headerParas,
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: NO_CELL_BORDERS,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [photo] })],
              }),
            ],
          }),
        ],
      })
    );
  } else {
    out.push(...headerParas);
  }

  if (data.summary) {
    out.push(ruleHeading("Summary", template.accent));
    out.push(textParagraph(data.summary));
  }
  if (data.experience.length > 0) {
    out.push(ruleHeading("Experience", template.accent));
    out.push(...experienceParagraphs(data));
  }
  if (data.education.length > 0) {
    out.push(ruleHeading("Education", template.accent));
    out.push(...educationParagraphs(data));
  }
  if (data.skills.length > 0) {
    out.push(ruleHeading("Skills", template.accent));
    out.push(textParagraph(data.skills.join("   •   ")));
  }
  if (data.certifications.length > 0) {
    out.push(ruleHeading("Certifications", template.accent));
    out.push(textParagraph(data.certifications.join("   •   ")));
  }
  if (data.languages.length > 0) {
    out.push(ruleHeading("Languages", template.accent));
    out.push(
      textParagraph(data.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join("   •   "))
    );
  }
  if (data.references.length > 0) {
    out.push(ruleHeading("References", template.accent));
    out.push(...referencesParagraphs(data));
  }

  return out;
}

export async function generateDocx(
  data: ResumeData,
  template: ResumeTemplate,
  paperSize: PaperSize = paperSizes.letter,
  font: FontOption = fonts[0],
  fontSize: FontSizeOption = fontSizeOptions[1]
): Promise<Blob> {
  DOCX_FONT = font.docxName;
  DOCX_SCALE = fontSize.scale;

  let children: (Paragraph | Table)[];

  switch (template.layout) {
    case "centered-classic":
      children = buildAtsClassicBody(data);
      break;
    case "banner-headers":
      children = buildCleanListBody(data, template);
      break;
    case "sidebar-left-dark":
      children = buildSidebarBody(data, template);
      break;
    default:
      children = buildGenericBody(data, template);
  }

  // The sidebar layout renders its own colored column as a full-width
  // table with internal cell margins, so its color needs to reach the
  // page edge exactly like it does on screen — zero page margin. Every
  // other layout is plain text and needs a normal page margin so lines
  // don't run edge-to-edge.
  const pageMargin =
    template.layout === "sidebar-left-dark"
      ? { top: 620, bottom: 620, left: 0, right: 0 }
      : { top: 720, bottom: 720, left: 860, right: 860 };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: DOCX_FONT,
            size: sz(22),
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: pageMargin,
            size: {
              width: convertInchesToTwip(paperSize.widthIn),
              height: convertInchesToTwip(paperSize.heightIn),
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
