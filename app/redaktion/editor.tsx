"use client";

import { useMemo, useState } from "react";
import { ExternalLink, FilePlus2, LayoutDashboard, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/content";

export type EditableArticle = { id: number; title: string; slug: string; excerpt: string; content: string; category: string; tags: string; coverImage: string; imageAlt: string; status: "draft" | "published"; updatedAt: string };
type FormState = Omit<EditableArticle, "id" | "updatedAt"> & { id: number | null };
const emptyForm: FormState = { id: null, title: "", slug: "", excerpt: "", content: "", category: categories[0], tags: "", coverImage: "", imageAlt: "", status: "draft" };

export function EditorApp({ initialArticles, editorEmail, signOutPath }: { initialArticles: EditableArticle[]; editorEmail: string; signOutPath: string }) {
  const [articles, setArticles] = useState(initialArticles); const [form, setForm] = useState<FormState>(emptyForm); const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false); const [message, setMessage] = useState("");
  const editing = useMemo(() => form.id !== null, [form.id]);
  function selectArticle(article: EditableArticle) { setForm({ id: article.id, title: article.title, slug: article.slug, excerpt: article.excerpt, content: article.content, category: article.category, tags: article.tags, coverImage: article.coverImage, imageAlt: article.imageAlt, status: article.status }); setMessage(""); }
  function reset() { setForm(emptyForm); setMessage(""); }
  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  async function uploadImage(file: File | undefined) { if (!file) return; setUploading(true); setMessage(""); try { const body = new FormData(); body.set("image", file); const response = await fetch("/api/uploads", { method: "POST", body }); const payload = await response.json() as { path?: string; error?: string }; if (!response.ok || !payload.path) throw new Error(payload.error ?? "Das Bild konnte nicht hochgeladen werden."); update("coverImage", payload.path); setMessage("Aufmacherbild hochgeladen. Speichere den Artikel, um es zu übernehmen."); } catch (error) { setMessage(error instanceof Error ? error.message : "Das Bild konnte nicht hochgeladen werden."); } finally { setUploading(false); } }
  async function save(event: React.FormEvent) { event.preventDefault(); setSaving(true); setMessage(""); try { const response = await fetch(editing ? `/api/articles/${form.id}` : "/api/articles", { method: editing ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const payload = await response.json() as { article?: EditableArticle; error?: string }; if (!response.ok || !payload.article) throw new Error(payload.error ?? "Der Artikel konnte nicht gespeichert werden."); const saved = payload.article; setArticles((current) => editing ? current.map((article) => article.id === saved.id ? saved : article) : [saved, ...current]); selectArticle(saved); setMessage(saved.status === "published" ? "Artikel gespeichert und veröffentlicht." : "Entwurf gespeichert."); } catch (error) { setMessage(error instanceof Error ? error.message : "Der Artikel konnte nicht gespeichert werden."); } finally { setSaving(false); } }
  return (
    <section className="page-shell py-8 sm:py-12">
      <div className="editor-heading"><div><div className="eyebrow-chip"><LayoutDashboard className="size-3.5" />Redaktionsbereich</div><h1>Inhalte verwalten</h1><p>Angemeldet als {editorEmail}</p></div><div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={reset} className="rounded-full"><FilePlus2 />Neuer Artikel</Button><Button asChild variant="ghost" className="rounded-full"><a href={signOutPath}>Abmelden</a></Button></div></div>
      <div className="editor-grid">
        <aside className="editor-sidebar"><div className="editor-sidebar-head"><div><h2>Artikel</h2><p>{articles.length} eigene Beiträge</p></div><span>{articles.filter((a) => a.status === "published").length} live</span></div><div className="editor-list">{articles.map((article) => <button key={article.id} type="button" onClick={() => selectArticle(article)} className={form.id === article.id ? "active" : ""}><span className={`status-pill ${article.status}`}>{article.status === "published" ? "Veröffentlicht" : "Entwurf"}</span><strong>{article.title}</strong><small>{formatEditorDate(article.updatedAt)}</small></button>)}{articles.length === 0 && <p className="editor-empty">Noch keine eigenen Artikel. Starte mit deiner ersten Fallakte.</p>}</div></aside>
        <form onSubmit={save} className="editor-surface"><div className="editor-surface-head"><div><p className="kicker">{editing ? "Artikel bearbeiten" : "Neuer Artikel"}</p><h2>{editing ? form.title || "Unbenannter Artikel" : "Neue Fallakte"}</h2></div>{editing && form.status === "published" && <a href={`/artikel/${form.slug}`} target="_blank" rel="noreferrer">Live ansehen <ExternalLink className="size-4" /></a>}</div>
          <div className="editor-fields">
            <label className="wide"><span className="field-label">Titel</span><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Titel des Falls" required /></label>
            <label><span className="field-label">URL-Kürzel</span><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="wird-aus-dem-titel-erzeugt" /></label>
            <label><span className="field-label">Kategorie</span><Select value={form.category} onValueChange={(value) => update("category", value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></label>
            <label className="wide"><span className="field-label">Kurzbeschreibung</span><Textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="Worum geht es in diesem Fall?" className="min-h-28" required /></label>
            <label className="wide"><span className="field-label">Artikeltext</span><Textarea value={form.content} onChange={(e) => update("content", e.target.value)} placeholder="Absätze durch eine Leerzeile trennen …" className="min-h-96 leading-7" required /></label>
            <div className="wide image-field">
              <span className="field-label">Aufmacherbild</span>
              {form.coverImage && <img src={form.coverImage} alt={form.imageAlt || "Ausgewähltes Aufmacherbild"} />}
              <div className="image-field-actions">
                <label className="file-button"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadImage(event.target.files?.[0])} disabled={uploading} /><span>{uploading ? "Bild wird hochgeladen …" : form.coverImage ? "Bild ersetzen" : "Bild auswählen"}</span></label>
                {form.coverImage && <button type="button" onClick={() => { update("coverImage", ""); update("imageAlt", ""); }}>Bild entfernen</button>}
              </div>
            </div>
            {form.coverImage && <label className="wide"><span className="field-label">Alternativtext des Bildes</span><Input value={form.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} placeholder="Sachliche Beschreibung des Bildmotivs" required /></label>}
            <label><span className="field-label">Schlagwörter</span><Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="Cold Case, Norwegen, Identität" /></label>
            <label><span className="field-label">Status</span><Select value={form.status} onValueChange={(value) => update("status", value as FormState["status"])}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Entwurf</SelectItem><SelectItem value="published">Veröffentlicht</SelectItem></SelectContent></Select></label>
          </div>
          <div className="editor-actions"><p className={message.includes("konnte nicht") || message.includes("bereits") || message.includes("ungültig") ? "error" : ""} role="status">{message}</p><Button type="submit" disabled={saving || uploading} className="rounded-full px-6"><Save />{saving ? "Wird gespeichert …" : editing ? "Änderungen speichern" : "Artikel speichern"}</Button></div>
        </form>
      </div>
    </section>
  );
}

function formatEditorDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}
