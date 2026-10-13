// Advisory numeric comparison between a memo claim and the value the extraction
// pipeline saw. Deliberately lenient: it only raises a flag when both sides contain
// numbers and none of them agree, so formatting differences ("15,888,000" vs
// "$15.9 million") pass and only genuine disagreements surface.

const NUMBER_PATTERN = /-?\d[\d,]*(?:\.\d+)?/g
const RELATIVE_TOLERANCE = 0.01
const MILLION = 1_000_000
const BILLION = 1_000_000_000

type Figure = { value: number; scaled: number[] }

function figuresIn(text: string): Figure[] {
  const figures: Figure[] = []
  for (const match of text.matchAll(NUMBER_PATTERN)) {
    const value = Number(match[0].replace(/,/g, ""))
    if (!Number.isFinite(value)) continue
    const tail = text.slice(match.index! + match[0].length, match.index! + match[0].length + 12).toLowerCase()
    const scaled = [value]
    if (/^\s*(million|m\b|mm\b)/.test(tail)) scaled.push(value * MILLION)
    if (/^\s*(billion|bn\b|b\b)/.test(tail)) scaled.push(value * BILLION)
    figures.push({ value, scaled })
  }
  return figures
}

function close(a: number, b: number) {
  if (a === b) return true
  const magnitude = Math.max(Math.abs(a), Math.abs(b))
  return magnitude > 0 && Math.abs(a - b) / magnitude <= RELATIVE_TOLERANCE
}

export type ClaimCheck = "agrees" | "disagrees" | "not-comparable"

/** Compares the numbers in a claim with those in the extracted value. Source values are
 *  often in millions without a unit, so a bare source number may match a claim number
 *  either directly or after the claim's own unit scaling. */
export function checkClaim(claim: string | undefined, extracted: string | undefined): ClaimCheck {
  if (!claim || !extracted) return "not-comparable"
  const claimFigures = figuresIn(claim)
  const sourceFigures = figuresIn(extracted)
  if (claimFigures.length === 0 || sourceFigures.length === 0) return "not-comparable"
  for (const source of sourceFigures) {
    for (const target of claimFigures) {
      for (const s of source.scaled) {
        for (const t of target.scaled) {
          if (close(s, t)) return "agrees"
        }
      }
      // A bare source number may itself be in millions.
      if (target.scaled.some((t) => close(source.value * MILLION, t))) return "agrees"
    }
  }
  return "disagrees"
}
