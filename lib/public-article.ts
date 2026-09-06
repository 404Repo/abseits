import type { ArticleRow } from "@/db";
import type { PublicArticle } from "@/lib/content";

export function toPublicArticle(row: ArticleRow): PublicArticle {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    kicker: row.kicker,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    summary: row.summary,
    content: row.content,
    category: row.category,
    tags: parseTags(row.tags),
    coverImage: row.coverImage,
    imageAlt: row.imageAlt,
    publishedAt: row.publishedAt ?? row.createdAt,
    readingMinutes: Math.max(1, Math.ceil(plainText(row.content).split(/\s+/).filter(Boolean).length / 210)),
  };
}

function parseTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch { return []; }
}

function plainText(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
