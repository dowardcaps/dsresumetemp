import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
  VerticalAlign,
} from "docx";
import { ResumeData, ResumeTemplate } from "./types";
import { dataUrlToUint8Array } from "./imageUtils";

const hex = (h: string) => h.replace("#", "");

function contactLine(data: ResumeData): string {
  return [data.email, data.phone, data.location, data.links]
    .filter(Boolean)
    .join("   |   ");
}

function sectionHeading(text: string, accent: string): Paragraph {
  return new Paragraph({
    spacing: { before: 260, after: 100 },
    border: {
      bottom: {
        color: hex(accent),
        space: 2,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 20,
        color: hex(accent),
        font: "Calibri",
        characterSpacing: 20,
      }),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 21 })],
  });
}

function buildBody(data: ResumeData, template: ResumeTemplate): Paragraph[] {
  const body: Paragraph[] = [];

  const personalRows: [string, string][] = (
    [
      ["Birth date", data.personal.birthDate],
      ["Place of birth", data.personal.placeOfBirth],
      ["Age", data.personal.age],
      ["Gender", data.personal.gender],
      ["Civil status", data.personal.civilStatus],
      ["Nationality", data.personal.nationality],
      ["Religion", data.personal.religion],
      ["Height", data.personal.height ? `${data.personal.height}cm` : ""],
      ["Weight", data.personal.weight ? `${data.personal.weight}kg` : ""],
    ] as [string, string][]
  ).filter(([, v]) => v);

  if (personalRows.length > 0) {
    body.push(sectionHeading("Personal Information", template.accent));
    personalRows.forEach(([label, value]) => {
      body.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${label}: `, bold: true, size: 21 }),
            new TextRun({ text: value, size: 21 }),
          ],
        })
      );
    });
  }

  if (data.summary) {
    body.push(sectionHeading("Summary", template.accent));
    body.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: data.summary, size: 21 })],
      })
    );
  }

  if (data.experience.length > 0) {
    body.push(sectionHeading("Experience", template.accent));
    data.experience.forEach((exp) => {
      body.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: exp.role, bold: true, size: 22 }),
            new TextRun({
              text: `  —  ${exp.company}${exp.location ? ", " + exp.location : ""}`,
              size: 21,
            }),
          ],
        })
      );
      body.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${exp.startDate} – ${exp.current ? "Present" : exp.endDate}`,
              italics: true,
              size: 19,
              color: "555555",
            }),
          ],
        })
      );
      exp.bullets
        .filter((b) => b.trim())
        .forEach((b) => body.push(bulletParagraph(b)));
    });
  }

  if (data.education.length > 0) {
    body.push(sectionHeading("Education", template.accent));
    data.education.forEach((edu) => {
      body.push(
        new Paragraph({
          spacing: { before: 80 },
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22 }),
            new TextRun({
              text: `  —  ${edu.school}${edu.location ? ", " + edu.location : ""}`,
              size: 21,
            }),
          ],
        })
      );
      body.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${edu.startDate} – ${edu.endDate}`,
              italics: true,
              size: 19,
              color: "555555",
            }),
          ],
        })
      );
    });
  }

  if (data.skills.length > 0) {
    body.push(sectionHeading("Skills", template.accent));
    body.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: data.skills.join("   •   "), size: 21 })],
      })
    );
  }

  if (data.certifications.length > 0) {
    body.push(sectionHeading("Certifications / Training", template.accent));
    data.certifications.forEach((c) =>
      body.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: c, size: 21 })],
        })
      )
    );
  }

  if (data.languages.length > 0) {
    body.push(sectionHeading("Languages", template.accent));
    body.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: data.languages
              .map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`)
              .join("   •   "),
            size: 21,
          }),
        ],
      })
    );
  }

  if (data.references.length > 0) {
    body.push(sectionHeading("References", template.accent));
    data.references.forEach((r) => {
      body.push(
        new Paragraph({
          spacing: { before: 60 },
          children: [new TextRun({ text: r.name || "Reference", bold: true, size: 21 })],
        })
      );
      if (r.relation) {
        body.push(
          new Paragraph({
            children: [new TextRun({ text: r.relation, size: 20, color: "555555" })],
          })
        );
      }
      const contact = [r.phone, r.email].filter(Boolean).join("  |  ");
      if (contact) {
        body.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: contact, size: 20, color: "555555" })],
          })
        );
      }
    });
  }

  return body;
}

export async function generateDocx(
  data: ResumeData,
  template: ResumeTemplate
): Promise<Blob> {
  const header = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.fullName || "Your Name",
          bold: true,
          size: 40,
          color: hex(template.accent),
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: data.title || "", size: 24, color: "444444" }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: {
        bottom: { color: "CCCCCC", space: 4, style: BorderStyle.SINGLE, size: 4 },
      },
      children: [
        new TextRun({ text: contactLine(data), size: 19, color: "555555" }),
      ],
    }),
  ];

  const body = buildBody(data, template);

  let headerBlock: (Paragraph | Table)[] = header;

  if (data.photoDataUrl) {
    try {
      const imageBytes = dataUrlToUint8Array(data.photoDataUrl);
      const photoSizePx = (data.photoSizeIn ?? 1) * 96;
      const photoCell = new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new ImageRun({
                data: imageBytes,
                transformation: { width: photoSizePx, height: photoSizePx },
                type: "png",
              }),
            ],
          }),
        ],
      });

      const textCell = new TableCell({
        width: { size: 80, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        children: header,
      });

      const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [textCell, photoCell] })],
      });

      headerBlock = [headerTable];
    } catch {
      // If the photo fails to decode for any reason, fall back to a
      // text-only header rather than failing the whole export.
      headerBlock = header;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children: [...headerBlock, ...body],
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
