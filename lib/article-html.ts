import sanitizeHtml from "sanitize-html";

export function sanitizeArticleHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [
      "p", "h2", "h3", "strong", "em", "s", "ul", "ol", "li", "blockquote",
      "a", "figure", "img", "figcaption", "aside", "br", "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      aside: ["data-callout"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: { ...attributes, target: "_blank", rel: "noreferrer noopener" },
      }),
    },
  }).trim();
}

export function articleHtmlHasText(value: string): boolean {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;/g, " ").trim().length > 0;
}

export function legacyTextToHtml(value: string): string {
  if (/<(?:p|h2|h3|figure|aside|ul|ol|blockquote)\b/i.test(value)) return value;
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join("");
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
