import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";
import { getUploadsDirectory } from "@/db";
import { sanitizeArticleHtml } from "@/lib/article-html";
import { getAuthorizedEditor } from "@/lib/editor-auth";

const maximumBytes = 25 * 1024 * 1024;
const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  if (!(await getAuthorizedEditor())) return Response.json({ error: "Keine Berechtigung." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("document");
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".docx")) {
    return Response.json({ error: "Bitte eine DOCX-Datei auswählen." }, { status: 400 });
  }
  if (file.size > maximumBytes) return Response.json({ error: "Die DOCX-Datei darf höchstens 25 MB groß sein." }, { status: 400 });

  try {
    const result = await mammoth.convertToHtml(
      { buffer: Buffer.from(await file.arrayBuffer()) },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h2:fresh",
          "p[style-name='Heading 2'] => h3:fresh",
          "p[style-name='Caption'] => figcaption:fresh",
        ],
        convertImage: mammoth.images.imgElement(async (image) => {
          const extension = imageExtensions[image.contentType] ?? "png";
          const filename = `${randomUUID()}.${extension}`;
          const imageBuffer = Buffer.from(await image.read("base64"), "base64");
          await writeFile(path.join(/* turbopackIgnore: true */ getUploadsDirectory(), filename), imageBuffer, { flag: "wx" });
          return { src: `/uploads/${filename}` };
        }),
      },
    );

    const imported = transformDocumentHtml(result.value);
    return Response.json({
      ...imported,
      messages: result.messages.map((message) => message.message),
    });
  } catch {
    return Response.json({ error: "Das Word-Dokument konnte nicht importiert werden." }, { status: 500 });
  }
}

function transformDocumentHtml(value: string) {
  let html = value.trim();
  const kicker = takeLeadingParagraph(() => html, (next) => { html = next; });
  const title = takeLeadingParagraph(() => html, (next) => { html = next; });
  const subtitle = takeLeadingParagraph(() => html, (next) => { html = next; });
  let summary = "";

  html = html.replace(/<p>([\s\S]*?)<\/p>/gi, (paragraph, inner: string) => {
    const plain = plainText(inner);
    if (/^Kurz gesagt:/i.test(plain)) {
      summary = plain.replace(/^Kurz gesagt:\s*/i, "");
      return "";
    }
    if (/^Wichtiger Hinweis:/i.test(plain)) {
      const text = plain.replace(/^Wichtiger Hinweis:\s*/i, "");
      return `<aside data-callout="warning"><p><strong>Wichtiger Hinweis:</strong> ${escapeHtml(text)}</p></aside>`;
    }
    return paragraph;
  });

  html = html.replace(
    /(?:<p>)?\s*(<img\b[^>]*>)\s*(?:<\/p>)?\s*<figcaption>([\s\S]*?)<\/figcaption>/gi,
    "<figure>$1<figcaption>$2</figcaption></figure>",
  );

  return {
    kicker: plainText(kicker),
    title: plainText(title),
    subtitle: plainText(subtitle),
    summary,
    content: sanitizeArticleHtml(html),
  };
}

function takeLeadingParagraph(getHtml: () => string, setHtml: (value: string) => void): string {
  const html = getHtml();
  const match = html.match(/^\s*<p>([\s\S]*?)<\/p>/i);
  if (!match) return "";
  setHtml(html.slice(match[0].length).trimStart());
  return match[1];
}

function plainText(value: string): string {
  return decodeHtmlEntities(sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}
