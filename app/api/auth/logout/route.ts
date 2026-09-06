import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revokeEditorSession, SESSION_COOKIE } from "@/lib/editor-auth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  revokeEditorSession(cookieStore.get(SESSION_COOKIE)?.value);
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
