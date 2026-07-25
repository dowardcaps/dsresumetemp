# DS Document Formatter

A resume/document formatter for DS Prints and Supplies. Pick a template, fill in the customer's details on the left, watch the live preview update on the right, then export.

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, and the `docx` library.

## How it works

1. **Template gallery** — 5 templates, each suited to a different kind of applicant:
   - **Classic Serif** — traditional, ATS-friendly, single column
   - **Modern Edge** — teal sidebar, clean sans-serif, good for office/admin/sales
   - **Minimal Mono** — lots of whitespace, monospace accents, good for tech/design
   - **Executive Bold** — dark header banner, senior/managerial tone
   - **Compact Grid** — two-column, fits more onto one page (long work history, OFW applicants)
2. **Edit + live preview** — fill in personal details, summary, experience (with bullet highlights), education, skills, and certifications. The preview on the right updates as you type.
3. **Switch templates any time** — the same data re-flows into any of the 5 layouts via the dropdown in the toolbar, so you can show a customer two or three looks without re-typing anything.
4. **Export**:
   - **Download DOCX** — generates a real, editable Word document matching the chosen template's layout and accent color, ready to hand off or print at the shop.
   - **Save as PDF** — uses the browser's native print dialog (Ctrl/Cmd+P → Save as PDF) with a dedicated print stylesheet that isolates just the resume sheet at full letter size.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy

Same as your other DS Prints apps — push to GitHub and import in Vercel, or:

```bash
npm install -g vercel
vercel
```

## Adding more templates

Templates live in `lib/templates.ts`. Add an entry with a layout (`single`, `sidebar`, or `banner`), accent colors, and heading font — the gallery card, live preview, and DOCX export all read from that one definition, so a new template mostly needs a design decision, not new rendering code.

If a genuinely new layout shape is needed (not single/sidebar/banner), add the rendering branch in `components/ResumePreview.tsx` and a matching section builder in `lib/docxGenerator.ts`.

## Project structure

```
app/
  layout.tsx          Root layout, fonts, metadata
  page.tsx             Gallery → edit/preview flow, export actions
  globals.css           Tailwind + print stylesheet for PDF export
components/
  TemplateGallery.tsx    Template picker with mini live-style previews
  ResumeForm.tsx          Data entry form (personal, experience, education, skills)
  ResumePreview.tsx       Renders the resume live in the browser per template layout
lib/
  types.ts               ResumeData / ResumeTemplate types
  templates.ts             The 5 template definitions
  sampleData.ts             Placeholder data shown before a customer's info is entered
  docxGenerator.ts           Builds a real .docx file matching the template
```

## Import from an old resume photo (OCR)

At the top of the edit form, "Import from an old resume photo" lets a customer upload a photo or scan of their existing resume. It runs OCR entirely in the browser (via `tesseract.js` — no server, no API key, nothing uploaded anywhere) and tries to sort the extracted text into name, email, phone, summary, experience, education, skills, and certifications using keyword and pattern matching.

**Be upfront with customers about accuracy**: this is pattern-matching, not true document understanding. It works well on:
- Clear, well-lit photos or clean scans
- Resumes with obvious section headers (EXPERIENCE, EDUCATION, SKILLS, etc.)
- Printed text (not handwriting)

It will misfire on blurry photos, unusual formatting, or resumes without clear section breaks — dates might land in the wrong field, a job title might get merged with a company name, etc. The tool shows exactly what it found (with a raw extracted text view) before anything is applied, and "Apply to form" only fills fields — it never auto-submits, so there's always a review step before printing.

## ID photo

The "ID photo" section lets a customer upload a photo and drag/zoom to frame it in a square crop, then attach it to the resume — it appears in the live preview and the DOCX export (top-right corner for Classic/Minimal, sidebar for Modern/Compact, top-right of the banner for Executive).

## Notes

- All processing (OCR and photo cropping) happens in the browser; nothing is uploaded to a server, so there's no backend/database to maintain for this tool.
- The first OCR run in a session takes a few extra seconds since the browser downloads the OCR engine (~2-4MB) from a CDN the first time. It's cached after that.
