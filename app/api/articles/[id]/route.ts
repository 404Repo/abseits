import { updateArticle } from "@/db";
import { normalizeArticleInput, serializeArticle, type ArticleInput } from "@/lib/article-input";
import { getAuthorizedEditor } from "@/lib/editor-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAuthorizedEditor())) return Response.json({ error: "Keine Berechtigung." }, { status: 403 });
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Ungültiger Artikel." }, { status: 400 });
    const input = normalizeArticleInput(await request.json() as ArticleInput);
    const now = new Date().toISOString();
    const updated = updateArticle(id, { ...input, publishedAt: input.status === "published" ? now : null, updatedAt: now });
    if (!updated) return Response.json({ error: "Artikel nicht gefunden." }, { status: 404 });
    return Response.json({ article: serializeArticle(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Der Artikel konnte nicht gespeichert werden.";
    if (message.includes("UNIQUE") || message.includes("unique")) return Response.json({ error: "Dieses URL-Kürzel wird bereits verwendet." }, { status: 409 });
    if (message.includes("erforderlich") || message.includes("gültige") || message.includes("URL-Kürzel")) return Response.json({ error: message }, { status: 400 });
    return Response.json({ error: "Der Redaktionsbereich ist vorübergehend nicht verfügbar." }, { status: 500 });
  }
}
