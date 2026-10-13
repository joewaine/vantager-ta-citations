# Cited memo: source viewer

About 90 minutes. AI coding tools are welcome.

## Context

Our platform turns fund documents into analysis. Every claim in a generated report cites the page, and the region on that page, where the evidence came from.

Analysts need to check those citations quickly, because they decide whether to trust the report.

`content/memo.mdx` is a monitoring note on a fictional fund. Each citation is a `<SourceBadge />` with the props in `lib/sources.ts`. Right now the badge only renders `[n]`.

## The task

Make the citations useful to an analyst checking this memo:

1. **Citation badges.** Design the badge and what it shows before it is opened.
2. **Source viewer.** Opening a badge shows the cited PDF at the right page, with the cited region highlighted.

You decide the interaction model, the layout and the PDF library. Do not change the memo's wording or the badge props.

## Data

- PDFs are in `public/docs/`. A badge's file is at `getFileUrl(fileId)`.
- `bBox` is in PDF points, with the origin at the top-left of the page.
- `highlight` is the text our extraction pipeline saw in that region.

## Deliverables

- The running app.
- `NOTES.md`: a short summary of your process, the decisions you made, and the libraries you used.
- An export of your AI tool conversations.

Afterwards, we'll do a 30-minute walkthrough of your work together.

## Run

```bash
pnpm install
pnpm dev
```

npm or bun work too.
