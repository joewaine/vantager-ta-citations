// Extracts every <SourceBadge /> from the memo MDX files into lib/citations.generated.json,
// with the claim text that precedes each badge. Client code uses it to derive
// notifications without parsing MDX in the browser. Runs before dev and build.
//
//   node scripts/extract-citations.mjs
import { readFileSync, writeFileSync } from "node:fs"

// Mirrors lib/notes.ts; keep both lists in sync.
const NOTES = [
  { fundSlug: "halyard-growth-partners-iii", noteId: "q2-2026-monitoring-note", contentFile: "content/memo.mdx" },
  { fundSlug: "cobalt-ridge-buyout-iv", noteId: "q2-2026-monitoring-note", contentFile: "content/cobalt-ridge-buyout-iv-q2-2026.mdx" },
  { fundSlug: "larkspur-ventures-ii", noteId: "q2-2026-monitoring-note", contentFile: "content/larkspur-ventures-ii-q2-2026.mdx" },
]

const BADGE_OPEN = "<SourceBadge"
const CLAIM_WINDOW_CHARS = 140

/** Parses JSX attributes (`a="s" b={expr}`) into an object. Expressions are trusted project content. */
function parseAttributes(source) {
  const pairs = []
  let i = 0
  while (i < source.length) {
    const match = /^\s*([A-Za-z_]\w*)\s*=\s*/.exec(source.slice(i))
    if (!match) break
    const name = match[1]
    i += match[0].length
    if (source[i] === '"') {
      const end = source.indexOf('"', i + 1)
      pairs.push(`${name}: ${JSON.stringify(source.slice(i + 1, end))}`)
      i = end + 1
    } else if (source[i] === "{") {
      let depth = 0
      let j = i
      do {
        if (source[j] === "{") depth++
        else if (source[j] === "}") depth--
        j++
      } while (depth > 0 && j < source.length)
      pairs.push(`${name}: ${source.slice(i + 1, j - 1)}`)
      i = j
    } else {
      throw new Error(`Unexpected attribute syntax near: ${source.slice(i, i + 40)}`)
    }
  }
  return new Function(`return { ${pairs.join(", ")} }`)()
}

function stripMarkup(text) {
  return text
    .replace(/<SourceBadge[\s\S]*?\/>/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function extract(note) {
  const mdx = readFileSync(note.contentFile, "utf8")
  const citations = []
  let cursor = 0
  while (true) {
    const start = mdx.indexOf(BADGE_OPEN, cursor)
    if (start === -1) break
    const end = mdx.indexOf("/>", start)
    const props = parseAttributes(mdx.slice(start + BADGE_OPEN.length, end))
    const paragraphStart = mdx.lastIndexOf("\n\n", start) + 2
    const claim = stripMarkup(mdx.slice(paragraphStart, start)).slice(-CLAIM_WINDOW_CHARS)
    citations.push({ ...props, claim })
    cursor = end + 2
  }
  return { fundSlug: note.fundSlug, noteId: note.noteId, citations }
}

const manifest = NOTES.map(extract)
writeFileSync("lib/citations.generated.json", JSON.stringify(manifest, null, 2) + "\n")
for (const entry of manifest) console.log(`${entry.fundSlug}: ${entry.citations.length} citations`)
