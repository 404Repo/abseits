import type { Metadata } from "next";
import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { findPublishedArticleBySlug } from "@/db";
import { sampleArticles, type PublicArticle } from "@/lib/content";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const article = await findArticle((await params).slug); return article ? { title: article.title, description: article.excerpt } : { title: "Fall nicht gefunden" }; }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await findArticle((await params).slug); if (!article) notFound();
  return (
    <main className="min-h-screen"><SiteHeader /><article className="article-page">
      <div className="page-shell article-breadcrumb"><Link href="/"><ArrowLeft className="size-4" />Zurück zum Archiv</Link><span>{article.category}</span></div>
      <header className="page-shell article-heading"><div className="article-heading-main"><span>{article.category}</span><h1>{article.title}</h1></div><div className="article-heading-side"><p>{article.excerpt}</p><div><span>{formatDate(article.publishedAt)}</span><span><Clock3 className="size-4" />{article.readingMinutes} Minuten Lesezeit</span></div></div></header>
      <figure className="page-shell article-lead-image">{article.coverImage ? <img src={article.coverImage} alt={article.imageAlt || ""} /> : <div className="image-fallback">AS</div>}{article.id.startsWith("sample-") && <figcaption>Redaktionelle Illustration – keine historische Originalaufnahme</figcaption>}</figure>
      <div className="page-shell article-content-grid"><div className="article-copy">{article.content.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><aside><span>Schlagwörter</span><div>{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>{article.id.startsWith("sample-") && <p><strong>Redaktioneller Hinweis</strong>Dieser Beitrag dient als Beispiel und kann später durch eine vollständig recherchierte Fassung mit Quellenapparat ersetzt werden.</p>}</aside></div>
    </article></main>
  );
}
async function findArticle(slug: string): Promise<PublicArticle | null> { const sample = sampleArticles.find((article) => article.slug === slug); if (sample) return sample; try { const row = findPublishedArticleBySlug(slug); if (!row) return null; return { id: String(row.id), slug: row.slug, title: row.title, excerpt: row.excerpt, content: row.content, category: row.category, tags: parseTags(row.tags), coverImage: row.coverImage, imageAlt: row.imageAlt, publishedAt: row.publishedAt ?? row.createdAt, readingMinutes: Math.max(1, Math.ceil(row.content.trim().split(/\s+/).length / 210)) }; } catch { return null; } }
function parseTags(value: string): string[] { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : []; } catch { return []; } }
function formatDate(value: string) { return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(value)); }
