# Notes

## Running it

```bash
pnpm install
pnpm dev
```

The app sits behind a simulated sign-in. Open http://localhost:3000, click **Continue with MSCI**, then use the demo account: email `joe@joewaine.co`, password `testDemo`. There is no user directory; that one account is accepted and the session is an HMAC-signed cookie (12h). Set `AUTH_SECRET` to override the development signing key.

The memo is at `/`. Funds list is at `/funds`, with the Halyard fund page linking to the memo and its source PDFs.

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
- Source viewer is a persistent right-hand panel beside the memo, not a modal. Analysts check many citations in a row and need the memo readable while the source is open. On narrow screens it goes full-screen.
- Badges register with a context provider on mount so the panel can step prev/next through citations in memo order. Esc closes.
- The viewer renders every page of the document in a scroll column (4 pages max here) and scrolls the cited page into view, so neighbouring context is one scroll away.
- Highlight overlay is an absolutely positioned div over the canvas. Scale is `renderedWidth / page.originalWidth` per page, so the landscape page 3 lays out correctly. The box gets 3pt of padding so 9pt table cells stay visible.
- Missing file (badge 4): the viewer gates on the same HEAD check the badge uses, so pdf.js is never asked to load a 404. Before that gate, react-pdf logged a console error that tripped the Next dev overlay.
- pdf.js worker is copied into `public/` and served statically rather than resolved through the bundler. Avoids Turbopack worker-URL issues and guarantees the worker version matches the pinned `pdfjs-dist`.
- React Compiler lint rule forbids setState in effects; per-document state resets by keying `PdfDocument` on the file id instead.
- Design follows MSCI: Vantager is now the MSCI Diligence Platform, so the memo sits inside that chrome. Sampled msci.com and the platform screenshots: Inter typeface, electric blue `#1a3fd6` primary, dark blue `#0626a9`, lavender `#f4f5fd` surfaces, near-black text, 8px radius. Region highlight is brand blue rather than yellow.
- Tooltips follow the platform's light card style (white, 1px border, soft shadow) instead of shadcn's default black. The badge tooltip has a brand-blue header band with file and page, then label and value.
- Favicon is the MSCI globe mark from msci.com, recoloured to white with alpha preserved.
- Citation marker is now a plain `[n]` in brand blue, inline with the text like a footnote reference, instead of a pill. Hover shows the extraction; a dotted underline marks citations already opened; a small star marks favorites; red marks a missing source file.
- The product shell borrows from the Diligence Platform screenshots: blue top bar with wordmark, global search, favorites, paper trail and account menu; collapsible left sidebar with the platform's Dashboard and Platform sections; breadcrumb row with the sidebar toggle; a report toolbar above the memo with citation progress. Sidebar entries that are not part of this assessment are rendered inert and labelled as such.
- Fictional fund universe in `lib/funds.ts`: six funds for Meridian Public Employees Trust. Halyard's figures match the memo's source documents; the rest are invented. The Halyard documents list includes the Q1 2026 report as "Missing from data room", which is the file badge 4 cites.
- Breadcrumbs are real links: Funds list → fund detail (stats, documents, recent activity) → memo. `/funds/[slug]` is statically generated for every fund.
- Paper trail: every citation opened is recorded (time, viewer, fund, memo, source number, extracted label and value) in localStorage and shown in the Paper trail panel, newest first, with a clear action. The fund page shows the fund's slice. Nothing leaves the browser; a real deployment would post these events to the server.
- Favorites: the star in the viewer header pins an extraction. The Favorites panel lists them grouped by fund and opens the citation in place, or navigates to the memo with `?source=N` and opens it after the badges register.
- Viewer gained zoom (50–300%, fit to width) with horizontal scrolling; the highlight scales with it.
- Tooltip overlap: the badge tooltip now floats 8px above the line with an opaque white body, a stronger shadow and a hairline ring, so it reads as a layer over the memo text rather than merging with it.
- Sign-in flow copies the two real screens: `/login` (diligence.msci.com style card with "Continue with MSCI"), then `/login/identifier` and `/login/password` (accounts.msci.com style: photo backdrop, square white panel, serif type, floating-label fields, pill button, dark footer). Email is carried between steps in a short-lived cookie, never in the URL. `proxy.ts` gates every route except `/login*` and static assets and remembers the requested path for after sign-in.
- Bug found while testing sign-in: a cookie-name constant exported from a `"use client"` module becomes a client reference when imported into a server action, so the cookie name arrived as a function stub. Shared constants now live in `lib/session.ts`, which has no directive.
- Display headings use a `tracking-display` utility (-0.04em, Inter 600) sampled from msci.com's hero headings, applied to the memo title, funds list, fund detail, login card, report toolbar and panel titles.
- Memo typography tightened: 22px title, metadata lines pulled in under it at 13px muted, section headings as small uppercase blue labels with a hairline rule above, 13px body at 20px leading, the same size as the metadata lines, and no horizontal padding around `[n]` markers so punctuation sits flush.
- The account menu's initials come from a display cookie set at sign-in. The proxy re-issues that cookie from the verified session whenever it is missing, so a session that predates the cookie (or a cleared cookie) still shows the right identity.
- The badge tooltip is itself a click target: Radix keeps it open while the pointer is over it, and the whole card opens the viewer, so a reader can move from `[n]` onto the preview and click there.
- Two more funds have cited documents so favorites and the paper trail show real per-fund grouping. `scripts/generate-fixture-pdfs.mjs` builds fictional Q2 2026 quarterly reports for Cobalt Ridge Buyout IV and Larkspur Ventures II with pdf-lib (the tool the originals were made with), prints the top-left bBox of every cited row, and the regions were verified against `pdftotext -bbox-layout` the same way as the Halyard boxes. Their monitoring notes are MDX under `content/`, registered in `lib/memos.ts`, and served at `/funds/[slug]/notes/[note]`. The assessment memo keeps `/` as its only URL.
- Favorites panel groups are collapsible drawers per fund, open by default, with a count.
- Login backdrop is `public/login-bg.jpg` from static.msci.com, layered over a gradient fallback. It is 1.9 MB; a production build would serve a resized, compressed variant.

