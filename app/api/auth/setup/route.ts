import { NextResponse } from "next/server";
import {
  registerFirstEditor,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
} from "@/lib/editor-auth";

export async function POST(request: Request) {
  const form = await request.formData();

  try {
    const result = registerFirstEditor(
      String(form.get("email") || ""),
      String(form.get("password") || ""),
      String(form.get("setupToken") || ""),
    );
    const response = NextResponse.redirect(new URL("/redaktion", request.url), 303);
    response.cookies.set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" && process.env.SESSION_COOKIE_SECURE !== "false",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    return response;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    const knownReasons = ["already-configured", "setup-token", "email", "password"];
    const code = knownReasons.includes(reason) ? reason : "unknown";
    return NextResponse.redirect(new URL(`/redaktion/setup?error=${code}`, request.url), 303);
  }
}
