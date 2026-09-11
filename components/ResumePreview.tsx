"use client";

import { ResumeData, ResumeTemplate } from "@/lib/types";
import { PaperSize } from "@/lib/paperSizes";
import { FontOption } from "@/lib/fonts";
import { FontSizeOption } from "@/lib/fontSizes";
import { Mail, Phone, MapPin, Link as LinkIcon } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
  template: ResumeTemplate;
  paperSize: PaperSize;
  font: FontOption;
  fontSize: FontSizeOption;
}

/* ----------------------------- shared bits ----------------------------- */

function ContactLine({
  data,
  className = "text-[calc(10.5px*var(--resume-font-scale))] text-neutral-500",
  separator = "   |   ",
}: {
  data: ResumeData;
  className?: string;
  separator?: string;
}) {
  const parts = [data.email, data.phone, data.location, data.links].filter(
    Boolean
  );
  if (parts.length === 0) return null;
  return <p className={className}>{parts.join(separator)}</p>;
}

function ContactIconList({
  data,
  iconColor,
  textColor = "text-neutral-200",
}: {
  data: ResumeData;
  iconColor: string;
  textColor?: string;
}) {
  const rows = [
    { icon: Phone, value: data.phone },
    { icon: Mail, value: data.email },
    { icon: MapPin, value: data.location },
    { icon: LinkIcon, value: data.links },
  ].filter((r) => r.value);
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      {rows.map((r, i) => (
        <div key={i} className={`flex items-center gap-1.5 text-[calc(10px*var(--resume-font-scale))] ${textColor}`}>
          <r.icon size={10} style={{ color: iconColor }} className="shrink-0" />
          <span className="break-all">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <h3
        className="mb-1.5 border-b pb-1 text-[calc(11px*var(--resume-font-scale))] font-bold uppercase tracking-[0.12em]"
        style={{ borderColor: accent, color: accent }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function BarSection({
  title,
  bg,
  fg,
  children,
}: {
  title: string;
  bg: string;
  fg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div
        className="mb-2 px-2.5 py-1 text-[calc(10.5px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em]"
        style={{ backgroundColor: bg, color: fg }}
      >
        {title}
      </div>
      <div className="px-0.5">{children}</div>
    </div>
  );
}

function RuleSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center gap-2">
        <h3
          className="shrink-0 text-[calc(11.5px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em]"
          style={{ color: accent }}
        >
          {title}
        </h3>
        <div className="h-px w-full" style={{ backgroundColor: "#DDDFE3" }} />
      </div>
      {children}
    </div>
  );
}

function ExperienceBlock({
  data,
  dense = false,
}: {
  data: ResumeData;
  dense?: boolean;
}) {
  return (
    <>
      {data.experience.map((exp) => (
        <div key={exp.id} className={dense ? "mb-2.5 last:mb-0" : "mb-3 last:mb-0"}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <p className="text-[calc(12px*var(--resume-font-scale))] font-bold text-neutral-900">
              {exp.role || "Role"}
              <span className="font-normal text-neutral-600">
                {" "}
                — {exp.company || "Company"}
              </span>
            </p>
            {exp.location && (
              <span className="text-[calc(10px*var(--resume-font-scale))] text-neutral-500">{exp.location}</span>
            )}
          </div>
          <p className="text-[calc(10.5px*var(--resume-font-scale))] italic text-neutral-500">
            {exp.startDate} – {exp.current ? "Present" : exp.endDate}
          </p>
          {exp.bullets.filter(Boolean).length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {exp.bullets
                .filter((b) => b.trim())
                .map((b, i) => (
                  <li key={i} className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">
                    {b}
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}

function EducationBlock({ data }: { data: ResumeData }) {
  return (
    <>
      {data.education.map((edu) => (
        <div key={edu.id} className="mb-2 last:mb-0">
          <p className="text-[calc(12px*var(--resume-font-scale))] font-bold text-neutral-900">
            {edu.degree || "Degree"}
            <span className="font-normal text-neutral-600">
              {" "}
              — {edu.school || "School"}
              {edu.location ? `, ${edu.location}` : ""}
            </span>
          </p>
          <p className="text-[calc(10.5px*var(--resume-font-scale))] italic text-neutral-500">
            {edu.startDate} – {edu.endDate}
          </p>
        </div>
      ))}
    </>
  );
}

function ReferencesBlock({ data }: { data: ResumeData }) {
  if (data.references.length === 0) return null;
  return (
    <>
      {data.references.map((r) => (
        <div key={r.id} className="mb-1.5 last:mb-0">
          <p className="text-[calc(11.5px*var(--resume-font-scale))] font-bold text-neutral-900">
            {r.name || "Reference name"}
          </p>
          {r.relation && (
            <p className="text-[calc(10.5px*var(--resume-font-scale))] text-neutral-600">{r.relation}</p>
          )}
          <p className="text-[calc(10.5px*var(--resume-font-scale))] text-neutral-500">
            {[r.phone, r.email].filter(Boolean).join("  |  ")}
          </p>
        </div>
      ))}
    </>
  );
}

function LanguagesInline({ data }: { data: ResumeData }) {
  if (data.languages.length === 0) return null;
  return (
    <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">
      {data.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join("   •   ")}
    </p>
  );
}

function SkillDots({ level = 5, max = 5, color }: { level?: number; max?: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: i < level ? color : "#E3E3E3" }}
        />
      ))}
    </div>
  );
}

function Photo({
  src,
  className,
  style,
  shape = "round",
  sizeIn = 1,
}: {
  src?: string;
  className: string;
  style?: React.CSSProperties;
  shape?: "round" | "square";
  sizeIn?: number;
}) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt="Applicant"
      className={className}
      style={{
        ...style,
        width: `${sizeIn}in`,
        height: `${sizeIn}in`,
        borderRadius: shape === "round" ? "9999px" : "0",
      }}
    />
  );
}

/* --------------------------- layout renderers --------------------------- */

// Image 1 — Logan Mitchell: centered header, boxed section labels, optional photo
function CenteredClassicLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  const p = data.personal;
  const infoRows = [
    { label: "Date / Place of birth", value: [p.birthDate, p.placeOfBirth].filter(Boolean).join(", ") },
    { label: "Marital status", value: p.civilStatus },
    { label: "Nationality / Gender", value: [p.nationality, p.gender].filter(Boolean).join(" / ") },
  ].filter((r) => r.value);

  return (
    <div
      id="resume-sheet"
      className="aspect-[8.5/11] w-full bg-white p-8 text-neutral-900 shadow-2xl"
    style={{
      aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
      fontFamily: font.cssStack,
      ["--resume-font-scale" as string]: fontSize.scale,
    }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 text-center">
          <p className="text-[calc(16px*var(--resume-font-scale))] font-bold">
            {data.fullName || "Your Name"}
            {data.title ? `, ${data.title}` : ""}
          </p>
          <ContactLine
            data={data}
            className="mt-1 text-[calc(10px*var(--resume-font-scale))] text-neutral-500"
          />
        </div>
        <Photo
          src={data.photoDataUrl}
          shape={data.photoShape ?? "round"}
          sizeIn={data.photoSizeIn ?? 1}
          className="h-16 w-16 shrink-0 rounded-md object-cover"
        />
      </div>

      {infoRows.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-y-1 border-y border-neutral-200 py-2.5 text-[calc(10px*var(--resume-font-scale))]">
          {infoRows.map((r, i) => (
            <div key={i} className="flex gap-1.5">
              <span className="text-neutral-500">{r.label}</span>
              <span className="font-medium text-neutral-800">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        {data.summary && (
          <BarSection title="Profile" bg="#F1F1F3" fg="#1B1F29">
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.summary}</p>
          </BarSection>
        )}
        {data.experience.length > 0 && (
          <BarSection title="Experience" bg="#F1F1F3" fg="#1B1F29">
            <ExperienceBlock data={data} />
          </BarSection>
        )}
        {data.education.length > 0 && (
          <BarSection title="Education" bg="#F1F1F3" fg="#1B1F29">
            <EducationBlock data={data} />
          </BarSection>
        )}
        {data.skills.length > 0 && (
          <BarSection title="Skills" bg="#F1F1F3" fg="#1B1F29">
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.skills.join("   •   ")}</p>
          </BarSection>
        )}
        {data.languages.length > 0 && (
          <BarSection title="Languages" bg="#F1F1F3" fg="#1B1F29">
            <LanguagesInline data={data} />
          </BarSection>
        )}
        {data.certifications.length > 0 && (
          <BarSection title="Certifications" bg="#F1F1F3" fg="#1B1F29">
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.certifications.join("   •   ")}</p>
          </BarSection>
        )}
        {data.references.length > 0 && (
          <BarSection title="References" bg="#F1F1F3" fg="#1B1F29">
            <ReferencesBlock data={data} />
          </BarSection>
        )}
      </div>
    </div>
  );
}

// Image 2 — Tiffany Giroux: gray bar headers, diamond bullets, optional photo
function BannerHeadersLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  return (
    <div
      id="resume-sheet"
      className="aspect-[8.5/11] w-full bg-white p-8 text-neutral-900 shadow-2xl"
    style={{
      aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
      fontFamily: font.cssStack,
      ["--resume-font-scale" as string]: fontSize.scale,
    }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[calc(19px*var(--resume-font-scale))] font-bold tracking-tight">
            {data.fullName || "Your Name"}
          </p>
          {data.title && <p className="text-[calc(12px*var(--resume-font-scale))] text-neutral-600">{data.title}</p>}
          <ContactLine data={data} className="mt-1.5 text-[calc(10.5px*var(--resume-font-scale))] text-neutral-500" />
        </div>
        <Photo
          src={data.photoDataUrl}
          shape={data.photoShape ?? "round"}
          sizeIn={data.photoSizeIn ?? 1}
          className="h-16 w-16 shrink-0 rounded-md object-cover"
        />
      </div>

      <div className="mt-4">
        {data.summary && (
          <BarSection title="Profile" bg={template.accentSoft} fg={template.accent}>
            <p className="text-[calc(11px*var(--resume-font-scale))] leading-relaxed text-neutral-700">{data.summary}</p>
          </BarSection>
        )}
        {data.experience.length > 0 && (
          <BarSection title="Experience" bg={template.accentSoft} fg={template.accent}>
            <ul className="flex flex-col gap-2.5">
              {data.experience.map((exp) => (
                <li key={exp.id}>
                  <p className="text-[calc(11.5px*var(--resume-font-scale))] font-bold text-neutral-900">
                    ⬥ {exp.role || "Role"} — {exp.company || "Company"}
                  </p>
                  <p className="text-[calc(10px*var(--resume-font-scale))] text-neutral-500">
                    {exp.startDate} - {exp.current ? "Current" : exp.endDate}
                  </p>
                  <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">
                    {exp.bullets.filter(Boolean).join(" ")}
                  </p>
                </li>
              ))}
            </ul>
          </BarSection>
        )}
        {data.education.length > 0 && (
          <BarSection title="Education" bg={template.accentSoft} fg={template.accent}>
            <ul className="flex flex-col gap-1.5">
              {data.education.map((edu) => (
                <li key={edu.id} className="flex items-baseline justify-between gap-2">
                  <span className="text-[calc(11px*var(--resume-font-scale))] font-semibold text-neutral-800">
                    ⬥ {edu.degree || "Degree"}, {edu.school || "School"}
                  </span>
                  <span className="shrink-0 text-[calc(10px*var(--resume-font-scale))] text-neutral-500">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </li>
              ))}
            </ul>
          </BarSection>
        )}
        {(data.skills.length > 0 || data.languages.length > 0) && (
          <BarSection title="Skills" bg={template.accentSoft} fg={template.accent}>
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.skills.join("   •   ")}</p>
            <LanguagesInline data={data} />
          </BarSection>
        )}
        {data.certifications.length > 0 && (
          <BarSection title="Certifications" bg={template.accentSoft} fg={template.accent}>
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.certifications.join("   •   ")}</p>
          </BarSection>
        )}
        {data.references.length > 0 && (
          <BarSection title="References" bg={template.accentSoft} fg={template.accent}>
            <ReferencesBlock data={data} />
          </BarSection>
        )}
      </div>
    </div>
  );
}

// Image 3 — Sophie Walton: dark green left sidebar, circular photo
function SidebarLeftDarkLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  return (
    <div
      id="resume-sheet"
      className="flex aspect-[8.5/11] w-full bg-white text-neutral-900 shadow-2xl"
    style={{
      aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
      fontFamily: font.cssStack,
      ["--resume-font-scale" as string]: fontSize.scale,
    }}
    >
      <div
        className="flex w-[36%] flex-col gap-4 p-5"
        style={{ backgroundColor: template.accent }}
      >
        <Photo
          src={data.photoDataUrl}
          shape={data.photoShape ?? "round"}
          sizeIn={data.photoSizeIn ?? 1}
          className="h-16 w-16 self-start rounded-full border-2 border-white/70 object-cover"
        />
        <div>
          <p className="text-[calc(15px*var(--resume-font-scale))] font-bold leading-tight text-white">
            {data.fullName || "Your Name"}
          </p>
          {data.title && (
            <p className="text-[calc(9.5px*var(--resume-font-scale))] uppercase tracking-[0.12em] text-white/70">
              {data.title}
            </p>
          )}
        </div>

        {(data.email || data.phone || data.location) && (
          <div>
            <h3 className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em] text-white/90">
              Details
            </h3>
            <ContactIconList data={data} iconColor="#FFFFFF" textColor="text-white/85" />
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em] text-white/90">
              Skills
            </h3>
            <ul className="flex flex-col gap-1.5">
              {data.skills.map((s, i) => (
                <li key={i}>
                  <p className="text-[calc(10px*var(--resume-font-scale))] text-white/85">{s}</p>
                  <div className="mt-0.5 h-[2px] w-full bg-white/25" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.languages.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em] text-white/90">
              Language
            </h3>
            <ul className="flex flex-col gap-0.5">
              {data.languages.map((l) => (
                <li key={l.id} className="text-[calc(10px*var(--resume-font-scale))] text-white/85">
                  {l.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.certifications.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em] text-white/90">
              Certifications
            </h3>
            <ul className="flex flex-col gap-0.5">
              {data.certifications.map((c, i) => (
                <li key={i} className="text-[calc(10px*var(--resume-font-scale))] text-white/85">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex-1 p-5">
        {data.summary && (
          <RuleSection title="Profile" accent={template.accent}>
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.summary}</p>
          </RuleSection>
        )}
        {data.experience.length > 0 && (
          <RuleSection title="Employment History" accent={template.accent}>
            <ExperienceBlock data={data} />
          </RuleSection>
        )}
        {data.education.length > 0 && (
          <RuleSection title="Education" accent={template.accent}>
            <EducationBlock data={data} />
          </RuleSection>
        )}
        {data.references.length > 0 && (
          <RuleSection title="References" accent={template.accent}>
            <ReferencesBlock data={data} />
          </RuleSection>
        )}
      </div>
    </div>
  );
}

// Image 4 — Herman Walton: blue name, square photo top-right, blue rules
function PhotoTopHeaderLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  return (
    <div
      id="resume-sheet"
      className="aspect-[8.5/11] w-full bg-white p-7 text-neutral-900 shadow-2xl"
    style={{
      aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
      fontFamily: font.cssStack,
      ["--resume-font-scale" as string]: fontSize.scale,
    }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[calc(20px*var(--resume-font-scale))] font-extrabold leading-tight"
            style={{ color: template.accent }}
          >
            {data.fullName || "Your Name"}
          </p>
          <p className="text-[calc(12px*var(--resume-font-scale))] font-semibold uppercase tracking-[0.08em] text-neutral-700">
            {data.title || "Job Title"}
          </p>
          <ContactLine data={data} className="mt-1.5 text-[calc(10px*var(--resume-font-scale))] text-neutral-500" separator="  |  " />
        </div>
        <Photo
          src={data.photoDataUrl}
          shape={data.photoShape ?? "round"}
          sizeIn={data.photoSizeIn ?? 1}
          className="h-16 w-16 shrink-0 rounded-md object-cover"
        />
      </div>

      <div className="mt-4">
        {data.summary && (
          <RuleSection title="Summary" accent={template.accent}>
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.summary}</p>
          </RuleSection>
        )}
        {data.experience.length > 0 && (
          <RuleSection title="Professional Experience" accent={template.accent}>
            <ExperienceBlock data={data} />
          </RuleSection>
        )}
        {data.education.length > 0 && (
          <RuleSection title="Education" accent={template.accent}>
            <EducationBlock data={data} />
          </RuleSection>
        )}
        {data.skills.length > 0 && (
          <RuleSection title="Technical Skills" accent={template.accent}>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1">
              {data.skills.map((s, i) => (
                <p key={i} className="text-[calc(10.5px*var(--resume-font-scale))] text-neutral-700">
                  {s}
                </p>
              ))}
            </div>
          </RuleSection>
        )}
        {(data.certifications.length > 0 || data.languages.length > 0) && (
          <RuleSection title="Additional Information" accent={template.accent}>
            {data.languages.length > 0 && (
              <p className="text-[calc(10.5px*var(--resume-font-scale))] text-neutral-700">
                <span className="font-bold">Languages: </span>
                {data.languages.map((l) => l.name).join(", ")}
              </p>
            )}
            {data.certifications.length > 0 && (
              <p className="text-[calc(10.5px*var(--resume-font-scale))] text-neutral-700">
                <span className="font-bold">Certificates: </span>
                {data.certifications.join(", ")}
              </p>
            )}
          </RuleSection>
        )}
        {data.references.length > 0 && (
          <RuleSection title="References" accent={template.accent}>
            <ReferencesBlock data={data} />
          </RuleSection>
        )}
      </div>
    </div>
  );
}

// Image 5 — Gregory Walls: dark navy sidebar on the right
function SidebarRightDarkLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  return (
    <div
      id="resume-sheet"
      className="flex aspect-[8.5/11] w-full bg-white text-neutral-900 shadow-2xl"
    style={{
      aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
      fontFamily: font.cssStack,
      ["--resume-font-scale" as string]: fontSize.scale,
    }}
    >
      <div className="flex-1 p-5">
        <Photo
          src={data.photoDataUrl}
          shape={data.photoShape ?? "round"}
          sizeIn={data.photoSizeIn ?? 1}
          className="mb-3 h-14 w-14 rounded-full object-cover"
        />
        <p className="text-[calc(17px*var(--resume-font-scale))] font-bold leading-tight">
          {data.fullName || "Your Name"}
        </p>
        {data.title && (
          <p
            className="text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.16em]"
            style={{ color: template.accent }}
          >
            {data.title}
          </p>
        )}

        <div className="mt-4">
          {data.summary && (
            <Section title="Profile" accent={template.accent}>
              <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.summary}</p>
            </Section>
          )}
          {data.experience.length > 0 && (
            <Section title="Employment History" accent={template.accent}>
              <ExperienceBlock data={data} />
            </Section>
          )}
          {data.education.length > 0 && (
            <Section title="Education" accent={template.accent}>
              <EducationBlock data={data} />
            </Section>
          )}
          {data.references.length > 0 && (
            <Section title="References" accent={template.accent}>
              <ReferencesBlock data={data} />
            </Section>
          )}
        </div>
      </div>

      <div
        className="flex w-[32%] flex-col gap-4 p-5"
        style={{ backgroundColor: template.accent }}
      >
        {(data.email || data.phone || data.location) && (
          <div>
            <h3 className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em] text-white/90">
              Details
            </h3>
            <ContactIconList data={data} iconColor="#FFFFFF" textColor="text-white/85" />
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em] text-white/90">
              Skills
            </h3>
            <ul className="flex flex-wrap gap-1">
              {data.skills.map((s, i) => (
                <li
                  key={i}
                  className="rounded-full bg-white/15 px-2 py-0.5 text-[calc(9.5px*var(--resume-font-scale))] text-white"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.languages.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em] text-white/90">
              Languages
            </h3>
            <ul className="flex flex-col gap-0.5">
              {data.languages.map((l) => (
                <li key={l.id} className="text-[calc(10px*var(--resume-font-scale))] text-white/85">
                  {l.name}
                  {l.level ? ` — ${l.level}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.certifications.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em] text-white/90">
              Certifications
            </h3>
            <ul className="flex flex-col gap-0.5">
              {data.certifications.map((c, i) => (
                <li key={i} className="text-[calc(10px*var(--resume-font-scale))] text-white/85">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Image 6 — Kane Jones: sage header block, minimal single column, optional photo
function BlockHeaderSingleLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  return (
    <div
      id="resume-sheet"
      className="aspect-[8.5/11] w-full bg-white text-neutral-900 shadow-2xl"
    style={{
      aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
      fontFamily: font.cssStack,
      ["--resume-font-scale" as string]: fontSize.scale,
    }}
    >
      <div className="flex items-start justify-between gap-4 px-7 py-6" style={{ backgroundColor: template.accentSoft }}>
        <div className="flex-1">
          <p className="text-[calc(18px*var(--resume-font-scale))] font-bold tracking-tight" style={{ color: "#2B2B2B" }}>
            {data.fullName || "Your Name"}
          </p>
          <ContactLine data={data} className="mt-1 text-[calc(10px*var(--resume-font-scale))] text-neutral-600" />
        </div>
        <Photo
          src={data.photoDataUrl}
          shape={data.photoShape ?? "round"}
          sizeIn={data.photoSizeIn ?? 1}
          className="h-16 w-16 shrink-0 rounded-md object-cover"
          style={{ border: `2px solid ${template.accent}` }}
        />
      </div>
      <div className="px-7 py-5">
        {data.title && (
          <>
            <h3
              className="mb-1 text-[calc(13px*var(--resume-font-scale))] font-semibold"
              style={{ color: template.accent }}
            >
              {data.title}
            </h3>
            {data.summary && (
              <p className="mb-4 text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.summary}</p>
            )}
          </>
        )}
        {data.experience.length > 0 && (
          <RuleSection title="Career Experience" accent={template.accent}>
            <ExperienceBlock data={data} />
          </RuleSection>
        )}
        {data.education.length > 0 && (
          <RuleSection title="Education" accent={template.accent}>
            <EducationBlock data={data} />
          </RuleSection>
        )}
        {data.skills.length > 0 && (
          <RuleSection title="Skills" accent={template.accent}>
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.skills.join("   •   ")}</p>
          </RuleSection>
        )}
        {data.certifications.length > 0 && (
          <RuleSection title="Certifications" accent={template.accent}>
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.certifications.join("   •   ")}</p>
          </RuleSection>
        )}
        {data.references.length > 0 && (
          <RuleSection title="References" accent={template.accent}>
            <ReferencesBlock data={data} />
          </RuleSection>
        )}
      </div>
    </div>
  );
}

// Image 7 — Matthew Jones: light gray sidebar on the right, circular photo top-left of main col
function SidebarRightLightLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  return (
    <div
      id="resume-sheet"
      className="flex aspect-[8.5/11] w-full bg-white text-neutral-900 shadow-2xl"
    style={{
      aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
      fontFamily: font.cssStack,
      ["--resume-font-scale" as string]: fontSize.scale,
    }}
    >
      <div className="flex-1 p-5">
        <div className="mb-3 flex items-center gap-3">
          <Photo
            src={data.photoDataUrl}
            shape={data.photoShape ?? "round"}
            sizeIn={data.photoSizeIn ?? 1}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="text-[calc(16px*var(--resume-font-scale))] font-bold leading-tight">
              {data.fullName || "Your Name"}
            </p>
            {data.title && (
              <p className="text-[calc(10px*var(--resume-font-scale))] text-neutral-500">{data.title}</p>
            )}
          </div>
        </div>

        {data.summary && (
          <Section title="Profile" accent={template.accent}>
            <p className="text-[calc(11px*var(--resume-font-scale))] text-neutral-700">{data.summary}</p>
          </Section>
        )}
        {data.experience.length > 0 && (
          <Section title="Employment History" accent={template.accent}>
            <ExperienceBlock data={data} />
          </Section>
        )}
        {data.education.length > 0 && (
          <Section title="Education" accent={template.accent}>
            <EducationBlock data={data} />
          </Section>
        )}
        {data.references.length > 0 && (
          <Section title="References" accent={template.accent}>
            <ReferencesBlock data={data} />
          </Section>
        )}
      </div>

      <div
        className="flex w-[30%] flex-col gap-4 p-5"
        style={{ backgroundColor: template.accentSoft }}
      >
        {(data.email || data.phone || data.location) && (
          <div>
            <h3
              className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em]"
              style={{ color: template.accent }}
            >
              Details
            </h3>
            <ContactIconList data={data} iconColor={template.accent} textColor="text-neutral-700" />
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <h3
              className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em]"
              style={{ color: template.accent }}
            >
              Skills
            </h3>
            <ul className="flex flex-col gap-1">
              {data.skills.map((s, i) => (
                <li key={i} className="text-[calc(10px*var(--resume-font-scale))] text-neutral-700">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.languages.length > 0 && (
          <div>
            <h3
              className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em]"
              style={{ color: template.accent }}
            >
              Languages
            </h3>
            <ul className="flex flex-col gap-1">
              {data.languages.map((l) => (
                <li key={l.id} className="text-[calc(10px*var(--resume-font-scale))] text-neutral-700">
                  {l.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.certifications.length > 0 && (
          <div>
            <h3
              className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.14em]"
              style={{ color: template.accent }}
            >
              Certifications
            </h3>
            <ul className="flex flex-col gap-1">
              {data.certifications.map((c, i) => (
                <li key={i} className="text-[calc(10px*var(--resume-font-scale))] text-neutral-700">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Image 8 — Christopher Gonan: big name, square photo top-left, black block section bars
function BlockPhotoHeaderLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  return (
    <div
      id="resume-sheet"
      className="aspect-[8.5/11] w-full bg-white p-6 text-neutral-900 shadow-2xl"
    style={{
      aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
      fontFamily: font.cssStack,
      ["--resume-font-scale" as string]: fontSize.scale,
    }}
    >
      <div className="flex items-start justify-between gap-4">
        <Photo
          src={data.photoDataUrl}
          shape={data.photoShape ?? "round"}
          sizeIn={data.photoSizeIn ?? 1}
          className="h-16 w-16 shrink-0 rounded-md object-cover"
          style={{ border: `2px solid ${template.accent}` }}
        />
        <div className="flex-1 text-right">
          <p className="text-[calc(20px*var(--resume-font-scale))] font-extrabold leading-tight">
            {data.fullName || "Your Name"}
          </p>
          {data.title && (
            <p className="text-[calc(11px*var(--resume-font-scale))] font-semibold text-neutral-600">{data.title}</p>
          )}
          <ContactLine data={data} className="mt-1 text-[calc(9.5px*var(--resume-font-scale))] text-neutral-500" separator="  |  " />
        </div>
      </div>

      {data.summary && (
        <div className="mt-3 rounded-md bg-neutral-100 p-3">
          <p className="mb-1 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.12em] text-neutral-700">
            Profile
          </p>
          <p className="text-[calc(10.5px*var(--resume-font-scale))] text-neutral-700">{data.summary}</p>
        </div>
      )}

      <div className="mt-3 flex gap-4">
        <div className="flex-[1.6]">
          {data.experience.length > 0 && (
            <BarSection title="Employment History" bg={template.accent} fg="#FFFFFF">
              <ExperienceBlock data={data} dense />
            </BarSection>
          )}
          {data.education.length > 0 && (
            <BarSection title="Education" bg={template.accent} fg="#FFFFFF">
              <EducationBlock data={data} />
            </BarSection>
          )}
        </div>
        <div className="flex-1">
          {data.skills.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em] text-neutral-700">
                Skills
              </p>
              <ul className="flex flex-col gap-1">
                {data.skills.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span className="text-[calc(9.5px*var(--resume-font-scale))] text-neutral-700">{s}</span>
                    <SkillDots color={template.accent} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.certifications.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em] text-neutral-700">
                Certifications
              </p>
              <ul className="flex flex-col gap-0.5">
                {data.certifications.map((c, i) => (
                  <li key={i} className="text-[calc(9.5px*var(--resume-font-scale))] text-neutral-700">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.references.length > 0 && (
            <div>
              <p className="mb-1.5 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em] text-neutral-700">
                References
              </p>
              <ReferencesBlock data={data} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Image 9 — Allia Marie Sustal: bordered PH application form with full ID photo + personal info
function FormalPhLayout({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  const p = data.personal;
  const infoRows = [
    { label: "Birth date", value: p.birthDate },
    { label: "Place of birth", value: p.placeOfBirth },
    { label: "Age", value: p.age },
    { label: "Gender", value: p.gender },
    { label: "Civil status", value: p.civilStatus },
    { label: "Nationality", value: p.nationality },
    { label: "Religion", value: p.religion },
    { label: "Height", value: p.height ? `${p.height}cm` : "" },
    { label: "Weight", value: p.weight ? `${p.weight}kg` : "" },
  ].filter((r) => r.value);

  return (
    <div
      id="resume-sheet"
      className="flex aspect-[8.5/11] w-full flex-col border-8 bg-white p-4 text-neutral-900 shadow-2xl"
      style={{
        borderColor: template.accentSoft,
        aspectRatio: `${paperSize.widthIn} / ${paperSize.heightIn}`,
        fontFamily: font.cssStack,
        ["--resume-font-scale" as string]: fontSize.scale,
      }}
    >
      <div className="flex flex-1 gap-4">
        <div
          className="flex w-[34%] flex-col gap-3 border p-3"
          style={{ borderColor: template.accent }}
        >
          <Photo
            src={data.photoDataUrl}
            shape={data.photoShape ?? "round"}
            sizeIn={data.photoSizeIn ?? 1}
            className="aspect-[3/4] w-full rounded-sm object-cover"
            style={{ border: `2px solid ${template.accent}` }}
          />
          <div className="flex flex-col gap-0.5">
            {[data.phone, data.email, data.location].filter(Boolean).map((v, i) => (
              <p key={i} className="break-all text-[calc(9px*var(--resume-font-scale))] leading-snug text-neutral-600">
                {v}
              </p>
            ))}
          </div>
          {data.education.length > 0 && (
            <div>
              <h3
                className="mb-1 text-[calc(9.5px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em]"
                style={{ color: template.accent }}
              >
                Education
              </h3>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-1 last:mb-0">
                  <p className="text-[calc(9.5px*var(--resume-font-scale))] font-bold text-neutral-800">
                    {edu.degree || "Course"}
                  </p>
                  <p className="text-[calc(9px*var(--resume-font-scale))] text-neutral-600">{edu.school}</p>
                  <p className="text-[calc(8.5px*var(--resume-font-scale))] text-neutral-500">
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          )}
          {data.skills.length > 0 && (
            <div>
              <h3
                className="mb-1 text-[calc(9.5px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em]"
                style={{ color: template.accent }}
              >
                Expertise
              </h3>
              <ul className="flex flex-col gap-0.5">
                {data.skills.map((s, i) => (
                  <li key={i} className="text-[calc(9px*var(--resume-font-scale))] text-neutral-700">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <h3
                className="mb-1 text-[calc(9.5px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em]"
                style={{ color: template.accent }}
              >
                Language
              </h3>
              <ul className="flex flex-col gap-0.5">
                {data.languages.map((l) => (
                  <li key={l.id} className="text-[calc(9px*var(--resume-font-scale))] text-neutral-700">
                    {l.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-[calc(17px*var(--resume-font-scale))] font-extrabold leading-tight">
            {(data.fullName || "Your Name").toUpperCase()}
          </p>

          {data.summary && (
            <div className="mt-2.5">
              <h3
                className="mb-1 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em]"
                style={{ color: template.accent }}
              >
                Objective
              </h3>
              <p className="text-[calc(9.5px*var(--resume-font-scale))] leading-snug text-neutral-700">{data.summary}</p>
            </div>
          )}

          {infoRows.length > 0 && (
            <div className="mt-2.5">
              <h3
                className="mb-1 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em]"
                style={{ color: template.accent }}
              >
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-y-0.5">
                {infoRows.map((r, i) => (
                  <p key={i} className="text-[calc(9.5px*var(--resume-font-scale))] text-neutral-700">
                    <span className="font-bold">{r.label}: </span>
                    {r.value}
                  </p>
                ))}
              </div>
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="mt-2.5">
              <h3
                className="mb-1 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em]"
                style={{ color: template.accent }}
              >
                Training
              </h3>
              <div className="flex flex-col gap-0.5">
                {data.certifications.map((c, i) => (
                  <p key={i} className="text-[calc(9.5px*var(--resume-font-scale))] text-neutral-700">
                    {c}
                  </p>
                ))}
              </div>
            </div>
          )}

          {data.references.length > 0 && (
            <div className="mt-2.5">
              <h3
                className="mb-1 text-[calc(10px*var(--resume-font-scale))] font-bold uppercase tracking-[0.1em]"
                style={{ color: template.accent }}
              >
                Character References
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <ReferencesBlock data={data} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between border-t pt-2" style={{ borderColor: template.accentSoft }}>
        <p className="text-[calc(8px*var(--resume-font-scale))] italic text-neutral-500">
          I hereby certify that the above information are true and correct to the best of my knowledge and belief.
        </p>
        <div className="text-right">
          <p className="text-[calc(9.5px*var(--resume-font-scale))] font-bold underline">
            {(data.fullName || "Your Name").toUpperCase()}
          </p>
          <p className="text-[calc(8.5px*var(--resume-font-scale))] italic text-neutral-500">Applicant</p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- root --------------------------------- */

export default function ResumePreview({ data, template, paperSize, font, fontSize }: ResumePreviewProps) {
  switch (template.layout) {
    case "centered-classic":
      return <CenteredClassicLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    case "banner-headers":
      return <BannerHeadersLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    case "sidebar-left-dark":
      return <SidebarLeftDarkLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    case "photo-top-header":
      return <PhotoTopHeaderLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    case "sidebar-right-dark":
      return <SidebarRightDarkLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    case "block-header-single":
      return <BlockHeaderSingleLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    case "sidebar-right-light":
      return <SidebarRightLightLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    case "block-photo-header":
      return <BlockPhotoHeaderLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    case "formal-ph":
      return <FormalPhLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
    default:
      return <CenteredClassicLayout data={data} template={template} paperSize={paperSize} font={font} fontSize={fontSize} />;
  }
}
