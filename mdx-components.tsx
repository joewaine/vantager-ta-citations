import type { MDXComponents } from "mdx/types"

import { SourceBadge } from "@/components/source-badge"

// Document typography for the monitoring note. The memo's wording is fixed, so layout
// comes from these element styles alone. Metadata lines ("Prepared for:", "Period:")
// are paragraphs that start with <strong>; the :has() variant picks them out.
const METADATA_LINE = "[&:has(>strong:first-child)]:my-0.5 [&:has(>strong:first-child)]:text-muted-foreground"

const components = {
  h1: (props) => <h1 className="tracking-display mb-3 text-[22px] leading-tight font-semibold" {...props} />,
  h2: (props) => (
    <h2 className="text-primary mt-7 mb-1.5 border-t pt-5 text-[13px] font-semibold tracking-wide uppercase first:mt-0" {...props} />
  ),
  p: (props) => <p className={`text-foreground/90 my-2 text-[13px] leading-5 ${METADATA_LINE}`} {...props} />,
  strong: (props) => <strong className="text-foreground font-semibold" {...props} />,
  SourceBadge,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
