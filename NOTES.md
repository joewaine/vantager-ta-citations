# Notes

## Process

- Cloned the repo, ran `pnpm install` and `pnpm build` to confirm the baseline compiles (Next 16.4, React 19.3, static prerender).
- Before writing any code, extracted word coordinates from both PDFs with `pdftotext -bbox-layout` and checked every `bBox` against them. All 12 boxes land on the expected text with the top-left origin, so no y-axis flip is needed.
- Page 3 of the quarterly report is landscape (792 x 612 pt, rotate 0). Scale for the highlight overlay has to come from each page's own width.
- Ran `pnpm dev` on the untouched repo and confirmed: memo renders at localhost:3000, all 14 badges present as plain `[n]`, both PDFs serve from `/docs/`, and the Q1 report referenced by badge 4 returns 404.
- Used Claude Code as the AI tool. Prompts are logged verbatim in `ai-conversations/prompts.md`; the full transcript export is in the same folder.

## Findings in the data

- Badge 1: the memo says NAV of $218.6M but the source PDF (and the badge's extracted value) says 212.4. The badge design must make the extracted value visible before the source is opened.
- Badge 4 cites `q1-2026-quarterly-report`, which is not in `public/docs/`. Needs an unavailable state.
- Badge 10 has no `bBox` and no `highlight`. Page-only citation.
- Badges 11 and 14 differ from the memo only in formatting ("15,888,000" vs "$15.9 million"). Decided to show the extracted value rather than auto-judge matches.

## Decisions

- Build UI on shadcn components (radix-nova style already configured in `components.json`) rather than hand-rolled Tailwind, so the badge, tooltip, and the coming viewer share one design system.
- Badge v1 (template): shadcn `Badge` (outline variant) inside a `<sup>`, with a shadcn `Tooltip` showing short file name, page, extracted label and value. Clicking opens the PDF in a new tab at `#page=N` as a stand-in until the viewer exists.
- Badge states: `outline` for a normal citation, `destructive` with a warning icon when the file 404s, and a "whole page, no region recorded" line in the tooltip when `bBox` is absent.
- File availability is checked client-side with one HEAD request per distinct file (`lib/use-file-available.ts`), cached at module level so 14 badges make 3 requests, not 14.
- `SourceBadge` became a client component; the MDX page stays a server component and only wraps the memo in a `TooltipProvider`.

## Libraries

- Already in the repo and used: `radix-ui` via shadcn `Badge` and `Tooltip`, `lucide-react` icons, `cn` for class merging.
- (PDF viewer library added when the viewer is built.)
