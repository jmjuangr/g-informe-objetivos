import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const HUB_FALLBACK = "https://g-apps-hub.vercel.app"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/sso")) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get("app_session")
  if (sessionCookie?.value) {
    return NextResponse.next()
  }

  const hubBaseUrl = process.env.HUB_BASE_URL || HUB_FALLBACK
  const redirectUrl = encodeURIComponent(request.nextUrl.href)
  const target = `${hubBaseUrl}/sso?redirect=${redirectUrl}`
  return NextResponse.redirect(target)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sso).*)"],
}
