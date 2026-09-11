export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface LanguageEntry {
  id: string;
  name: string;
  level: string; // e.g. "Fluent", "Perfectly", "Conversational"
}

export interface ReferenceEntry {
  id: string;
  name: string;
  relation: string; // e.g. "Former Barangay Captain", "Manager at ABC Corp"
  phone: string;
  email: string;
}

export interface PersonalInfo {
  birthDate: string;
  placeOfBirth: string;
  age: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  religion: string;
  height: string;
  weight: string;
}

export interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications: string[];
  languages: LanguageEntry[];
  references: ReferenceEntry[];
  personal: PersonalInfo;
  photoDataUrl?: string;
  /** Presentation settings for the cropped 1:1 profile image. */
  photoShape?: "round" | "square";
  /** Printed size in inches (square, e.g. 1, 1.5, 2, or any custom value). */
  photoSizeIn?: number;
  /** Custom accent color (hex) overriding the selected template's default. */
  accentColor?: string;
}

export type TemplateLayout =
  | "centered-classic" // Image 1 — Logan Mitchell
  | "banner-headers" // Image 2 — Tiffany Giroux
  | "sidebar-left-dark" // Image 3 — Sophie Walton
  | "photo-top-header" // Image 4 — Herman Walton
  | "sidebar-right-dark" // Image 5 — Gregory Walls
  | "block-header-single" // Image 6 — Kane Jones
  | "sidebar-right-light" // Image 7 — Matthew Jones
  | "block-photo-header" // Image 8 — Christopher Gonan
  | "formal-ph"; // Image 9 — Allia Marie Sustal

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  layout: TemplateLayout;
  accent: string; // hex, used both in preview + docx
  accentSoft: string; // hex, tint for backgrounds
  headingFont: "serif" | "sans" | "mono";
  bestFor: string;
}
