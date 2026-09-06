import { NextResponse } from "next/server";
import {
  authenticateEditor,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
} from "@/lib/editor-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const result = authenticateEditor(email, password);

  if (!result) {
    return redirectTo("/redaktion/login?error=credentials");
  }

  const response = redirectTo("/redaktion");
  response.cookies.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.SESSION_COOKIE_SECURE !== "false",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}

function redirectTo(location: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { location } });
}
