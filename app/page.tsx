import { listPublishedArticles } from "@/db";
import { ArticleBrowser } from "@/components/article-browser";
import { SiteHeader } from "@/components/site-header";
import { sampleArticles, type PublicArticle } from "@/lib/content";
import { toPublicArticle } from "@/lib/public-article";

export const dynamic = "force-dynamic";

async function getPublishedArticles(): Promise<PublicArticle[]> {
  try {
    const rows = listPublishedArticles();
    return rows.map(toPublicArticle);
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
