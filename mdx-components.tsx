import type { MDXComponents } from "mdx/types"

import { SourceBadge } from "@/components/source-badge"

const components = {
  h1: (props) => <h1 className="mb-6 text-2xl font-semibold tracking-tight" {...props} />,
  h2: (props) => <h2 className="mt-10 mb-3 text-lg font-semibold" {...props} />,
  p: (props) => <p className="text-foreground/90 my-3 leading-7" {...props} />,
  strong: (props) => <strong className="font-medium" {...props} />,
  SourceBadge,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
