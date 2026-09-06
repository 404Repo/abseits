import { duplicateArticle } from "@/db";
import { serializeArticle } from "@/lib/article-input";
import { getAuthorizedEditor } from "@/lib/editor-auth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAuthorizedEditor())) return Response.json({ error: "Keine Berechtigung." }, { status: 403 });
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Ungültiger Artikel." }, { status: 400 });
    const duplicated = duplicateArticle(id);
    if (!duplicated) return Response.json({ error: "Artikel nicht gefunden." }, { status: 404 });
    return Response.json({ article: serializeArticle(duplicated) }, { status: 201 });
  } catch {
    return Response.json({ error: "Der Artikel konnte nicht dupliziert werden." }, { status: 500 });
  }
}