## Libraries

- Already in the repo and used: `radix-ui` via shadcn `Badge` and `Tooltip`, `lucide-react` icons, `cn` for class merging.
- `react-pdf` 11.0.0 (React 19 peer) with `pdfjs-dist` pinned to 6.3.289 to match its bundled API version. Text and annotation layers are off; the view is canvas only.
- shadcn additions via the CLI: `scroll-area`, `separator`, `skeleton`, `alert`.
- `next/font/google` Inter replaces Geist Sans.
- shadcn additions for the shell and auth: `sheet`, `dropdown-menu`, `tabs`, `table`, `card`, `input`, `label`.
- `fflate` for client-side zip bundles.
- `pdf-lib` (dev) for the fixture report generator.
- shadcn `popover` and `collapsible` for the notification panel and favorites drawers.
- No auth library. Session signing uses Web Crypto HMAC so the same code runs in the edge proxy and the Node server actions.

## Notification bell: verification inbox

The bell is a dropdown panel of alerts derived on the client from three inputs: the citation manifest, file availability, and the viewer's paper trail. Nothing is stored except dismissals, read state and "requested from GP" flags, all in localStorage.

- **Citation manifest.** `scripts/extract-citations.mjs` parses every `<SourceBadge />` out of the MDX files, together with the claim text that precedes it in the paragraph, into `lib/citations.generated.json`. It runs before `pnpm dev` and `pnpm build`. The memo files are untouched.
- **Discrepancy alerts** compare the numbers in the claim text with the numbers in the extracted value (`lib/claim-check.ts`). The check is deliberately lenient, with 1% tolerance and unit scaling so "15,888,000" agrees with "$15.9 million" and a bare "38.9" agrees with "$38.9 million". It flags only when both sides have numbers and none agree. Across all 28 citations it flags exactly one: Halyard badge 1, $218.6 million against 212.4. The alert says "may disagree" and opens the citation; the analyst still decides.
- **Missing-source alerts** come from the same HEAD check the badges use, one per missing file per note, with a "Request from GP" action that records the request.
- **Unchecked-citations nudge** per note once at least one citation has been opened, naming the next unchecked one.
- **Source updates** are the one kind the client cannot derive; a fictional re-upload event for the Halyard Q2 report is seeded in `lib/notifications.ts`.
- Opening the panel marks everything read. Items can be dismissed individually.

