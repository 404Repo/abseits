import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPasswordSync } from "@/lib/password";

export type ArticleRow = {
  id: number;
  slug: string;
  title: string;
  kicker: string;
  subtitle: string;
  excerpt: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  coverImage: string | null;
  imageAlt: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EditorRow = { id: number; email: string; passwordHash: string };

const articleColumns = `
  id, slug, title, kicker, subtitle, excerpt, summary, content, category, tags,
  cover_image AS "coverImage", image_alt AS "imageAlt", status,
  published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt"
`;

const globalDatabase = globalThis as typeof globalThis & { abseitsDatabase?: DatabaseSync };

export function getDataDirectory(): string {
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.DATA_DIR || "./data");
}

export function getUploadsDirectory(): string {
  return path.join(getDataDirectory(), "uploads");
}

export function getDb(): DatabaseSync {
  if (globalDatabase.abseitsDatabase) return globalDatabase.abseitsDatabase;

  mkdirSync(getUploadsDirectory(), { recursive: true });
  const database = new DatabaseSync(path.join(getDataDirectory(), "abseits.sqlite"));
  database.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      kicker TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      excerpt TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      cover_image TEXT,
      image_alt TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON articles(status, published_at);
    CREATE TABLE IF NOT EXISTS editors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      editor_id INTEGER NOT NULL REFERENCES editors(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);

  const articleFields = database.prepare("PRAGMA table_info(articles)").all() as Array<{ name: string }>;
  if (!articleFields.some((field) => field.name === "cover_image")) database.exec("ALTER TABLE articles ADD COLUMN cover_image TEXT");
  if (!articleFields.some((field) => field.name === "image_alt")) database.exec("ALTER TABLE articles ADD COLUMN image_alt TEXT");
  if (!articleFields.some((field) => field.name === "kicker")) database.exec("ALTER TABLE articles ADD COLUMN kicker TEXT NOT NULL DEFAULT ''");
  if (!articleFields.some((field) => field.name === "subtitle")) database.exec("ALTER TABLE articles ADD COLUMN subtitle TEXT NOT NULL DEFAULT ''");
  if (!articleFields.some((field) => field.name === "summary")) database.exec("ALTER TABLE articles ADD COLUMN summary TEXT NOT NULL DEFAULT ''");

  globalDatabase.abseitsDatabase = database;
  configureEnvironmentEditor(database);
  return database;
}

function configureEnvironmentEditor(database: DatabaseSync): void {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = database.prepare("SELECT id FROM editors LIMIT 1").get();
  if (!existing) {
    database.prepare("INSERT INTO editors (email, password_hash) VALUES (?, ?)").run(email, hashPasswordSync(password));
  }
}

export function listPublishedArticles(): ArticleRow[] {
  return getDb().prepare(`SELECT ${articleColumns} FROM articles WHERE status = 'published' ORDER BY published_at DESC, id DESC`).all() as ArticleRow[];
}

export function listArticles(): ArticleRow[] {
  return getDb().prepare(`SELECT ${articleColumns} FROM articles ORDER BY updated_at DESC, id DESC`).all() as ArticleRow[];
}

export function findPublishedArticleBySlug(slug: string): ArticleRow | undefined {
  return getDb().prepare(`SELECT ${articleColumns} FROM articles WHERE slug = ? AND status = 'published' LIMIT 1`).get(slug) as ArticleRow | undefined;
}

export function findArticleById(id: number): ArticleRow | undefined {
  return getDb().prepare(`SELECT ${articleColumns} FROM articles WHERE id = ? LIMIT 1`).get(id) as ArticleRow | undefined;
}

type ArticleWrite = Omit<ArticleRow, "id" | "createdAt">;

export function createArticle(input: ArticleWrite): ArticleRow {
  const result = getDb().prepare(`
    INSERT INTO articles (slug, title, kicker, subtitle, excerpt, summary, content, category, tags, cover_image, image_alt, status, published_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(input.slug, input.title, input.kicker, input.subtitle, input.excerpt, input.summary, input.content, input.category, input.tags, input.coverImage, input.imageAlt, input.status, input.publishedAt, input.updatedAt);
  return getDb().prepare(`SELECT ${articleColumns} FROM articles WHERE id = ?`).get(result.lastInsertRowid) as ArticleRow;
}

export function updateArticle(id: number, input: ArticleWrite): ArticleRow | undefined {
  const result = getDb().prepare(`
    UPDATE articles SET slug = ?, title = ?, kicker = ?, subtitle = ?, excerpt = ?, summary = ?, content = ?, category = ?, tags = ?, cover_image = ?, image_alt = ?, status = ?, published_at = ?, updated_at = ?
    WHERE id = ?
  `).run(input.slug, input.title, input.kicker, input.subtitle, input.excerpt, input.summary, input.content, input.category, input.tags, input.coverImage, input.imageAlt, input.status, input.publishedAt, input.updatedAt, id);
  if (result.changes === 0) return undefined;
  return getDb().prepare(`SELECT ${articleColumns} FROM articles WHERE id = ?`).get(id) as ArticleRow;
}

export function findEditorByEmail(email: string): EditorRow | undefined {
  return getDb().prepare('SELECT id, email, password_hash AS "passwordHash" FROM editors WHERE email = ? LIMIT 1').get(email) as EditorRow | undefined;
}

export function findEditorBySession(tokenHash: string, now: string): { id: number; email: string } | undefined {
  return getDb().prepare(`
    SELECT editors.id, editors.email FROM sessions
    INNER JOIN editors ON editors.id = sessions.editor_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ? LIMIT 1
  `).get(tokenHash, now) as { id: number; email: string } | undefined;
}

export function createEditor(email: string, passwordHash: string): { id: number; email: string } {
  const result = getDb().prepare("INSERT INTO editors (email, password_hash) VALUES (?, ?)").run(email, passwordHash);
  return { id: Number(result.lastInsertRowid), email };
}

export function hasEditor(): boolean {
  return Boolean(getDb().prepare("SELECT id FROM editors LIMIT 1").get());
}

export function deleteExpiredSessions(now: string): void {
  getDb().prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
}

export function createSession(tokenHash: string, editorId: number, expiresAt: string): void {
  getDb().prepare("INSERT INTO sessions (token_hash, editor_id, expires_at) VALUES (?, ?, ?)").run(tokenHash, editorId, expiresAt);
}

export function deleteSession(tokenHash: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}
