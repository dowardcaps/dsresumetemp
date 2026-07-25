"use client";

import { ResumeTemplate } from "@/lib/types";
import { FileText, Printer } from "lucide-react";

interface TemplateGalleryProps {
  templates: ResumeTemplate[];
  onSelect: (id: string) => void;
}

function Lines({ color = "bg-paper-300" }: { color?: string }) {
  return (
    <>
      <div className={`h-1 w-full rounded-full ${color}`} />
      <div className={`h-1 w-full rounded-full ${color}`} />
      <div className={`h-1 w-2/3 rounded-full ${color}`} />
    </>
  );
}

function MiniPreview({ template }: { template: ResumeTemplate }) {
  const layout = template.layout;

  // Sidebar on the left (dark, colored fill)
  if (layout === "sidebar-left-dark") {
    return (
      <div className="flex h-full w-full overflow-hidden rounded-md bg-white">
        <div
          className="flex h-full w-[34%] flex-col items-center gap-1.5 p-2"
          style={{ backgroundColor: template.accent }}
        >
          <div className="h-4 w-4 rounded-full bg-white/70" />
          <div className="h-1 w-3/4 rounded-full bg-white/40" />
          <div className="mt-1.5 h-1 w-full rounded-full bg-white/30" />
          <div className="h-1 w-full rounded-full bg-white/30" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="h-1.5 w-3/4 rounded-full bg-ink-300" />
          <div className="mt-1.5 flex flex-col gap-1">
            <Lines />
          </div>
        </div>
      </div>
    );
  }

  // Sidebar on the right (dark)
  if (layout === "sidebar-right-dark") {
    return (
      <div className="flex h-full w-full overflow-hidden rounded-md bg-white">
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="h-4 w-4 rounded-full bg-ink-300" />
          <div className="h-1.5 w-3/4 rounded-full bg-ink-300" />
          <div className="mt-1.5 flex flex-col gap-1">
            <Lines />
          </div>
        </div>
        <div
          className="flex h-full w-[32%] flex-col gap-1.5 p-2"
          style={{ backgroundColor: template.accent }}
        >
          <div className="h-1 w-full rounded-full bg-white/40" />
          <div className="h-1 w-3/4 rounded-full bg-white/30" />
          <div className="mt-1.5 h-1 w-full rounded-full bg-white/30" />
        </div>
      </div>
    );
  }

  // Sidebar on the right (light tint)
  if (layout === "sidebar-right-light") {
    return (
      <div className="flex h-full w-full overflow-hidden rounded-md bg-white">
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="flex items-center gap-1">
            <div className="h-3.5 w-3.5 rounded-full bg-ink-300" />
            <div className="h-1.5 w-1/2 rounded-full bg-ink-300" />
          </div>
          <div className="mt-1.5 flex flex-col gap-1">
            <Lines />
          </div>
        </div>
        <div
          className="flex h-full w-[30%] flex-col gap-1.5 p-2"
          style={{ backgroundColor: template.accentSoft }}
        >
          <div
            className="h-1 w-full rounded-full"
            style={{ backgroundColor: template.accent }}
          />
          <div className="h-1 w-3/4 rounded-full bg-ink-300/40" />
        </div>
      </div>
    );
  }

  // Photo top-right header (blue name)
  if (layout === "photo-top-header") {
    return (
      <div className="flex h-full w-full flex-col gap-1.5 overflow-hidden rounded-md bg-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div
              className="h-1.5 w-16 rounded-full"
              style={{ backgroundColor: template.accent }}
            />
            <div className="h-1 w-12 rounded-full bg-ink-300" />
          </div>
          <div className="h-4 w-4 shrink-0 rounded-sm bg-ink-300" />
        </div>
        <div
          className="mt-1 h-[2px] w-full rounded-full"
          style={{ backgroundColor: template.accent }}
        />
        <Lines />
      </div>
    );
  }

  // Block photo header (bold blocks, black bars)
  if (layout === "block-photo-header") {
    return (
      <div className="flex h-full w-full flex-col gap-1.5 overflow-hidden rounded-md bg-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-4 w-4 shrink-0 rounded-sm bg-ink-300" />
          <div className="flex flex-col items-end gap-1">
            <div className="h-1.5 w-16 rounded-full bg-ink-300" />
            <div className="h-1 w-10 rounded-full bg-ink-300/60" />
          </div>
        </div>
        <div
          className="mt-1 h-2 w-full rounded-sm"
          style={{ backgroundColor: template.accent }}
        />
        <div className="h-1 w-full rounded-full bg-paper-300" />
        <div className="h-1 w-2/3 rounded-full bg-paper-300" />
      </div>
    );
  }

  // Block header block (sage/colored block at top, no photo)
  if (layout === "block-header-single") {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-white">
        <div
          className="flex flex-col gap-1 p-2.5"
          style={{ backgroundColor: template.accentSoft }}
        >
          <div className="h-1.5 w-2/3 rounded-full bg-ink-500/40" />
          <div className="h-1 w-1/2 rounded-full bg-ink-500/25" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <Lines />
        </div>
      </div>
    );
  }

  // Banner headers (gray bar section labels)
  if (layout === "banner-headers") {
    return (
      <div className="flex h-full w-full flex-col gap-1.5 overflow-hidden rounded-md bg-white p-3">
        <div className="h-1.5 w-2/3 rounded-full bg-ink-300" />
        <div className="h-1 w-1/3 rounded-full bg-ink-300/60" />
        <div
          className="mt-1.5 h-2 w-full rounded-sm"
          style={{ backgroundColor: template.accentSoft }}
        />
        <div className="h-1 w-full rounded-full bg-paper-300" />
        <div className="h-1 w-2/3 rounded-full bg-paper-300" />
      </div>
    );
  }

  // Formal PH — bordered box with a tall photo on the left
  if (layout === "formal-ph") {
    return (
      <div
        className="flex h-full w-full overflow-hidden rounded-md border-4 bg-white p-1.5"
        style={{ borderColor: template.accentSoft }}
      >
        <div className="flex h-full w-[36%] flex-col gap-1 border p-1" style={{ borderColor: template.accent }}>
          <div className="aspect-[3/4] w-full rounded-sm bg-ink-300" />
          <div className="h-1 w-full rounded-full bg-ink-300/50" />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-1.5">
          <div className="h-1.5 w-full rounded-full bg-ink-300" />
          <div className="mt-1 h-1 w-full rounded-full bg-paper-300" />
          <div className="h-1 w-full rounded-full bg-paper-300" />
          <div className="h-1 w-2/3 rounded-full bg-paper-300" />
        </div>
      </div>
    );
  }

  // Centered classic (default) — centered header, boxed section labels
  return (
    <div className="flex h-full w-full flex-col gap-1.5 overflow-hidden rounded-md bg-white p-3">
      <div className="mx-auto h-1.5 w-2/3 rounded-full bg-ink-300" />
      <div className="mx-auto h-1 w-1/3 rounded-full bg-ink-300/60" />
      <div
        className="mt-1.5 h-[2px] w-full rounded-full"
        style={{ backgroundColor: template.accent }}
      />
      <Lines />
    </div>
  );
}

