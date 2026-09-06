import { createArticle, listArticles } from "@/db";
import { normalizeArticleInput, serializeArticle, type ArticleInput } from "@/lib/article-input";
import { getAuthorizedEditor } from "@/lib/editor-auth";

export async function GET() {
  try {
    if (!(await getAuthorizedEditor())) return Response.json({ error: "Keine Berechtigung." }, { status: 403 });
    const rows = listArticles();
    return Response.json({ articles: rows.map(serializeArticle) });
  } catch (error) { return routeError(error); }
}

export async function POST(request: Request) {
  try {
    if (!(await getAuthorizedEditor())) return Response.json({ error: "Keine Berechtigung." }, { status: 403 });
    const input = normalizeArticleInput(await request.json() as ArticleInput);
    const now = new Date().toISOString();
    const created = createArticle({ ...input, publishedAt: input.status === "published" ? now : null, updatedAt: now });
    return Response.json({ article: serializeArticle(created) }, { status: 201 });
  } catch (error) { return routeError(error); }
}

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Der Artikel konnte nicht gespeichert werden.";
  if (message.includes("UNIQUE") || message.includes("unique")) return Response.json({ error: "Dieses URL-Kürzel wird bereits verwendet." }, { status: 409 });
  if (message.includes("erforderlich") || message.includes("gültige") || message.includes("URL-Kürzel")) return Response.json({ error: message }, { status: 400 });
  return Response.json({ error: "Der Redaktionsbereich ist vorübergehend nicht verfügbar." }, { status: 500 });
}
