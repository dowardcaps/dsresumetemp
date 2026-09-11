import { ResumeTemplate } from "./types";

export const templates: ResumeTemplate[] = [
  {
    id: "ats-classic",
    name: "ATS Classic",
    description: "Centered header, thin rules, no photo — built to pass scanners.",
    layout: "centered-classic",
    accent: "#1B1F29",
    accentSoft: "#EDEFF3",
    headingFont: "serif",
    bestFor: "Corporate, IT, and ATS-heavy applications",
  },
  {
    id: "clean-list",
    name: "Clean List",
    description: "Gray section bars with diamond bullets, no photo.",
    layout: "banner-headers",
    accent: "#4A4A4A",
    accentSoft: "#E9E9E9",
    headingFont: "sans",
    bestFor: "Logistics, analyst, and back-office roles",
  },
  {
    id: "emerald-sidebar",
    name: "Sidebar",
    description: "Left sidebar with circular photo and skill bars — pick any accent color.",
    layout: "sidebar-left-dark",
    accent: "#0F3D2E",
    accentSoft: "#DCEAE3",
    headingFont: "sans",
    bestFor: "Customer service and hospitality roles",
  },
];

export const getTemplate = (id: string): ResumeTemplate =>
  templates.find((t) => t.id === id) ?? templates[0];
