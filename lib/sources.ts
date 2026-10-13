export type BBox = {
  x: number
  y: number
  w: number
  h: number
}

export type SourceHighlight = {
  label?: string
  value?: string
  reasoning?: string
}

export type SourceBadgeProps = {
  sourceNumber: number
  fileId: string
  fileName: string
  pageNumber: number
  bBox?: BBox
  highlight?: SourceHighlight
}

export const getFileUrl = (fileId: string) => `/docs/${fileId}.pdf`
