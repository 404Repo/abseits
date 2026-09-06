"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { categories, type PublicArticle } from "@/lib/content";

export function ArticleBrowser({ articles }: { articles: PublicArticle[] }) {
  const [category, setCategory] = useState("Alle Fälle");
  const visible = useMemo(() => category === "Alle Fälle" ? articles : articles.filter((article) => article.category === category), [articles, category]);
  const [lead, ...more] = visible;
  return (
    <section id="archiv">
      {lead ? <LeadStory article={lead} /> : <div className="page-shell empty-state">In dieser Kategorie ist noch kein Fall veröffentlicht.</div>}
      <div className="page-shell archive-section">
        <div className="archive-title"><div><span>Das Archiv</span><h2>Weitere Recherchen</h2></div><p>Dokumentierte Spuren, offene Fragen und der aktuelle Stand der Erklärung.</p></div>
        <div id="kategorien" className="category-tabs" aria-label="Nach Kategorie filtern">{["Alle Fälle", ...categories].map((item) => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}<sup>{item === "Alle Fälle" ? articles.length : articles.filter((article) => article.category === item).length}</sup></button>)}</div>
        <div className="editorial-grid">{more.map((article) => <StoryCard key={article.id} article={article} />)}</div>
        {lead && more.length === 0 && <div className="empty-state compact">Dieser Fall ist derzeit der einzige Beitrag in dieser Kategorie.</div>}
      </div>
    </section>
  );
}

function LeadStory({ article }: { article: PublicArticle }) {
  return (
    <article className="page-shell lead-story">
      <a href={`/artikel/${article.slug}`}>
        {article.coverImage ? <img src={article.coverImage} alt={article.imageAlt || ""} fetchPriority="high" /> : <div className="image-fallback">AS</div>}
        <div className="lead-shade" aria-hidden="true" />
        <div className="lead-content"><div className="story-meta"><span>{article.category}</span><span>{formatDate(article.publishedAt)}</span><span><Clock3 className="size-4" />{article.readingMinutes} Min.</span></div><h1>{article.title}</h1><p>{article.excerpt}</p><div className="story-open">Dossier lesen <ArrowUpRight className="size-5" /></div></div>
        {article.id.startsWith("sample-") && <small className="image-label">Redaktionelle Illustration</small>}
      </a>
    </article>
  );
}

function StoryCard({ article }: { article: PublicArticle }) {
  return (
    <article className="editorial-card"><a href={`/artikel/${article.slug}`}><div className="card-image">{article.coverImage ? <img src={article.coverImage} alt={article.imageAlt || ""} loading="lazy" /> : <div className="image-fallback">AS</div>}{article.id.startsWith("sample-") && <small>Illustration</small>}</div><div className="card-meta"><span>{article.category}</span><span>{formatDate(article.publishedAt)}</span></div><h3>{article.title}</h3><p>{article.excerpt}</p><div className="card-footer"><div>{article.tags.slice(0,2).map((tag) => <span key={tag}>#{tag}</span>)}</div><ArrowUpRight className="size-5" /></div></a></article>
  );
}
function formatDate(value: string) { return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(value)); }