## Print and share

- **Print / PDF** uses the browser's print path with a print stylesheet: platform chrome and the viewer are hidden, the memo card becomes a plain document, and a sources list is appended so every `[n]` resolves on paper. Save as PDF from the print dialog.
- **Share** mints a signed link (`/share/<token>`, HMAC with a 7-day expiry, recording who shared it) that renders a read-only copy without sign-in: the memo, citation markers as footnote links, and the sources list. The source PDFs stay behind sign-in. The proxy lets `/share/*` through; the page verifies the token itself and 404s on anything invalid or expired.
- **Download HTML** builds a single self-contained file from the rendered memo on the client: inline styles, markers turned into footnote anchors, the sources list appended, no scripts or external assets. It opens anywhere.
- To support both, the citation marker renders as a plain footnote link whenever no source viewer is present, which is also what a shared or printed copy wants.

## Evidence bundles (.zip)

- **Memo bundle** from the Share menu: README, the standalone HTML copy of the note, `citations.csv` and `citations.json` (source number, file, page, region in PDF points, extracted label and value, claim excerpt, whether the file is in the bundle), and `documents/` with every cited PDF that exists. Missing sources, like the Q1 report badge 4 cites, are named in the README rather than silently skipped.
- **Fund bundle** from the fund page's documents card: README, `documents.csv` with every document and its status, and the available PDFs.
- Built in the browser with `fflate`; the session already covers the PDF fetches and the rendered memo supplies the HTML, so there is no server route to secure separately. Each distinct file is fetched once.

## High-contrast mode

- Toggle in the account menu, stored per browser, defaulting on when the OS reports "prefers more contrast". A tiny inline script sets `data-contrast` on `<html>` before first paint so there is no flash.
- Intended for displays with blown-out colour: pure-black ink, darker secondary text, mid-grey borders instead of hairlines, a deeper brand blue, the pale lavender and grey tints replaced with stronger ones, font smoothing off for heavier strokes, and shadows replaced with 1px outlines so edges survive.
- Non-colour cues so meaning does not depend on hue: citation markers become bold and underlined, the cited-region highlight gets a 3px border and a denser fill, status badges take a border in their own colour, focus rings become a 3px outline.
- Implemented purely as token overrides on the existing shadcn variables plus a handful of targeted rules in `app/globals.css`, so every component picks it up without changes.

## Mobile pass

- Below `md` the sidebar moves into a left sheet opened from the breadcrumb toggle; it closes itself after navigation by remounting on pathname change.
- The source viewer sits below the top bar as a full-width panel on phones, with the close button always reachable.
- Fund tables drop secondary columns at `md` and `lg` (strategy, vintage, called, NAV, document count; type and period on the detail page) and keep horizontal scrolling for what remains.
- Popovers cap at the viewport width minus a gutter. Panel sheets are full width on phones.
- Memo, fund and login padding steps down at `sm`; the wordmark collapses to "MSCI" on phones; the login footer centers and wraps.
- Expired or malformed share links render an explicit card rather than a 404, because the token is checked in a streamed boundary after the page shell has already been sent.

## Help panel

The question mark opens a sheet: a "Show me" action that opens the first citation of the note on screen (or the assessment memo's first); a live readout of the open citation (file, page, region in PDF points, extracted label and value, reasoning if present); and accordion sections on citation markers and their states, the viewer, what "extracted from source" means and why it is shown rather than judged, the controls, and what the browser remembers.

## Sidebar, notifications at sign-in, badge registration

- Sidebar groups are expand/collapse drawers: the group holding the current page starts open, the chevron toggles any group, and the sidebar remounts on navigation so the active section is always revealed. Group labels with a route are links; the chevron is a separate control.
- Notification read and dismissed marks are scoped to the sign-in (a `loginAt` stamp in the display cookie, also restored by the proxy), so each login starts with a full bell. Untouched notes now get an "awaiting check" nudge and a second seeded source update covers Cobalt Ridge; a fresh sign-in shows seven items.
- Fixed a registration churn: badges re-registered on every provider change because the effect depended on the whole context. They now depend on the stable `register` callback and their source number only, which also clears a React instrumentation warning in dev.
