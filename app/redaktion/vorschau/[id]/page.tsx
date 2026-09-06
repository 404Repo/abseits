import { notFound } from "next/navigation";
import { LongformArticle } from "@/components/longform-article";
import { findArticleById } from "@/db";
import { requireAuthorizedEditor } from "@/lib/editor-auth";
import { toPublicArticle } from "@/lib/public-article";

export const dynamic = "force-dynamic";

export default async function DraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthorizedEditor();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const row = findArticleById(id);
  if (!row) notFound();
  return <LongformArticle article={toPublicArticle(row)} preview />;
}
