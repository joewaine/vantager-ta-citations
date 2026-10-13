"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Bell, FileX2, ListChecks, RefreshCw, X } from "lucide-react"

import { ALL_FILE_IDS } from "@/lib/citation-manifest"
import {
  deriveNotifications,
  dismissNotification,
  markRead,
  requestFromGp,
  useDismissed,
  useRead,
  useRequested,
  type Notification,
  type NotificationKind,
} from "@/lib/notifications"
import { usePaperTrail } from "@/lib/paper-trail"
import { useFileAvailabilityMap } from "@/lib/use-file-available"
import { useViewerIdentity } from "@/lib/viewer-identity"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useOpenCitation } from "@/components/panels/use-open-citation"

const KIND_META: Record<NotificationKind, { label: string; Icon: typeof Bell; tone: string }> = {
  discrepancy: { label: "Discrepancy", Icon: AlertTriangle, tone: "text-destructive" },
  "missing-source": { label: "Missing source", Icon: FileX2, tone: "text-amber-600" },
  "source-update": { label: "Source updated", Icon: RefreshCw, tone: "text-primary" },
  unchecked: { label: "Unchecked", Icon: ListChecks, tone: "text-muted-foreground" },
}

export function NotificationsMenu() {
  const trail = usePaperTrail()
  const availability = useFileAvailabilityMap(ALL_FILE_IDS)
  // Read/dismissed marks reset on every sign-in, so the bell is full when you arrive.
  const session = String(useViewerIdentity()?.loginAt ?? "")
  const dismissed = useDismissed(session)
  const read = useRead(session)
  const requested = useRequested()
  const openCitation = useOpenCitation()
  const [open, setOpen] = useState(false)

  const notifications = useMemo(() => deriveNotifications(trail, availability, dismissed), [trail, availability, dismissed])
  const unread = notifications.filter((n) => !read.includes(n.id)).length

  const act = (notification: Notification) => {
    markRead(session, [notification.id])
    setOpen(false)
    if (notification.citation) openCitation(notification.memoHref, notification.citation)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next && notifications.length > 0) markRead(session, notifications.map((n) => n.id))
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground relative">
          <Bell />
          {unread > 0 && (
            <span className="bg-destructive text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums ring-2 ring-primary">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[min(400px,calc(100vw-16px))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div>
            <div className="tracking-display text-sm font-semibold">Verification inbox</div>
            <div className="text-muted-foreground text-xs">Derived from the memos, their sources and your paper trail.</div>
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="xs" onClick={() => markRead(session, notifications.map((n) => n.id))}>Mark all read</Button>
          )}
        </div>
        <ScrollArea className="[&_[data-radix-scroll-area-viewport]>div]:block! max-h-[420px]">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground px-4 py-8 text-center text-sm">Nothing needs attention.</p>
          ) : (
            <ul>
              {notifications.map((notification) => {
                const { Icon, tone, label } = KIND_META[notification.kind]
                const isUnread = !read.includes(notification.id)
                const isRequested = notification.fileId ? requested.includes(notification.fileId) : false
                return (
                  <li key={notification.id} className={cn("flex gap-3 border-b px-4 py-3 last:border-b-0", isUnread && "bg-accent/40")}>
                    <Icon className={cn("mt-0.5 size-4 shrink-0", tone)} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wide uppercase">{label}</div>
                      <button type="button" onClick={() => act(notification)} className="block text-left text-sm leading-snug font-medium hover:underline">
                        {notification.title}
                      </button>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{notification.body}</p>
                      <div className="mt-1.5 flex gap-1">
                        <Button variant="outline" size="xs" onClick={() => act(notification)}>
                          {notification.kind === "unchecked" ? "Continue checking" : notification.kind === "source-update" ? "Re-verify" : "Open citation"}
                        </Button>
                        {notification.kind === "missing-source" && notification.fileId && (
                          <Button variant="outline" size="xs" disabled={isRequested} onClick={() => requestFromGp(notification.fileId!)}>
                            {isRequested ? "Requested from GP" : "Request from GP"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-xs" aria-label="Dismiss" onClick={() => dismissNotification(session, notification.id)}>
                      <X />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
