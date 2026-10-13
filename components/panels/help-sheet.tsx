"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertTriangle, CircleHelp, MousePointerClick, Star } from "lucide-react"

import { NOTE_CITATIONS } from "@/lib/citation-manifest"
import { HALYARD_SLUG } from "@/lib/funds"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useOptionalSourceViewer } from "@/components/source-viewer-provider"

const SHORTCUTS: Array<[string, string]> = [
  ["Esc", "Close the source viewer"],
  ["Hover [n]", "Preview what the pipeline extracted"],
  ["Click [n] or the preview", "Open the source at the cited region"],
  ["‹ ›", "Previous or next citation in the note"],
  ["+ − ⤢", "Zoom the page, or fit to width"],
  ["★", "Pin the extraction to Favorites"],
]

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="bg-muted rounded border px-1.5 py-0.5 font-sans text-[11px] font-medium">{children}</kbd>
}

export function HelpSheet() {
  const viewer = useOptionalSourceViewer()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const active = viewer?.active ?? null

  // "Show me" opens the first citation in the note on screen, or the assessment memo's first.
  const showMe = () => {
    setOpen(false)
    const first = viewer?.citations[0]
    if (viewer && first) {
      viewer.open(first)
      return
    }
    const halyard = NOTE_CITATIONS.find((n) => n.fundSlug === HALYARD_SLUG)
    router.push(`${halyard?.memoHref ?? "/"}?source=1`)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Help" className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
          <CircleHelp />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="tracking-display">How citations work</SheetTitle>
          <SheetDescription className="text-xs">
            Every claim in a generated note cites the page and region of the document it came from. This panel explains what you are looking at.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:block!">
          <div className="px-4 py-3">
            <div className="bg-secondary flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
              <div className="text-xs">
                <div className="text-secondary-foreground font-semibold">Try it</div>
                <div className="text-muted-foreground">Open the first citation and watch the viewer land on the cited region.</div>
              </div>
              <Button size="sm" onClick={showMe}>
                <MousePointerClick />
                Show me
              </Button>
            </div>

            {active && (
              <section className="mt-3 rounded-lg border px-3 py-2.5 text-xs">
                <div className="mb-1 font-semibold">This citation, [{active.sourceNumber}]</div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                  <dt className="text-muted-foreground">File</dt>
                  <dd className="truncate">{active.fileName}</dd>
                  <dt className="text-muted-foreground">Page</dt>
                  <dd>{active.pageNumber}</dd>
                  <dt className="text-muted-foreground">Region</dt>
                  <dd className="tabular-nums">
                    {active.bBox
                      ? `x ${active.bBox.x}, y ${active.bBox.y}, ${active.bBox.w} × ${active.bBox.h} pt from the top-left`
                      : "none recorded; the whole page is cited"}
                  </dd>
                  <dt className="text-muted-foreground">Extracted</dt>
                  <dd>
                    {active.highlight?.label ? `${active.highlight.label}: ` : ""}
                    {active.highlight?.value ?? "no text captured"}
                  </dd>
                  {active.highlight?.reasoning && (
                    <>
                      <dt className="text-muted-foreground">Reasoning</dt>
                      <dd className="italic">{active.highlight.reasoning}</dd>
                    </>
                  )}
                </dl>
              </section>
            )}

            <Accordion type="multiple" defaultValue={["markers"]} className="mt-2">
              <AccordionItem value="markers">
                <AccordionTrigger className="text-sm">Citation markers</AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs leading-relaxed">
                  <p>
                    A marker like <span className="text-primary font-medium">[3]</span> follows each claim. Hover it to see what the extraction pipeline read at that spot; click it, or the preview card, to open the source.
                  </p>
                  <ul className="space-y-1">
                    <li><span className="text-primary decoration-primary/40 font-medium underline decoration-dotted underline-offset-[3px]">[3]</span> dotted underline: you have opened this one before.</li>
                    <li><span className="text-primary font-medium">[3]</span><Star className="fill-primary text-primary ml-0.5 inline size-2.5 align-[-1px]" aria-hidden /> star: pinned in Favorites.</li>
                    <li><span className="text-destructive font-medium">[4]</span><AlertTriangle className="text-destructive ml-0.5 inline size-3 align-[-2px]" aria-hidden /> red: the cited file is not in the data room.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="viewer">
                <AccordionTrigger className="text-sm">The source viewer</AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs leading-relaxed">
                  <p>
                    Opening a citation renders the cited PDF beside the note, scrolls to the cited page and outlines the cited region in blue. Every page of the document is there, so surrounding context is one scroll away.
                  </p>
                  <p>
                    The region comes from the pipeline as a box in PDF points measured from the top-left of the page, and is scaled to whatever zoom you choose. Small table cells get a little padding so they stay visible.
                  </p>
                  <p>Use ‹ › to step through the note&rsquo;s citations in order, the star to pin one, and the external-link button to open the raw PDF.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="extracted">
                <AccordionTrigger className="text-sm">&ldquo;Extracted from source&rdquo;</AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs leading-relaxed">
                  <p>
                    The label and value shown in the preview and at the top of the viewer are what the extraction pipeline saw in that region. They are evidence, not a verdict: the platform shows them next to the claim and leaves the judgement to you.
                  </p>
                  <p>
                    The notification bell runs an advisory numeric check between each claim and its extracted value. It tolerates formatting differences and only flags a citation when no number agrees. Treat a flag as a prompt to look, not as a conclusion.
                  </p>
                  <p>When a region was not recorded, the viewer opens the whole cited page and says so. When the file itself is missing, the extracted text is all that exists and the viewer tells you.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shortcuts">
                <AccordionTrigger className="text-sm">Controls</AccordionTrigger>
                <AccordionContent>
                  <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs">
                    {SHORTCUTS.map(([key, meaning]) => (
                      <div key={key} className="contents">
                        <dt><Kbd>{key}</Kbd></dt>
                        <dd className="text-muted-foreground">{meaning}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="storage">
                <AccordionTrigger className="text-sm">What is remembered</AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs leading-relaxed">
                  <p>
                    The paper trail records every citation you open, with time and the extracted value. Favorites pin extractions for later. Notification read state and the high-contrast setting are kept too.
                  </p>
                  <p>All of it lives in this browser only. Nothing is sent to a server, and clearing site data removes it.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
