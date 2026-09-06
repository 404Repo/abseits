import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { legacyTextToHtml, sanitizeArticleHtml } from "@/lib/article-html";
import type { PublicArticle } from "@/lib/content";

export function LongformArticle({ article, preview = false }: { article: PublicArticle; preview?: boolean }) {
  const body = sanitizeArticleHtml(legacyTextToHtml(article.content));
  return (
    <main className="min-h-screen article-site">
      <SiteHeader />
      {preview && <div className="preview-banner"><strong>Entwurfsvorschau</strong><span>Diese Ansicht ist nur in der angemeldeten Redaktion erreichbar.</span><Link href="/redaktion">Zurück zum Editor</Link></div>}
      <article className="longform-article">
        <div className="longform-utility"><Link href={preview ? "/redaktion" : "/"}><ArrowLeft />{preview ? "Zur Redaktion" : "Zum Archiv"}</Link><span>{article.category}</span></div>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(value));
}
