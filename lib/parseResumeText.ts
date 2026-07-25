import { ResumeData, ExperienceEntry, EducationEntry } from "./types";

export interface ParsedResume {
  data: Partial<ResumeData>;
  foundCounts: {
    name: boolean;
    email: boolean;
    phone: boolean;
    experience: number;
    education: number;
    skills: number;
  };
}

const SECTION_HEADERS: { key: string; patterns: RegExp[] }[] = [
  {
    key: "summary",
    patterns: [
      /^(summary|objective|profile|about me|career objective|personal summary|professional summary)\b/i,
    ],
  },
  {
    key: "experience",
    patterns: [
      /^(work experience|experience|employment history|professional experience|work history|career history|relevant experience|professional background)\b/i,
    ],
  },
  {
    key: "education",
    patterns: [
      /^(education|educational background|academic background|academic qualifications|qualifications)\b/i,
    ],
  },
  {
    key: "skills",
    patterns: [
      /^(skills|core competencies|key skills|technical skills|areas of expertise|competencies|software skills|technical proficiencies)\b/i,
    ],
  },
  {
    key: "certifications",
    patterns: [
      /^(certifications?|licenses?|trainings?|seminars?|courses?|workshops?)\b/i,
    ],
  },
];

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
// PH mobile format first, then a generic international/US-style fallback with
// an optional "+countrycode" prefix so plain 10-digit numbers still match.
const PHONE_RE =
  /(?:\+63|0)9\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

// --- Date parsing ---------------------------------------------------------
// Supports: "Jan 2020", "January 2020", "01/2020", "01-2020", "2020",
// joined with "-", "–", "—", "to", "through", or "until", ending in another
// date token or "present" / "current" / "now" / "ongoing".

const MONTH_RE =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
const DATE_TOKEN_RE = `(?:${MONTH_RE}\\.?\\s+\\d{4}|\\d{1,2}[\\/-]\\d{4}|\\d{4})`;
const CONNECTOR_RE = "(?:-|–|—|to|through|until)";
const END_TOKEN_RE = `(?:${DATE_TOKEN_RE}|present|current|now|ongoing)`;

