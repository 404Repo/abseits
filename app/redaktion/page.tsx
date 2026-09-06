import { EditorApp, type EditableArticle } from "@/app/redaktion/editor";
import { SiteHeader } from "@/components/site-header";
import { listArticles } from "@/db";
import { requireAuthorizedEditor } from "@/lib/editor-auth";
import { legacyTextToHtml } from "@/lib/article-html";

export const dynamic = "force-dynamic";

export default async function RedaktionPage() {
  const editor = await requireAuthorizedEditor();
  const rows = listArticles();
  const editable: EditableArticle[] = rows.map((row) => ({ id: row.id, title: row.title, kicker: row.kicker, subtitle: row.subtitle, slug: row.slug, excerpt: row.excerpt, summary: row.summary, content: legacyTextToHtml(row.content), category: row.category, tags: parseTags(row.tags).join(", "), coverImage: row.coverImage ?? "", imageAlt: row.imageAlt ?? "", status: row.status === "published" ? "published" : row.status === "archived" ? "archived" : "draft", updatedAt: row.updatedAt }));
  return <main className="min-h-screen"><SiteHeader /><EditorApp initialArticles={editable} editorEmail={editor.email} signOutPath="/api/auth/logout" /></main>;
}
function parseTags(value: string): string[] { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : []; } catch { return []; } }
