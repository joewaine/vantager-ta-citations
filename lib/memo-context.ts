/** Identifies which memo a citation belongs to, for the paper trail and favorites. */
export type MemoContext = {
  fundSlug: string
  fundName: string
  memoTitle: string
  memoHref: string
}
