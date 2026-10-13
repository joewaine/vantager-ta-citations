import Memo from "@/content/memo.mdx"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Page() {
  return (
    <TooltipProvider delayDuration={150}>
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <Memo />
      </main>
    </TooltipProvider>
  )
}