export default function TemplateGallery({
  templates,
  onSelect,
}: TemplateGalleryProps) {
  return (
    <div className="flex h-full w-full flex-col bg-ink-900">
      <div className="flex items-center gap-3 border-b border-ink-700 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-stamp text-paper-100">
          <Printer size={18} strokeWidth={2.25} />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold tracking-tight text-paper-100">
            DS Prints
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
            Document Formatter
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-2">
            <FileText size={16} className="text-stamp-light" />
            <h1 className="font-display text-[20px] font-semibold tracking-tight text-paper-100">
              Choose a resume template
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template.id)}
                className="group flex flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-800/50 text-left transition-colors hover:border-ink-600 hover:bg-ink-800"
              >
                <div className="aspect-[3/4] w-full bg-ink-950 p-4">
                  <MiniPreview template={template} />
                </div>
                <div className="flex flex-col gap-1.5 border-t border-ink-700 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[14px] font-semibold tracking-tight text-paper-100">
                      {template.name}
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: template.accent }}
                    />
                  </div>
                  <p className="text-[12px] leading-snug text-ink-600">
                    {template.description}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-600">
                    Best for: {template.bestFor}
                  </p>
                </div>
                <div className="border-t border-ink-700 px-4 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-stamp-light opacity-0 transition-opacity group-hover:opacity-100">
                  Use this template
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
