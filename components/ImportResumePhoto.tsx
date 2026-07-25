"use client";

import { useRef, useState } from "react";
import { ResumeData, ResumeTemplate } from "@/lib/types";
import { parseResumeText, ParsedResume } from "@/lib/parseResumeText";
import { generateDocx, downloadBlob } from "@/lib/docxGenerator";
import {
  ScanText,
  ImageUp,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  FileDown,
} from "lucide-react";

interface ImportResumePhotoProps {
  /** Current resume data — used as the base that OCR fields are merged into for the direct docx export. */
  data: ResumeData;
  template: ResumeTemplate;
  onApply: (data: Partial<ResumeData>) => void;
}

type Stage = "idle" | "scanning" | "done" | "error";

export default function ImportResumePhoto({
  data,
  template,
  onApply,
}: ImportResumePhotoProps) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedResume | null>(null);
  const [rawText, setRawText] = useState("");
  const [applied, setApplied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setPreview(null);
    setResult(null);
    setRawText("");
    setApplied(false);
  };

  const handleFile = async (file: File) => {
    reset();
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setStage("scanning");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data: ocrResult } = await worker.recognize(file);
      await worker.terminate();

      setRawText(ocrResult.text);
      const parsed = parseResumeText(ocrResult.text);
      setResult(parsed);
      setStage("done");
    } catch (err) {
      console.error(err);
      setStage("error");
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result.data);
    setApplied(true);
  };

  const handleDownloadDocx = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const merged: ResumeData = { ...data, ...result.data };
      const blob = await generateDocx(merged, template);
      const filename = `${(merged.fullName || "resume").replace(/\s+/g, "_")}_${template.id}.docx`;
      downloadBlob(blob, filename);
      // Also reflect the parsed fields in the on-screen form so the download
      // and the visible preview stay in sync if the user keeps editing.
      onApply(result.data);
      setApplied(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-800/40 p-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <button
        onClick={() => {
          setOpen((o) => !o);
        }}
        className="flex w-full items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 font-display text-[13px] font-semibold text-paper-100">
          <ScanText size={15} className="text-signal" />
          Import from an old resume photo
        </span>
        <span className="text-[11px] text-ink-600">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-[11px] leading-snug text-ink-600">
            Upload a clear photo or scan of an old resume and we&apos;ll turn
            it into an editable Word (.docx) file, formatted with your chosen
            template. Review everything before sending it out, since
            handwriting or blurry photos can throw off the reading.
          </p>

          {stage === "idle" && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-md border border-dashed border-ink-700 py-4 text-[12px] text-ink-600 hover:border-ink-600 hover:bg-ink-800"
            >
              <ImageUp size={15} />
              Upload resume photo
            </button>
          )}

          {preview && stage !== "idle" && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Old resume upload"
                className="h-16 w-16 rounded-md border border-ink-700 object-cover"
              />
              <div className="flex-1">
                {stage === "scanning" && (
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[11px] text-paper-200">
                      <Loader2 size={12} className="animate-spin" />
                      Reading text… {progress}%
                    </span>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-ink-700">
                      <div
                        className="h-full bg-signal transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {stage === "done" && result && (
                  <div className="flex items-center gap-1.5 text-[11px] text-signal">
                    <CheckCircle2 size={13} />
                    Text extracted — review below
                  </div>
                )}
                {stage === "error" && (
                  <div className="flex items-center gap-1.5 text-[11px] text-stamp-light">
                    <AlertTriangle size={13} />
                    Couldn&apos;t read that photo. Try a clearer, well-lit shot.
                  </div>
                )}
              </div>
              <button
                onClick={reset}
                className="text-ink-600 hover:text-stamp-light"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {stage === "done" && result && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5 text-[10.5px]">
                <FoundTag ok={result.foundCounts.name} label="Name" />
                <FoundTag ok={result.foundCounts.email} label="Email" />
                <FoundTag ok={result.foundCounts.phone} label="Phone" />
                <FoundTag
                  ok={result.foundCounts.experience > 0}
                  label={`${result.foundCounts.experience} job(s)`}
                />
                <FoundTag
                  ok={result.foundCounts.education > 0}
                  label={`${result.foundCounts.education} school(s)`}
                />
                <FoundTag
                  ok={result.foundCounts.skills > 0}
                  label={`${result.foundCounts.skills} skill(s)`}
                />
              </div>

              <details className="text-[11px] text-ink-600">
                <summary className="cursor-pointer hover:text-paper-200">
                  View raw extracted text
                </summary>
                <pre className="mt-2 max-h-[160px] overflow-y-auto whitespace-pre-wrap rounded-md border border-ink-700 bg-ink-950 p-2 text-[10.5px] text-paper-200">
                  {rawText || "No text found."}
                </pre>
              </details>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownloadDocx}
                  disabled={downloading}
                  className="flex items-center gap-1.5 rounded-md bg-stamp px-3 py-1.5 text-[11px] font-semibold text-paper-100 hover:bg-stamp-light disabled:opacity-60"
                >
                  {downloading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <FileDown size={12} />
                  )}
                  Download as Word doc
                </button>
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-[11px] font-semibold text-paper-200 hover:border-ink-600 hover:bg-ink-800"
                >
                  {applied ? "Re-apply to form" : "Apply to form only"}
                </button>
              </div>
              <p className="text-[10.5px] leading-snug text-ink-600">
                {applied
                  ? "Applied — scroll down to check and fix each section, since OCR can misread handwriting or blurry text."
                  : "\"Download as Word doc\" also fills in the form below so you can review or fix anything OCR got wrong, then re-download."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FoundTag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 ${
        ok
          ? "bg-signal/15 text-signal"
          : "bg-ink-700/60 text-ink-600 line-through"
      }`}
    >
      {label}
    </span>
  );
}
