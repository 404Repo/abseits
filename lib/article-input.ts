import { categories } from "@/lib/content";
import { articleHtmlHasText, sanitizeArticleHtml } from "@/lib/article-html";

export type ArticleInput = { title?: string; kicker?: string; subtitle?: string; slug?: string; excerpt?: string; summary?: string; content?: string; category?: string; tags?: string; coverImage?: string; imageAlt?: string; status?: string };
export function normalizeArticleInput(payload: ArticleInput) {
  const title = payload.title?.trim() ?? "";
  const kicker = payload.kicker?.trim().slice(0, 100) ?? "";
  const subtitle = payload.subtitle?.trim().slice(0, 280) ?? "";
  const excerpt = payload.excerpt?.trim() ?? "";
  const summary = payload.summary?.trim().slice(0, 900) ?? "";
  const content = sanitizeArticleHtml(payload.content?.trim() ?? "");
  const category = payload.category?.trim() ?? "";
  const status = payload.status === "published" || payload.status === "archived" ? payload.status : "draft";
  const coverImage = payload.coverImage?.trim() || null;
  const imageAlt = payload.imageAlt?.trim() || null;
  const slug = slugify(payload.slug?.trim() || title);
  const tags = (payload.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12);
  if (!title || !excerpt || !articleHtmlHasText(content)) throw new Error("Titel, Kurzbeschreibung und Artikeltext sind erforderlich.");
  if (!(categories as readonly string[]).includes(category)) throw new Error("Bitte eine gültige Kategorie auswählen.");
  if (!slug) throw new Error("Aus dem Titel konnte kein URL-Kürzel erzeugt werden.");
  if (coverImage && !/^\/uploads\/[0-9a-f-]+\.(jpg|png|webp|gif)$/.test(coverImage)) throw new Error("Das Aufmacherbild ist ungültig.");
  if (coverImage && !imageAlt) throw new Error("Bitte einen Alternativtext für das Aufmacherbild eintragen.");
  return { title, kicker, subtitle, slug, excerpt, summary, content, category, tags: JSON.stringify(tags), coverImage, imageAlt, status };
}
function slugify(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90); }
export function serializeArticle<T extends { id: number; title: string; kicker: string; subtitle: string; slug: string; excerpt: string; summary: string; content: string; category: string; tags: string; coverImage: string | null; imageAlt: string | null; status: string; updatedAt: string }>(article: T) { let tags: string[] = []; try { const parsed = JSON.parse(article.tags); if (Array.isArray(parsed)) tags = parsed.filter((tag): tag is string => typeof tag === "string"); } catch {} const status = article.status === "published" ? "published" as const : article.status === "archived" ? "archived" as const : "draft" as const; return { ...article, coverImage: article.coverImage ?? "", imageAlt: article.imageAlt ?? "", tags: tags.join(", "), status }; }
