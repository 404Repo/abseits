import { listPublishedArticles } from "@/db";
import { ArticleBrowser } from "@/components/article-browser";
import { SiteHeader } from "@/components/site-header";
import { sampleArticles, type PublicArticle } from "@/lib/content";

export const dynamic = "force-dynamic";

async function getPublishedArticles(): Promise<PublicArticle[]> {
  try {
    const rows = listPublishedArticles();
    return rows.map((article) => ({ id: String(article.id), slug: article.slug, title: article.title, excerpt: article.excerpt, content: article.content, category: article.category, tags: parseTags(article.tags), coverImage: article.coverImage, imageAlt: article.imageAlt, publishedAt: article.publishedAt ?? article.createdAt, readingMinutes: Math.max(1, Math.ceil(article.content.trim().split(/\s+/).length / 210)) }));
  } catch { return []; }
}

export default async function Home() {
  const savedArticles = await getPublishedArticles();
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <ArticleBrowser articles={[...savedArticles, ...sampleArticles]} />
      <footer className="magazine-footer">
        <div className="page-shell"><strong>.ABSEITS</strong><div><span>Unabhängiges Magazin für außergewöhnliche Fälle</span><a href="/redaktion">Redaktion</a></div><small>© {new Date().getFullYear()}</small></div>
      </footer>
    </main>
  );
}
function parseTags(value: string): string[] { try { const tags = JSON.parse(value); return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string") : []; } catch { return []; } }
