"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle, ExternalLink, Eye, FilePlus2, FileUp, ImagePlus, LayoutDashboard, Save, Settings2 } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/content";

export type EditableArticle = {
  id: number;
  title: string;
  kicker: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  coverImage: string;
  imageAlt: string;
  status: "draft" | "published";
  updatedAt: string;
};
type FormState = Omit<EditableArticle, "id" | "updatedAt"> & { id: number | null };
const emptyForm: FormState = { id: null, title: "", kicker: "", subtitle: "", slug: "", excerpt: "", summary: "", content: "<p></p>", category: categories[0], tags: "", coverImage: "", imageAlt: "", status: "draft" };

function toForm(article: EditableArticle): FormState {
  return { id: article.id, title: article.title, kicker: article.kicker, subtitle: article.subtitle, slug: article.slug, excerpt: article.excerpt, summary: article.summary, content: article.content, category: article.category, tags: article.tags, coverImage: article.coverImage, imageAlt: article.imageAlt, status: article.status };
}

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function EditorApp({ initialArticles, editorEmail, signOutPath }: { initialArticles: EditableArticle[]; editorEmail: string; signOutPath: string }) {
  const [articles, setArticles] = useState(initialArticles);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const formVersion = useRef(0);
  const documentInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const editing = useMemo(() => form.id !== null, [form.id]);
  const checklist = useMemo(() => [
    { label: "Titel", ok: form.title.trim().length >= 5, required: true },
    { label: "Startseiten-Teaser", ok: form.excerpt.trim().length >= 30, required: true },
    { label: "Kurzfassung", ok: form.summary.trim().length >= 30, required: true },
    { label: "Ausformulierter Artikel", ok: plainText(form.content).length >= 250, required: true },
    { label: "Alternativtext zum Aufmacher", ok: !form.coverImage || form.imageAlt.trim().length >= 5, required: false },
    { label: "Quellen oder weiterführende Links", ok: /<a\b/i.test(form.content) || /quellen|literatur|nachweise/i.test(plainText(form.content)), required: false },
  ], [form]);
  const missingRequired = checklist.some((item) => item.required && !item.ok);

  function selectArticle(article: EditableArticle) {
    if (dirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const next = toForm(article);
    formVersion.current += 1;
    setForm(next);
    setDirty(false);
    setLastSavedAt(article.updatedAt);
    setMessage("");
  }
  function reset() {
    if (dirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
    formVersion.current += 1;
    setForm(emptyForm);
    setDirty(false);
    setLastSavedAt(null);
    setMessage("");
  }
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    formVersion.current += 1;
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  const persist = useCallback(async (snapshot: FormState, automatic: boolean) => {
    const snapshotVersion = formVersion.current;
    if (automatic) setAutosaving(true);
    else setSaving(true);
    if (!automatic) setMessage("");
    try {
      const existing = snapshot.id !== null;
      const response = await fetch(existing ? `/api/articles/${snapshot.id}` : "/api/articles", { method: existing ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(snapshot) });
      const payload = await response.json() as { article?: EditableArticle; error?: string };
      if (!response.ok || !payload.article) throw new Error(payload.error ?? "Der Artikel konnte nicht gespeichert werden.");
      const saved = payload.article;
      setArticles((current) => existing ? current.map((article) => article.id === saved.id ? saved : article) : [saved, ...current]);
      if (formVersion.current === snapshotVersion) {
        const next = toForm(saved);
        setForm(next);
        setDirty(false);
        setLastSavedAt(saved.updatedAt);
        setMessage(automatic ? "Entwurf automatisch gespeichert." : saved.status === "published" ? "Artikel gespeichert und veröffentlicht." : "Entwurf gespeichert.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Der Artikel konnte nicht gespeichert werden.");
    } finally {
      if (automatic) setAutosaving(false);
      else setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (!dirty || form.id === null || form.status !== "draft" || saving || autosaving || uploading || importing) return;
    if (!form.title.trim() || !form.excerpt.trim() || !plainText(form.content)) return;
    const timer = window.setTimeout(() => void persist(form, true), 1800);
    return () => window.clearTimeout(timer);
  }, [autosaving, dirty, form, importing, persist, saving, uploading]);

  async function uploadImage(file: File): Promise<string> {
    setUploading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.set("image", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const payload = await response.json() as { path?: string; error?: string };
      if (!response.ok || !payload.path) throw new Error(payload.error ?? "Das Bild konnte nicht hochgeladen werden.");
      return payload.path;
    } catch (error) {
      const text = error instanceof Error ? error.message : "Das Bild konnte nicht hochgeladen werden.";
      setMessage(text);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  async function setCover(file: File | undefined) {
    if (!file) return;
    const path = await uploadImage(file);
    update("coverImage", path);
    setMessage("Aufmacherbild hochgeladen. Bitte noch den Alternativtext ergänzen.");
    if (coverInput.current) coverInput.current.value = "";
  }

  async function importDocument(file: File | undefined) {
    if (!file) return;
    setImporting(true);
    setMessage("");
    try {
      const body = new FormData();
      body.set("document", file);
      const response = await fetch("/api/import/docx", { method: "POST", body });
      const payload = await response.json() as { title?: string; kicker?: string; subtitle?: string; summary?: string; content?: string; error?: string };
      if (!response.ok || !payload.content) throw new Error(payload.error ?? "Das Word-Dokument konnte nicht importiert werden.");
      formVersion.current += 1;
      setForm((current) => ({ ...current, title: payload.title || current.title, kicker: payload.kicker || current.kicker, subtitle: payload.subtitle || current.subtitle, summary: payload.summary || current.summary, excerpt: current.excerpt || payload.summary || payload.subtitle || "", content: payload.content || current.content }));
      setDirty(true);
      setMessage("Word-Dokument importiert. Überschriften, Bilder, Bildunterschriften, Links und Hinweise wurden übernommen.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Das Word-Dokument konnte nicht importiert werden.");
    } finally {
      setImporting(false);
      if (documentInput.current) documentInput.current.value = "";
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (form.status === "published" && missingRequired) {
      setMessage("Vor der Veröffentlichung bitte alle Pflichtpunkte der Checkliste vervollständigen.");
      return;
    }
    await persist(form, false);
  }

  return (
    <section className="editor-workspace">
      <header className="page-shell editor-heading">
        <div><div className="eyebrow-chip"><LayoutDashboard className="size-3.5" />Redaktion</div><h1>Dossiers schreiben</h1><p>Angemeldet als {editorEmail}</p></div>
        <div className="editor-heading-actions">
          <label className="editor-import-button"><FileUp /><span>{importing ? "Importiert …" : "Word importieren"}</span><input ref={documentInput} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={importing} onChange={(event) => void importDocument(event.target.files?.[0])} /></label>
          <Button type="button" variant="outline" onClick={reset}><FilePlus2 />Neues Dossier</Button>
          <Button asChild variant="ghost"><a href={signOutPath}>Abmelden</a></Button>
        </div>
      </header>

      <div className="page-shell editor-layout">
        <aside className="editor-library">
          <div className="editor-library-head"><div><h2>Artikel</h2><p>{articles.length} Beiträge</p></div><span>{articles.filter((article) => article.status === "published").length} live</span></div>
          <div className="editor-list">{articles.map((article) => <button key={article.id} type="button" onClick={() => selectArticle(article)} className={form.id === article.id ? "active" : ""}><span className={`status-pill ${article.status}`}>{article.status === "published" ? "Veröffentlicht" : "Entwurf"}</span><strong>{article.title}</strong><small>{formatEditorDate(article.updatedAt)}</small></button>)}{articles.length === 0 && <p className="editor-empty">Noch keine eigenen Artikel. Importiere ein Word-Dokument oder starte ein neues Dossier.</p>}</div>
          <section className="publication-checklist" aria-labelledby="publication-checklist-title">
            <div><h3 id="publication-checklist-title">Publikationscheck</h3><span>{checklist.filter((item) => item.required && item.ok).length}/{checklist.filter((item) => item.required).length} Pflicht</span></div>
            <ul>{checklist.map((item) => <li key={item.label} className={item.ok ? "complete" : ""}>{item.ok ? <CheckCircle2 /> : <Circle />}<span>{item.label}{!item.required && <small> empfohlen</small>}</span></li>)}</ul>
          </section>
        </aside>

        <form onSubmit={save} className="document-editor">
          <div className="document-editor-topbar">
            <span>{editing ? "Artikel bearbeiten" : "Neuer Artikel"}<small className={dirty ? "unsaved" : ""}>{dirty ? "Ungespeichert" : lastSavedAt ? `Gesichert ${formatEditorTime(lastSavedAt)}` : "Noch nicht gespeichert"}</small></span>
            <div>{editing && <a href={`/redaktion/vorschau/${form.id}`} target="_blank" rel="noreferrer"><Eye /> Vorschau</a>}{editing && form.status === "published" && <a href={`/artikel/${form.slug}`} target="_blank" rel="noreferrer">Live <ExternalLink /></a>}</div>
          </div>
          <div className="document-page">
            <input className="document-kicker" value={form.kicker} onChange={(event) => update("kicker", event.target.value)} placeholder="RESSORT ODER THEMA" aria-label="Ressort oder Thema" />
            <textarea className="document-title" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Titel des Dossiers" rows={2} required aria-label="Titel" />
            <textarea className="document-subtitle" value={form.subtitle} onChange={(event) => update("subtitle", event.target.value)} placeholder="Untertitel: Was soll der Artikel verständlich erklären?" rows={2} aria-label="Untertitel" />

            <div className="document-metadata">
              <label><span>Kategorie</span><Select value={form.category} onValueChange={(value) => update("category", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></label>
              <label><span>Status</span><Select value={form.status} onValueChange={(value) => update("status", value as FormState["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Entwurf</SelectItem><SelectItem value="published">Veröffentlicht</SelectItem></SelectContent></Select></label>
              <label className="wide"><span>Schlagwörter</span><Input value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="Quantenphysik, Philosophie, Gedankenexperiment" /></label>
            </div>

            <div className="cover-editor">
              {form.coverImage ? <img src={form.coverImage} alt={form.imageAlt || "Aufmacherbild"} /> : <div><ImagePlus /><strong>Optionales Aufmacherbild</strong><span>Grafiken innerhalb des Artikels fügst du direkt im Texteditor ein.</span></div>}
              <div><label><input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => void setCover(event.target.files?.[0])} disabled={uploading} /><span>{form.coverImage ? "Bild ersetzen" : "Aufmacher wählen"}</span></label>{form.coverImage && <button type="button" onClick={() => { update("coverImage", ""); update("imageAlt", ""); }}>Entfernen</button>}</div>
            </div>
            {form.coverImage && <label className="document-field"><span>Alternativtext des Aufmacherbildes</span><Input value={form.imageAlt} onChange={(event) => update("imageAlt", event.target.value)} required /></label>}

            <label className="document-summary"><span>Kurz gesagt</span><Textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} placeholder="Die zentrale Einordnung des Artikels in zwei bis vier Sätzen." rows={4} /></label>

            <div className="document-body-label"><span>Artikel</span><small>Überschriften, Grafiken, Quellenlinks, Listen und Hinweisboxen frei anordnen</small></div>
            <RichTextEditor content={form.content} onChange={(html) => update("content", html)} onUploadImage={uploadImage} />

            <details className="publishing-settings">
              <summary><Settings2 />Veröffentlichung und Übersicht</summary>
              <div>
                <label className="document-field"><span>Kurzbeschreibung für die Startseite</span><Textarea value={form.excerpt} onChange={(event) => update("excerpt", event.target.value)} placeholder="Kurzer Teaser für die Artikelübersicht" rows={3} required /></label>
                <label className="document-field"><span>URL-Kürzel</span><Input value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="wird-aus-dem-titel-erzeugt" /></label>
              </div>
            </details>
          </div>

          <footer className="document-savebar"><p className={isErrorMessage(message) ? "error" : ""} role="status">{message || (autosaving ? "Entwurf wird automatisch gespeichert …" : dirty && editing && form.status === "draft" ? "Automatische Sicherung steht aus …" : dirty ? "Ungespeicherte Änderungen." : "Alle Änderungen sind gesichert.")}</p><Button type="submit" disabled={saving || autosaving || uploading || importing}><Save />{saving ? "Wird gespeichert …" : editing ? "Änderungen speichern" : "Dossier speichern"}</Button></footer>
        </form>
      </div>
    </section>
  );
}

function formatEditorDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(value));
}

function formatEditorTime(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(new Date(value));
}

function isErrorMessage(message: string): boolean {
  return /nicht|fehler|ungültig|bereits|erforderlich/i.test(message);
}
