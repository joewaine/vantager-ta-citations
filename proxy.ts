import { NextResponse, type NextRequest } from "next/server"

import { RETURN_TO_COOKIE, SESSION_COOKIE, SESSION_TTL_SECONDS, USER_COOKIE, verifySession } from "@/lib/session"

const RETURN_TO_TTL_SECONDS = 10 * 60
const secure = process.env.NODE_ENV === "production"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  // Shared read-only copies carry their own signed token; no session needed.
  if (pathname.startsWith("/share/")) return NextResponse.next()

  if (pathname.startsWith("/login")) {
    if (session) return NextResponse.redirect(new URL("/funds", request.url))
    return NextResponse.next()
  }
  if (session) {
    const response = NextResponse.next()
    // The display cookie is a convenience copy; restore it from the signed session if it is missing.
    if (!request.cookies.get(USER_COOKIE)) {
      response.cookies.set(USER_COOKIE, JSON.stringify({ email: session.email, name: session.name, loginAt: session.iat }), {
        path: "/",
        sameSite: "lax",
        secure,
        maxAge: SESSION_TTL_SECONDS,
      })
    }
    return response
  }

  const response = NextResponse.redirect(new URL("/login", request.url))
  // Only remember real page navigations. Browsers and devtools probe paths like
  // /.well-known/... without a session; those must never become the post-login target.
  if (isPageNavigation(request) && isReturnablePath(pathname)) {
    response.cookies.set(RETURN_TO_COOKIE, pathname, { httpOnly: true, path: "/", sameSite: "lax", maxAge: RETURN_TO_TTL_SECONDS })
  }
  return response
}

function isPageNavigation(request: NextRequest) {
  if (request.method !== "GET") return false
  const dest = request.headers.get("sec-fetch-dest")
  if (dest) return dest === "document"
  return request.headers.get("accept")?.includes("text/html") ?? false
}

export function isReturnablePath(pathname: string) {
  return pathname.startsWith("/") && !pathname.startsWith("//") && !pathname.includes("/.") && !pathname.startsWith("/login")
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ["/((?!_next/|\\.well-known/|favicon\\.ico|pdf\\.worker\\.min\\.mjs|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
}
