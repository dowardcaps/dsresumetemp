"use client";

import { useState, Dispatch, SetStateAction } from "react";
import {
  ResumeData,
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
  ReferenceEntry,
  PersonalInfo,
} from "@/lib/types";
import { Plus, Trash2, ClipboardPaste, ChevronDown, ChevronUp, Check } from "lucide-react";
import PhotoCropper from "./PhotoCropper";
import { parseResumeText, ParsedResume } from "@/lib/parseResumeText";

interface ResumeFormProps {
  data: ResumeData;
  onChange: Dispatch<SetStateAction<ResumeData>>;
}

const inputClass =
  "w-full rounded-md border border-ink-700 bg-white px-3 py-2 text-[13px] text-stamp-dark placeholder:text-ink-600 outline-none focus:border-stamp/60";
const labelClass =
  "mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-stamp/80";

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<ParsedResume["foundCounts"] | null>(null);

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    onChange((prev) => ({ ...prev, [key]: value }));

  const handleImport = () => {
    if (!importText.trim()) return;
    const parsed = parseResumeText(importText);
    onChange((prev) => ({ ...prev, ...parsed.data }));
    setImportResult(parsed.foundCounts);
  };

  // --- Personal info (birth date, civil status, etc.) ---
  const updatePersonal = <K extends keyof PersonalInfo>(
    key: K,
    value: PersonalInfo[K]
  ) => update("personal", { ...data.personal, [key]: value });

  // --- Experience ---
  const addExperience = () =>
    update("experience", [
      ...data.experience,
      {
        id: newId("exp"),
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        bullets: [""],
      },
    ]);

  const updateExperience = (id: string, patch: Partial<ExperienceEntry>) =>
    update(
      "experience",
      data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );

  const removeExperience = (id: string) =>
    update(
      "experience",
      data.experience.filter((e) => e.id !== id)
    );

  const updateBullet = (expId: string, idx: number, text: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    const bullets = [...exp.bullets];
    bullets[idx] = text;
    updateExperience(expId, { bullets });
  };

  const addBullet = (expId: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, { bullets: [...exp.bullets, ""] });
  };

  const removeBullet = (expId: string, idx: number) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, {
      bullets: exp.bullets.filter((_, i) => i !== idx),
    });
  };

  // --- Education ---
  const addEducation = () =>
    update("education", [
      ...data.education,
      {
        id: newId("edu"),
        degree: "",
        school: "",
        location: "",
        startDate: "",
        endDate: "",
      },
    ]);

  const updateEducation = (id: string, patch: Partial<EducationEntry>) =>
    update(
      "education",
      data.education.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );

  const removeEducation = (id: string) =>
    update(
      "education",
      data.education.filter((e) => e.id !== id)
    );

  // --- Languages ---
  const addLanguage = () =>
    update("languages", [
      ...data.languages,
      { id: newId("lang"), name: "", level: "" },
    ]);

  const updateLanguage = (id: string, patch: Partial<LanguageEntry>) =>
    update(
      "languages",
      data.languages.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );

  const removeLanguage = (id: string) =>
    update(
      "languages",
      data.languages.filter((l) => l.id !== id)
    );

  // --- References ---
  const addReference = () =>
    update("references", [
      ...data.references,
      { id: newId("ref"), name: "", relation: "", phone: "", email: "" },
    ]);

  const updateReference = (id: string, patch: Partial<ReferenceEntry>) =>
    update(
      "references",
      data.references.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );

  const removeReference = (id: string) =>
    update(
      "references",
      data.references.filter((r) => r.id !== id)
    );

  // --- Skills / Certifications (comma-separated text areas) ---
  const skillsText = data.skills.join(", ");
  const certsText = data.certifications.join(", ");

  return (
    <div className="form-scroll flex h-full flex-col gap-6 overflow-y-auto px-5 py-5">
      {/* Paste-to-fill import */}
      <section className="flex flex-col gap-2 rounded-lg border border-ink-700 bg-paper-200 p-3">
        <button
          onClick={() => setImportOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2"
        >
          <span className="flex items-center gap-1.5 font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
            <ClipboardPaste size={14} className="text-stamp" />
            Paste an existing resume
          </span>
          {importOpen ? (
            <ChevronUp size={14} className="text-stamp" />
          ) : (
            <ChevronDown size={14} className="text-stamp" />
          )}
        </button>

        {importOpen && (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[11px] text-ink-600">
              Paste the text of a resume you already have (or text copied from a
              scanned PDF) and we'll try to fill in the fields below for you.
              Review everything afterward — this is a starting point, not final.
            </p>
            <textarea
              className={`${inputClass} min-h-[110px] resize-y`}
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setImportResult(null);
              }}
              placeholder="Paste resume text here..."
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="flex items-center gap-1.5 rounded-md bg-stamp px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-stamp-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ClipboardPaste size={12} />
                Auto-fill fields
              </button>
              {importResult && (
                <span className="flex items-center gap-1 text-[11px] text-stamp">
                  <Check size={12} />
                  Filled in{" "}
                  {[
                    importResult.name && "name",
                    importResult.email && "email",
                    importResult.phone && "phone",
                    importResult.experience > 0 && `${importResult.experience} job${importResult.experience > 1 ? "s" : ""}`,
                    importResult.education > 0 && `${importResult.education} school${importResult.education > 1 ? "s" : ""}`,
                    importResult.skills > 0 && "skills",
                  ]
                    .filter(Boolean)
                    .join(", ") || "a few fields"}
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ID photo */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
          ID photo
        </h2>
        <p className="text-[11px] text-ink-600">
          Upload a photo, drag and zoom to frame it, then choose the shape and
          exact printed size for your resume.
        </p>
        <PhotoCropper
          photoDataUrl={data.photoDataUrl}
          photoShape={data.photoShape ?? "round"}
          photoSizeIn={data.photoSizeIn ?? 1}
          onPhotoChange={(url) => update("photoDataUrl", url)}
          onPhotoShapeChange={(shape) => update("photoShape", shape)}
          onPhotoSizeChange={(size) => update("photoSizeIn", size)}
        />
      </section>

      {/* Personal details */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
          Personal details
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Full name</label>
            <input
              className={inputClass}
              value={data.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Job title / role applying for</label>
            <input
              className={inputClass}
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Marketing Specialist"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="juan@email.com"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="0917 000 0000"
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              value={data.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Tanza, Cavite"
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn / portfolio link</label>
            <input
              className={inputClass}
              value={data.links}
              onChange={(e) => update("links", e.target.value)}
              placeholder="linkedin.com/in/juan"
            />
          </div>
        </div>
      </section>

      {/* Personal information (used by ID/formal templates) */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
          Personal information
        </h2>
        <p className="text-[11px] text-ink-600">
          Optional. Only shown on templates that display these fields (e.g.
          the PH Formal Application and ATS Classic templates).
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Birth date</label>
            <input
              className={inputClass}
              value={data.personal.birthDate}
              onChange={(e) => updatePersonal("birthDate", e.target.value)}
              placeholder="August 09, 2006"
            />
          </div>
          <div>
            <label className={labelClass}>Place of birth</label>
            <input
              className={inputClass}
              value={data.personal.placeOfBirth}
              onChange={(e) => updatePersonal("placeOfBirth", e.target.value)}
              placeholder="Amaya, Tanza, Cavite"
            />
          </div>
          <div>
            <label className={labelClass}>Age</label>
            <input
              className={inputClass}
              value={data.personal.age}
              onChange={(e) => updatePersonal("age", e.target.value)}
              placeholder="19"
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <input
              className={inputClass}
              value={data.personal.gender}
              onChange={(e) => updatePersonal("gender", e.target.value)}
              placeholder="Female"
            />
          </div>
          <div>
            <label className={labelClass}>Civil / marital status</label>
            <input
              className={inputClass}
              value={data.personal.civilStatus}
              onChange={(e) => updatePersonal("civilStatus", e.target.value)}
              placeholder="Single"
            />
          </div>
          <div>
            <label className={labelClass}>Nationality</label>
            <input
              className={inputClass}
              value={data.personal.nationality}
              onChange={(e) => updatePersonal("nationality", e.target.value)}
              placeholder="Filipino"
            />
          </div>
          <div>
            <label className={labelClass}>Religion</label>
            <input
              className={inputClass}
              value={data.personal.religion}
              onChange={(e) => updatePersonal("religion", e.target.value)}
              placeholder="Catholic"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelClass}>Height (cm)</label>
              <input
                className={inputClass}
                value={data.personal.height}
                onChange={(e) => updatePersonal("height", e.target.value)}
                placeholder="159"
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Weight (kg)</label>
              <input
                className={inputClass}
                value={data.personal.weight}
                onChange={(e) => updatePersonal("weight", e.target.value)}
                placeholder="58"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
          Summary / Objective
        </h2>
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={data.summary}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="2-3 sentences about your experience and what you're looking for."
        />
      </section>

      {/* Experience */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
            Experience
          </h2>
          <button
            onClick={addExperience}
            className="flex items-center gap-1 rounded-md border border-ink-700 px-2.5 py-1 text-[11px] text-stamp hover:border-stamp hover:bg-ink-800"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {data.experience.length === 0 && (
          <p className="text-[12px] text-ink-600">
            No experience added yet. Click Add to include a job.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {data.experience.map((exp) => (
            <div
              key={exp.id}
              className="flex flex-col gap-2 rounded-lg border border-ink-700 bg-paper-200 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-stamp/70">
                  Job
                </span>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-ink-600 hover:text-stamp"
                  aria-label="Remove job"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  value={exp.role}
                  onChange={(e) =>
                    updateExperience(exp.id, { role: e.target.value })
                  }
                  placeholder="Role / position"
                />
                <input
                  className={inputClass}
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(exp.id, { company: e.target.value })
                  }
                  placeholder="Company"
                />
                <input
                  className={inputClass}
                  value={exp.location}
                  onChange={(e) =>
                    updateExperience(exp.id, { location: e.target.value })
                  }
                  placeholder="Location"
                />
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, { startDate: e.target.value })
                    }
                    placeholder="Start (e.g. Jun 2022)"
                  />
                  <input
                    className={inputClass}
                    value={exp.endDate}
                    disabled={exp.current}
                    onChange={(e) =>
                      updateExperience(exp.id, { endDate: e.target.value })
                    }
                    placeholder="End"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-ink-600">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) =>
                    updateExperience(exp.id, { current: e.target.checked })
                  }
                />
                Currently working here
              </label>

              <div className="flex flex-col gap-1.5">
                <span className={labelClass}>Highlights</span>
                {exp.bullets.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      className={inputClass}
                      value={b}
                      onChange={(e) =>
                        updateBullet(exp.id, idx, e.target.value)
                      }
                      placeholder="What did you do or achieve?"
                    />
                    <button
                      onClick={() => removeBullet(exp.id, idx)}
                      className="shrink-0 text-ink-600 hover:text-stamp"
                      aria-label="Remove highlight"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addBullet(exp.id)}
                  className="mt-1 self-start text-[11px] text-stamp hover:text-stamp-light"
                >
                  + Add highlight
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
            Education
          </h2>
          <button
            onClick={addEducation}
            className="flex items-center gap-1 rounded-md border border-ink-700 px-2.5 py-1 text-[11px] text-stamp hover:border-stamp hover:bg-ink-800"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {data.education.length === 0 && (
          <p className="text-[12px] text-ink-600">No education added yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {data.education.map((edu) => (
            <div
              key={edu.id}
              className="flex flex-col gap-2 rounded-lg border border-ink-700 bg-paper-200 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-stamp/70">
                  School
                </span>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-ink-600 hover:text-stamp"
                  aria-label="Remove education"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  value={edu.degree}
                  onChange={(e) =>
                    updateEducation(edu.id, { degree: e.target.value })
                  }
                  placeholder="Degree / course"
                />
                <input
                  className={inputClass}
                  value={edu.school}
                  onChange={(e) =>
                    updateEducation(edu.id, { school: e.target.value })
                  }
                  placeholder="School"
                />
                <input
                  className={inputClass}
                  value={edu.location}
                  onChange={(e) =>
                    updateEducation(edu.id, { location: e.target.value })
                  }
                  placeholder="Location"
                />
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(edu.id, { startDate: e.target.value })
                    }
                    placeholder="Start year"
                  />
                  <input
                    className={inputClass}
                    value={edu.endDate}
                    onChange={(e) =>
                      updateEducation(edu.id, { endDate: e.target.value })
                    }
                    placeholder="End year"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
          Skills
        </h2>
        <p className="text-[11px] text-ink-600">Separate with commas.</p>
        <textarea
          className={`${inputClass} min-h-[60px] resize-y`}
          value={skillsText}
          onChange={(e) =>
            update(
              "skills",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          placeholder="Customer Service, MS Excel, Team Leadership"
        />
      </section>

      {/* Languages */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
            Languages
          </h2>
          <button
            onClick={addLanguage}
            className="flex items-center gap-1 rounded-md border border-ink-700 px-2.5 py-1 text-[11px] text-stamp hover:border-stamp hover:bg-ink-800"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {data.languages.length === 0 && (
          <p className="text-[12px] text-ink-600">No languages added yet.</p>
        )}

        <div className="flex flex-col gap-2">
          {data.languages.map((lang) => (
            <div key={lang.id} className="flex items-center gap-1.5">
              <input
                className={inputClass}
                value={lang.name}
                onChange={(e) =>
                  updateLanguage(lang.id, { name: e.target.value })
                }
                placeholder="Language (e.g. English)"
              />
              <input
                className={inputClass}
                value={lang.level}
                onChange={(e) =>
                  updateLanguage(lang.id, { level: e.target.value })
                }
                placeholder="Level (e.g. Fluent)"
              />
              <button
                onClick={() => removeLanguage(lang.id)}
                className="shrink-0 text-ink-600 hover:text-stamp"
                aria-label="Remove language"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
          Certifications / Training
        </h2>
        <p className="text-[11px] text-ink-600">
          Optional. Separate with commas.
        </p>
        <textarea
          className={`${inputClass} min-h-[50px] resize-y`}
          value={certsText}
          onChange={(e) =>
            update(
              "certifications",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          placeholder="TESDA NC II Food and Beverage Services (2023)"
        />
      </section>

      {/* References */}
      <section className="flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[13px] font-semibold tracking-tight text-stamp-dark">
            Character references
          </h2>
          <button
            onClick={addReference}
            className="flex items-center gap-1 rounded-md border border-ink-700 px-2.5 py-1 text-[11px] text-stamp hover:border-stamp hover:bg-ink-800"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {data.references.length === 0 && (
          <p className="text-[12px] text-ink-600">
            Optional. No references added yet.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {data.references.map((ref) => (
            <div
              key={ref.id}
              className="flex flex-col gap-2 rounded-lg border border-ink-700 bg-paper-200 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-stamp/70">
                  Reference
                </span>
                <button
                  onClick={() => removeReference(ref.id)}
                  className="text-ink-600 hover:text-stamp"
                  aria-label="Remove reference"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  value={ref.name}
                  onChange={(e) =>
                    updateReference(ref.id, { name: e.target.value })
                  }
                  placeholder="Name"
                />
                <input
                  className={inputClass}
                  value={ref.relation}
                  onChange={(e) =>
                    updateReference(ref.id, { relation: e.target.value })
                  }
                  placeholder="Relation / role (e.g. Former Manager)"
                />
                <input
                  className={inputClass}
                  value={ref.phone}
                  onChange={(e) =>
                    updateReference(ref.id, { phone: e.target.value })
                  }
                  placeholder="Phone"
                />
                <input
                  className={inputClass}
                  value={ref.email}
                  onChange={(e) =>
                    updateReference(ref.id, { email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
