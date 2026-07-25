"use client";

import { useState } from "react";
import { templates, getTemplate } from "@/lib/templates";
import { sampleData } from "@/lib/sampleData";
import { ResumeData } from "@/lib/types";
import TemplateGallery from "@/components/TemplateGallery";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";
import { generateDocx, downloadBlob } from "@/lib/docxGenerator";
import {
  ArrowLeft,
  LayoutTemplate,
  Download,
  Printer as PrinterIcon,
  Loader2,
} from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<"gallery" | "edit">("gallery");
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [data, setData] = useState<ResumeData>(sampleData);
  const [exporting, setExporting] = useState(false);

  const template = getTemplate(templateId);

  const handleSelectTemplate = (id: string) => {
    setTemplateId(id);
    setStep("edit");
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const blob = await generateDocx(data, template);
      const filename = `${(data.fullName || "resume").replace(/\s+/g, "_")}_${template.id}.docx`;
      downloadBlob(blob, filename);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (step === "gallery") {
    return (
      <main className="h-screen w-full">
        <TemplateGallery templates={templates} onSelect={handleSelectTemplate} />
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col bg-ink-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 px-5 py-3 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("gallery")}
            className="flex items-center gap-1.5 rounded-md border border-ink-700 px-2.5 py-1.5 text-[12px] text-paper-200 hover:border-ink-600 hover:bg-ink-800"
          >
            <ArrowLeft size={13} />
            Templates
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: template.accent }}
            />
            <span className="font-display text-[13px] font-semibold text-paper-100">
              {template.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="rounded-md border border-ink-700 bg-ink-800 px-2.5 py-1.5 text-[12px] text-paper-200 outline-none"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-[12px] text-paper-200 hover:border-ink-600 hover:bg-ink-800"
          >
            <PrinterIcon size={13} />
            Save as PDF
          </button>
          <button
            onClick={handleExportDocx}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-md bg-stamp px-3 py-1.5 text-[12px] font-semibold text-paper-100 transition-colors hover:bg-stamp-light disabled:opacity-60"
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
        <div className="min-h-0 w-full border-b border-ink-700 md:w-[420px] md:min-w-[420px] md:border-b-0 md:border-r print:hidden">
          <ResumeForm data={data} onChange={setData} />
        </div>
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto bg-ink-950 px-6 py-8">
          <div className="w-full max-w-[560px]">
            <div className="mb-3 flex items-center gap-2 print:hidden">
              <LayoutTemplate size={13} className="text-ink-600" />
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-600">
                Live preview
              </p>
            </div>
            <ResumePreview data={data} template={template} />
          </div>
        </div>
      </div>
    </main>
  );
}
