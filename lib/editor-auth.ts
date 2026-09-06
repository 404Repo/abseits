import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createEditor, createSession, deleteExpiredSessions, deleteSession, findEditorByEmail, findEditorBySession, hasEditor } from "@/db";
import { hashPasswordSync, verifyPassword } from "@/lib/password";

export const SESSION_COOKIE = "abseits_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export type EditorIdentity = { id: number; email: string };

export async function getAuthorizedEditor(): Promise<EditorIdentity | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const editor = findEditorBySession(hashToken(token), new Date().toISOString());

  return editor ?? null;
}

export async function requireAuthorizedEditor(): Promise<EditorIdentity> {
  const editor = await getAuthorizedEditor();
  if (!editor) redirect("/redaktion/login");
  return editor;
}

export function authenticateEditor(email: string, password: string): { editor: EditorIdentity; token: string } | null {
  const editor = findEditorByEmail(email.trim().toLowerCase());
  if (!editor || !verifyPassword(password, editor.passwordHash)) return null;

  return createEditorSession({ id: editor.id, email: editor.email });
}

export function registerFirstEditor(email: string, password: string, setupToken: string): { editor: EditorIdentity; token: string } {
  if (hasConfiguredEditor()) throw new Error("already-configured");
  if (process.env.SETUP_TOKEN && setupToken !== process.env.SETUP_TOKEN) throw new Error("setup-token");

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error("email");
  if (password.length < 12) throw new Error("password");

  const editor = createEditor(normalizedEmail, hashPasswordSync(password));

  return createEditorSession(editor);
}

function createEditorSession(editor: EditorIdentity): { editor: EditorIdentity; token: string } {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000).toISOString();
  deleteExpiredSessions(new Date().toISOString());
  createSession(hashToken(token), editor.id, expiresAt);
  return { editor, token };
}

export function revokeEditorSession(token: string | undefined): void {
  if (!token) return;
  deleteSession(hashToken(token));
}

export function hasConfiguredEditor(): boolean {
  return hasEditor();
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
