import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LongformArticle } from "@/components/longform-article";
import { findPublishedArticleBySlug } from "@/db";
import { toPublicArticle } from "@/lib/public-article";
import { sampleArticles, type PublicArticle } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await findArticle((await params).slug);
  return article ? { title: article.title, description: article.excerpt } : { title: "Fall nicht gefunden" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await findArticle((await params).slug);
  if (!article) notFound();
  return <LongformArticle article={article} />;
}

async function findArticle(slug: string): Promise<PublicArticle | null> {
  const sample = sampleArticles.find((article) => article.slug === slug);
  if (sample) return sample;
  try {
    const row = findPublishedArticleBySlug(slug);
    if (!row) return null;
    return toPublicArticle(row);
  } catch {
    return null;
  }
}
