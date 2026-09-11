"use client";

import { useState } from "react";
import { templates, getTemplate } from "@/lib/templates";
import { sampleData, emptyData } from "@/lib/sampleData";
import { ResumeData, ResumeTemplate } from "@/lib/types";
import { tintHex } from "@/lib/color";
import TemplatePicker from "@/components/TemplatePicker";
import ThemeColorPicker from "@/components/ThemeColorPicker";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";
import { generateDocx, downloadBlob } from "@/lib/docxGenerator";
import { paperSizeList, getPaperSize, getPreviewWidthPx, PaperSizeId } from "@/lib/paperSizes";
import { fonts, getFont, FontId } from "@/lib/fonts";
import { fontSizes, getFontSize, FontSizeId } from "@/lib/fontSizes";
import {
  LayoutTemplate,
  Download,
  Printer as PrinterIcon,
  Loader2,
  RotateCcw,
  Palette,
  Ruler,
  Type,
  ALargeSmall,
} from "lucide-react";

export default function Home() {
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [data, setData] = useState<ResumeData>(sampleData);
  const [exporting, setExporting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [paperSizeId, setPaperSizeId] = useState<PaperSizeId>("letter");
  const [fontId, setFontId] = useState<FontId>("calibri");
  const [fontSizeId, setFontSizeId] = useState<FontSizeId>("medium");

  const template = getTemplate(templateId);
  const paperSize = getPaperSize(paperSizeId);
  const font = getFont(fontId);
  const fontSize = getFontSize(fontSizeId);

  // Reference width for the largest supported paper (Letter/Folio) — other
  // formats scale down from this so the live preview's relative sizing
  // matches the real printed page, not just each page's own aspect ratio.
  const previewWidthPx = getPreviewWidthPx(paperSize, 560);

  // Drives @page size and the printed #resume-sheet dimensions. Kept as a
  // targeted inline style (rather than a fixed rule in globals.css) since
  // the paper size is a runtime choice, not a build-time constant.
  const printCss = `@media print {
    @page { size: ${paperSize.widthIn}in ${paperSize.heightIn}in; margin: 0; }
    #resume-sheet { width: ${paperSize.widthIn}in; min-height: ${paperSize.heightIn}in; }
  }`;

  // A user-picked accent color overrides the template's built-in accent.
  // We only derive the soft tint automatically, so the picker only needs
  // one control.
  const activeTemplate: ResumeTemplate = data.accentColor
    ? {
        ...template,
        accent: data.accentColor,
        accentSoft: tintHex(data.accentColor, 0.85),
      }
    : template;

  const handleSelectTemplate = (id: string) => {
    setTemplateId(id);
    // A custom color was picked for the previous template's palette —
    // clear it so the newly chosen template shows its own default look.
    setData((prev) => ({ ...prev, accentColor: undefined }));
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const blob = await generateDocx(data, activeTemplate, paperSize, font, fontSize);
      const filename = `${(data.fullName || "resume").replace(/\s+/g, "_")}_${template.id}.docx`;
      downloadBlob(blob, filename);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleStartBlank = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear all fields and start a blank resume? This can't be undone.")
    ) {
      return;
    }
    setData({ ...emptyData });
  };

  return (
    <main className="flex h-screen w-full flex-col bg-ink-800">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 bg-stamp px-5 py-3 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-white/30 px-2.5 py-1.5 text-[12px] text-white hover:border-white/60 hover:bg-stamp-light"
          >
            <LayoutTemplate size={13} />
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: activeTemplate.accent }}
            />
            {template.name}
          </button>
          <button
            onClick={() => setColorPickerOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-white/30 px-2.5 py-1.5 text-[12px] text-white hover:border-white/60 hover:bg-stamp-light"
          >
            <Palette size={13} />
            <span
              className="h-3.5 w-3.5 rounded-full border border-white/50"
              style={{ backgroundColor: activeTemplate.accent }}
            />
            Color
          </button>
          <button
            onClick={handleStartBlank}
            className="flex items-center gap-1.5 rounded-md border border-white/30 px-2.5 py-1.5 text-[12px] text-white hover:border-white/60 hover:bg-stamp-light"
          >
            <RotateCcw size={13} />
            New / Clear
          </button>
          <label className="flex items-center gap-1.5 rounded-md border border-white/30 px-2.5 py-1.5 text-[12px] text-white hover:border-white/60 hover:bg-stamp-light">
            <Ruler size={13} />
            <select
              value={paperSizeId}
              onChange={(e) => setPaperSizeId(e.target.value as PaperSizeId)}
              className="cursor-pointer appearance-none bg-transparent text-[12px] text-white outline-none [&>option]:bg-white [&>option]:text-ink-900"
            >
              {paperSizeList.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 rounded-md border border-white/30 px-2.5 py-1.5 text-[12px] text-white hover:border-white/60 hover:bg-stamp-light">
            <Type size={13} />
            <select
              value={fontId}
              onChange={(e) => setFontId(e.target.value as FontId)}
              className="cursor-pointer appearance-none bg-transparent text-[12px] text-white outline-none [&>option]:bg-white [&>option]:text-ink-900"
            >
              {fonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 rounded-md border border-white/30 px-2.5 py-1.5 text-[12px] text-white hover:border-white/60 hover:bg-stamp-light">
            <ALargeSmall size={13} />
            <select
              value={fontSizeId}
              onChange={(e) => setFontSizeId(e.target.value as FontSizeId)}
              className="cursor-pointer appearance-none bg-transparent text-[12px] text-white outline-none [&>option]:bg-white [&>option]:text-ink-900"
            >
              {fontSizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 rounded-md border border-white/30 px-3 py-1.5 text-[12px] text-white hover:border-white/60 hover:bg-stamp-light"
          >
            <PrinterIcon size={13} />
            Print
          </button>
          <button
            onClick={handleExportDocx}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[12px] font-semibold text-stamp transition-colors hover:bg-paper-300 disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            Download DOCX
          </button>
        </div>
      </div>

      {/* Form + Preview split */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 w-full border-b border-ink-700 bg-white md:w-[420px] md:min-w-[420px] md:border-b-0 md:border-r print:hidden">
          <ResumeForm data={data} onChange={setData} />
        </div>
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto bg-ink-900 px-6 py-8">
          <div className="w-full" style={{ maxWidth: previewWidthPx }}>
            <div className="mb-3 flex items-center gap-2 print:hidden">
              <LayoutTemplate size={13} className="text-stamp/70" />
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-stamp/70">
                Live preview
              </p>
            </div>
            <ResumePreview
              data={data}
              template={activeTemplate}
              paperSize={paperSize}
              font={font}
              fontSize={fontSize}
            />
          </div>
        </div>
      </div>

      {pickerOpen && (
        <TemplatePicker
          templates={templates}
          selectedId={templateId}
          onSelect={handleSelectTemplate}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {colorPickerOpen && (
        <ThemeColorPicker
          color={activeTemplate.accent}
          defaultColor={template.accent}
          isCustom={Boolean(data.accentColor)}
          onChange={(hex) => setData((prev) => ({ ...prev, accentColor: hex }))}
          onReset={() => setData((prev) => ({ ...prev, accentColor: undefined }))}
          onClose={() => setColorPickerOpen(false)}
        />
      )}
    </main>
  );
}