const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN_RE})\\s*${CONNECTOR_RE}\\s*(${END_TOKEN_RE})`,
  "i"
);
// Fallback for entries that only list a single year (e.g. a graduation year).
const SINGLE_YEAR_RE = /\b(?:19|20)\d{2}\b/;

// --- Bullet detection ------------------------------------------------------

// Leading glyphs OCR commonly renders bullet points as.
const BULLET_MARKER_RE = /^\s*[-•●○▪‣∙*»›>]+\s*/;
// Common verbs resume bullets tend to open with. Used so a bullet whose
// leading glyph got lost in OCR ("Led onboarding for 10 hires.") isn't
// mistaken for the start of a new job/school entry.
const BULLET_VERB_RE =
  /^(managed|led|develop(?:ed)?|creat(?:ed)?|implement(?:ed)?|design(?:ed)?|built|coordinat(?:ed)?|assist(?:ed)?|collaborat(?:ed)?|conduct(?:ed)?|deliver(?:ed)?|achiev(?:ed)?|improv(?:ed)?|increas(?:ed)?|reduc(?:ed)?|initiat(?:ed)?|maintain(?:ed)?|organiz(?:ed)?|perform(?:ed)?|prepar(?:ed)?|provid(?:ed)?|resolv(?:ed)?|review(?:ed)?|supervis(?:ed)?|train(?:ed)?|analyz(?:ed)?|automat(?:ed)?|streamlin(?:ed)?|spearhead(?:ed)?|launch(?:ed)?|negotiat(?:ed)?|monitor(?:ed)?|generat(?:ed)?|handl(?:ed)?|execut(?:ed)?|facilitat(?:ed)?|mentor(?:ed)?|draft(?:ed)?|author(?:ed)?|present(?:ed)?|plann(?:ed)?|direct(?:ed)?|oversaw|administer(?:ed)?|process(?:ed)?|research(?:ed)?|test(?:ed)?|deploy(?:ed)?|configur(?:ed)?|optimiz(?:ed)?|migrat(?:ed)?|integrat(?:ed)?|document(?:ed)?|audit(?:ed)?|forecast(?:ed)?|budget(?:ed)?|recruit(?:ed)?|onboard(?:ed)?|schedul(?:ed)?|communicat(?:ed)?|respond(?:ed)?|answer(?:ed)?|operat(?:ed)?|inspect(?:ed)?|install(?:ed)?|repair(?:ed)?|assembl(?:ed)?|sold|market(?:ed)?|promot(?:ed)?|record(?:ed)?|sort(?:ed)?)\b/i;

/**
 * Undo OCR letter-spacing, e.g. "J O H N   D E L A   C R U Z" -> "JOHN DELA CRUZ"
 * or "E X P E R I E N C E" -> "EXPERIENCE". Must run before generic whitespace
 * collapsing, since word boundaries in letter-spaced text are marked by a
 * *wider* gap (2+ spaces) that single-space collapsing would otherwise erase.
 */
function collapseLetterSpacing(line: string): string {
  const trimmed = line.trim();
  if (!/^([A-Za-z]\s+){2,}[A-Za-z][\s:]*$/.test(trimmed)) return line;
  return trimmed
    .replace(/[\s:]*$/, "")
    .split(/\s{2,}/)
    .map((word) => word.replace(/\s+/g, ""))
    .join(" ");
}

function cleanLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => collapseLetterSpacing(l))
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Strip leading numbering/bullets/colons so header matching isn't thrown off by OCR noise. */
function normalizeHeaderCandidate(line: string): string {
  let l = line.trim();
  l = l.replace(/^\d+[.)]\s*/, "");
  l = l.replace(BULLET_MARKER_RE, "");
  l = l.replace(/[:：]\s*$/, "");
  return l.trim();
}

/** Split raw OCR text into { summary, experience, education, skills, certifications, preamble } blocks by header keywords. */
function splitSections(lines: string[]): {
  preamble: string[];
  sections: Record<string, string[]>;
} {
  const sections: Record<string, string[]> = {};
  let currentKey: string | null = null;
  const preamble: string[] = [];

  for (const line of lines) {
    const candidate = normalizeHeaderCandidate(line);
    // Require a short candidate so a bullet that merely mentions a section
    // keyword mid-sentence ("Education coordinator for 200 students") isn't
    // mistaken for a section header.
    const match =
      candidate.length < 40
        ? SECTION_HEADERS.find((h) => h.patterns.some((p) => p.test(candidate)))
        : undefined;
    if (match) {
      currentKey = match.key;
      sections[currentKey] = sections[currentKey] ?? [];
      continue;
    }
    if (currentKey) {
      sections[currentKey].push(line);
    } else {
      preamble.push(line);
    }
  }

  return { preamble, sections };
}

function groupIntoParagraphs(lines: string[]): string[][] {
  // OCR often loses blank lines, so group heuristically: a line that looks
  // like a new entry start (contains a date range, or is a short, title-cased
  // line) begins a new paragraph. Lines carrying a bullet glyph, or opening
  // with a typical resume action verb, are always treated as bullets/
  // continuations — even when short — so a stray "Led onboarding for 10
  // hires." line isn't mistaken for a new job header.
  const groups: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const stripped = line.replace(BULLET_MARKER_RE, "");
    const isBulletish =
      BULLET_MARKER_RE.test(line) || BULLET_VERB_RE.test(stripped);
    const hasDateRange = DATE_RANGE_RE.test(line);

    const looksLikeNewEntry =
      current.length > 0 &&
      !isBulletish &&
      (hasDateRange ||
        (line.length < 60 && /^[A-Z]/.test(line) && !/[.,;]$/.test(line)));

    if (looksLikeNewEntry && current.length >= 2) {
      groups.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

function extractDateRange(text: string): {
  startDate: string;
  endDate: string;
  current: boolean;
} {
  const match = text.match(DATE_RANGE_RE);
  if (match) {
    const startDate = match[1].trim();
    const endRaw = match[2].trim();
    const current = /present|current|now|ongoing/i.test(endRaw);
    return { startDate, endDate: current ? "" : endRaw, current };
  }
  // Fall back to a single graduation-style year (common on education lines).
  const singleYear = text.match(SINGLE_YEAR_RE);
  if (singleYear) {
    return { startDate: "", endDate: singleYear[0], current: false };
  }
  return { startDate: "", endDate: "", current: false };
}

function parseExperience(lines: string[]): ExperienceEntry[] {
  const groups = groupIntoParagraphs(lines);
  return groups.slice(0, 8).map((group) => {
    const [first, ...rest] = group;
    const { startDate, endDate, current } = extractDateRange(group.join(" "));

    const headerLine = first.replace(DATE_RANGE_RE, "").trim();
    const splitOn = headerLine.match(/(.+?)\s*(?:[-–—]|,| at )\s*(.+)/);
    const role = splitOn ? splitOn[1].trim() : headerLine;
    const company = splitOn ? splitOn[2].trim() : "";

    const bullets = rest
      .filter((l) => !DATE_RANGE_RE.test(l))
      .map((l) => l.replace(BULLET_MARKER_RE, ""))
      .filter((l) => l.length > 0);

    return {
      id: newId("exp"),
      role,
      company,
      location: "",
      startDate,
      endDate,
      current,
      bullets: bullets.length > 0 ? bullets : [""],
    };
  });
}

function parseEducation(lines: string[]): EducationEntry[] {
  const groups = groupIntoParagraphs(lines);
  return groups.slice(0, 5).map((group) => {
    const [first, ...rest] = group;
    const { startDate, endDate } = extractDateRange(group.join(" "));

    const headerLine = first
      .replace(DATE_RANGE_RE, "")
      .replace(SINGLE_YEAR_RE, "")
      .trim();
    const splitOn = headerLine.match(/(.+?)\s*(?:[-–—]|,)\s*(.+)/);
    const degree = splitOn ? splitOn[1].trim() : headerLine;
    const school = splitOn ? splitOn[2].trim() : rest[0] ?? "";

    return {
      id: newId("edu"),
      degree,
      school,
      location: "",
      startDate,
      endDate,
    };
  });
}

function parseSkills(lines: string[]): string[] {
  return lines
    .join(", ")
    .split(/,|•|\||\/(?!\d)/)
    .map((s) => s.replace(BULLET_MARKER_RE, "").trim())
    .filter((s) => s.length > 1 && s.length < 40)
    .slice(0, 20);
}

export function parseResumeText(raw: string): ParsedResume {
  const lines = cleanLines(raw);
  const { preamble, sections } = splitSections(lines);

  let fullName = "";
  let title = "";
  const remainder: string[] = [];

  for (const line of preamble) {
    // Contact-info lines are extracted separately below (against the full
    // text) — skip them here so a resume with no explicit "Summary" header
    // doesn't end up with the email/phone stuffed into the summary fallback.
    if (EMAIL_RE.test(line) || PHONE_RE.test(line)) continue;
    if (!fullName && /^[A-Za-z.\s'-]{3,50}$/.test(line)) {
      fullName = line;
      continue;
    }
    if (fullName && !title && line.length < 60) {
      title = line;
      continue;
    }
    remainder.push(line);
  }

  const allText = lines.join(" \n ");
  const emailMatch = allText.match(EMAIL_RE);
  const phoneMatch = allText.match(PHONE_RE);

  const summary = (sections.summary ?? remainder).join(" ").slice(0, 600);
  const experience = sections.experience ? parseExperience(sections.experience) : [];
  const education = sections.education ? parseEducation(sections.education) : [];
  const skills = sections.skills ? parseSkills(sections.skills) : [];
  const certifications = sections.certifications
    ? parseSkills(sections.certifications)
    : [];

  const data: Partial<ResumeData> = {
    ...(fullName ? { fullName } : {}),
    ...(title ? { title } : {}),
    ...(emailMatch ? { email: emailMatch[0] } : {}),
    ...(phoneMatch ? { phone: phoneMatch[0] } : {}),
    ...(summary ? { summary } : {}),
    ...(experience.length ? { experience } : {}),
    ...(education.length ? { education } : {}),
    ...(skills.length ? { skills } : {}),
    ...(certifications.length ? { certifications } : {}),
  };

  return {
    data,
    foundCounts: {
      name: !!fullName,
      email: !!emailMatch,
      phone: !!phoneMatch,
      experience: experience.length,
      education: education.length,
      skills: skills.length,
    },
  };
}
