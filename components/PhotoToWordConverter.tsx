"use client";

import { useRef, useState } from "react";
import { ResumeData } from "@/lib/types";
import { emptyData } from "@/lib/sampleData";
import { plainTemplate } from "@/lib/templates";
import { parseResumeText, ParsedResume } from "@/lib/parseResumeText";
import { generateDocx, downloadBlob } from "@/lib/docxGenerator";
import {
  ArrowLeft,
  ImageUp,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Pencil,
  RotateCcw,
} from "lucide-react";

interface PhotoToWordConverterProps {
  onBack: () => void;
  /** Hand the parsed data off to the full editor (plain template preselected) for further tweaks. */
  onContinueEditing: (data: ResumeData) => void;
}

type Stage = "idle" | "scanning" | "done" | "error";

export default function PhotoToWordConverter({
  onBack,
  onContinueEditing,
}: PhotoToWordConverterProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedResume | null>(null);
  const [rawText, setRawText] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setPreview(null);
    setResult(null);
    setRawText("");
    setDownloaded(false);
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
      setResult(parseResumeText(ocrResult.text));
      setStage("done");
    } catch (err) {
      console.error(err);
      setStage("error");
    }
  };

  const mergedData = (): ResumeData => ({ ...emptyData, ...(result?.data ?? {}) });

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const merged = mergedData();
      const blob = await generateDocx(merged, plainTemplate);
      const filename = `${(merged.fullName || "resume").replace(/\s+/g, "_")}.docx`;
      downloadBlob(blob, filename);
      setDownloaded(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="flex h-screen w-full flex-col bg-ink-900">
      <div className="flex items-center gap-3 border-b border-ink-700 px-6 py-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-md border border-ink-700 px-2.5 py-1.5 text-[12px] text-paper-200 hover:border-ink-600 hover:bg-ink-800"
        >
          <ArrowLeft size={13} />
          Templates
        </button>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold tracking-tight text-paper-100">
            Convert photo to Word
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
            No template needed
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex max-w-xl flex-col gap-5">
          <p className="text-[12px] leading-snug text-ink-600">
            Upload a clear photo or scan of your old resume. We&apos;ll read
            the text and hand you back an editable Word (.docx) file laid out
            plainly — as close to your original as OCR allows — so you can
            open it and make a quick revision, no template required.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {stage === "idle" && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-700 py-14 text-[13px] text-ink-600 hover:border-ink-600 hover:bg-ink-800"
            >
              <ImageUp size={22} />
              Upload resume photo
            </button>
          )}

          {preview && stage !== "idle" && (
            <div className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-800/40 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Old resume upload"
                className="h-16 w-16 rounded-md border border-ink-700 object-cover"
              />
              <div className="flex-1">
                {stage === "scanning" && (
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[12px] text-paper-200">
                      <Loader2 size={13} className="animate-spin" />
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
                  <div className="flex items-center gap-1.5 text-[12px] text-signal">
                    <CheckCircle2 size={14} />
                    Text extracted — review below before downloading
                  </div>
                )}
                {stage === "error" && (
                  <div className="flex items-center gap-1.5 text-[12px] text-stamp-light">
                    <AlertTriangle size={14} />
                    Couldn&apos;t read that photo. Try a clearer, well-lit shot.
                  </div>
                )}
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1 text-[11px] text-ink-600 hover:text-stamp-light"
              >
                <RotateCcw size={13} />
                Retry
              </button>
            </div>
          )}

          {stage === "done" && result && (
            <div className="flex flex-col gap-3 rounded-lg border border-ink-700 bg-ink-800/40 p-4">
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
                <pre className="mt-2 max-h-[200px] overflow-y-auto whitespace-pre-wrap rounded-md border border-ink-700 bg-ink-950 p-2 text-[10.5px] text-paper-200">
                  {rawText || "No text found."}
                </pre>
              </details>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1.5 rounded-md bg-stamp px-3.5 py-2 text-[12px] font-semibold text-paper-100 hover:bg-stamp-light disabled:opacity-60"
                >
                  {downloading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <FileDown size={13} />
                  )}
                  Download as Word doc
                </button>
                <button
                  onClick={() => onContinueEditing(mergedData())}
                  className="flex items-center gap-1.5 rounded-md border border-ink-700 px-3.5 py-2 text-[12px] font-semibold text-paper-200 hover:border-ink-600 hover:bg-ink-800"
                >
                  <Pencil size={13} />
                  Fix details in the editor first
                </button>
              </div>
              {downloaded && (
                <p className="text-[10.5px] text-signal">
                  Downloaded. Since OCR can misread handwriting or blurry
                  photos, open the .docx in Word and double-check dates and
                  names before sending it out.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
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
