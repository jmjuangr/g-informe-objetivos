import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"

export const runtime = "nodejs"

type SsoPayload = {
  email?: string
  name?: string
  exp?: number
}

const toBase64Url = (value: Buffer) => {
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4))
  return Buffer.from(`${normalized}${padding}`, "base64")
}

const verifyToken = (token: string, secret: string) => {
  const parts = token.split(".")
  if (parts.length !== 2) return null

  const [payloadPart, signaturePart] = parts
  if (!payloadPart || !signaturePart) return null

  let payloadBuffer: Buffer
  try {
    payloadBuffer = fromBase64Url(payloadPart)
  } catch {
    return null
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(payloadPart)
    .digest()

  let providedSignature: Buffer
  try {
    providedSignature = fromBase64Url(signaturePart)
  } catch {
    return null
  }

  if (expectedSignature.length !== providedSignature.length) return null
  if (!timingSafeEqual(expectedSignature, providedSignature)) return null

  let payload: SsoPayload
  try {
    payload = JSON.parse(payloadBuffer.toString("utf-8")) as SsoPayload
  } catch {
    return null
  }

  return payload
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const secret = process.env.HUB_SSO_SECRET

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/", url))
  }

  const payload = verifyToken(token, secret)
  if (!payload?.email) {
    return NextResponse.redirect(new URL("/", url))
  }

  const sessionPayload = {
    email: payload.email,
    name: payload.name ?? null,
    exp: payload.exp ?? null,
  }

  const sessionEncoded = toBase64Url(Buffer.from(JSON.stringify(sessionPayload), "utf-8"))

  const response = NextResponse.redirect(new URL("/", url))
  const nowSeconds = Math.floor(Date.now() / 1000)
  const maxAge =
    typeof payload.exp === "number" && payload.exp > nowSeconds
      ? payload.exp - nowSeconds
      : undefined

  response.cookies.set({
    name: "app_session",
    value: sessionEncoded,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  })

  return response
}
