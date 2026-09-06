import type { Metadata } from "next";
import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { findPublishedArticleBySlug } from "@/db";
import { legacyTextToHtml, sanitizeArticleHtml } from "@/lib/article-html";
import { sampleArticles, type PublicArticle } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await findArticle((await params).slug);
  return article ? { title: article.title, description: article.excerpt } : { title: "Fall nicht gefunden" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await findArticle((await params).slug);
  if (!article) notFound();
  const body = sanitizeArticleHtml(legacyTextToHtml(article.content));

  return (
    <main className="min-h-screen article-site">
      <SiteHeader />
      <article className="longform-article">
        <div className="longform-utility"><Link href="/"><ArrowLeft />Zum Archiv</Link><span>{article.category}</span></div>
        <header className="longform-header">
          <p className="longform-kicker">{article.kicker || article.category}</p>
          <h1>{article.title}</h1>
          <p className="longform-subtitle">{article.subtitle || article.excerpt}</p>
          <div className="longform-meta"><span>{formatDate(article.publishedAt)}</span><span><Clock3 />{article.readingMinutes} Minuten Lesezeit</span></div>
        </header>

        {article.coverImage && <figure className="longform-cover"><img src={article.coverImage} alt={article.imageAlt || ""} />{article.imageAlt && <figcaption>{article.imageAlt}</figcaption>}</figure>}
        {article.summary && <aside className="longform-summary"><strong>Kurz gesagt:</strong> {article.summary}</aside>}

        <div className="longform-body" dangerouslySetInnerHTML={{ __html: body }} />

        <footer className="longform-footer">
          <div>{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
          {article.id.startsWith("sample-") && <p><strong>Redaktioneller Hinweis:</strong> Dieser Beitrag dient als Beispiel und kann später durch eine vollständig recherchierte Fassung mit Quellenapparat ersetzt werden.</p>}
        </footer>
      </article>
    </main>
  );
}

async function findArticle(slug: string): Promise<PublicArticle | null> {
  const sample = sampleArticles.find((article) => article.slug === slug);
  if (sample) return sample;
  try {
    const row = findPublishedArticleBySlug(slug);
    if (!row) return null;
    return {
      id: String(row.id), slug: row.slug, title: row.title, kicker: row.kicker, subtitle: row.subtitle,
      excerpt: row.excerpt, summary: row.summary, content: row.content, category: row.category,
      tags: parseTags(row.tags), coverImage: row.coverImage, imageAlt: row.imageAlt,
      publishedAt: row.publishedAt ?? row.createdAt,
      readingMinutes: Math.max(1, Math.ceil(row.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 210)),
    };
  } catch {
    return null;
  }
}

function parseTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch { return []; }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(value));
}
