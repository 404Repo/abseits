"use client";

import { useEffect, useRef } from "react";
import { mergeAttributes, Node } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, ImagePlus, Info, Italic, Link2, List, ListOrdered, Pilcrow, Quote, Redo2, TriangleAlert, Undo2 } from "lucide-react";

const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
    };
  },
  parseHTML() {
    return [{
      tag: "figure",
      getAttrs: (node) => {
        const element = node as HTMLElement;
        const image = element.querySelector("img");
        return {
          src: image?.getAttribute("src") ?? "",
          alt: image?.getAttribute("alt") ?? "",
          caption: element.querySelector("figcaption")?.textContent ?? "",
        };
      },
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      ["img", { src: HTMLAttributes.src, alt: HTMLAttributes.alt, title: HTMLAttributes.caption }],
      ["figcaption", {}, HTMLAttributes.caption],
    ];
  },
});

const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() { return { tone: { default: "info" } }; },
  parseHTML() {
    return [{ tag: "aside[data-callout]", getAttrs: (node) => ({ tone: (node as HTMLElement).dataset.callout || "info" }) }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes({ "data-callout": HTMLAttributes.tone }), 0];
  },
});

export function RichTextEditor({
  content,
  onChange,
  onUploadImage,
}: {
  content: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}) {
  const imageInput = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Beginne mit dem ersten Abschnitt deines Dossiers …" }),
      Figure,
      Callout,
    ],
    content,
    editorProps: { attributes: { class: "longform-prose" } },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) editor.commands.setContent(content || "<p></p>", { emitUpdate: false });
  }, [content, editor]);

  if (!editor) return <div className="rich-editor-loading">Editor wird geladen …</div>;

  async function addFigure(file: File | undefined) {
    if (!file) return;
    const src = await onUploadImage(file);
    const caption = window.prompt("Bildunterschrift", "Abb.: ")?.trim() ?? "";
    const alt = window.prompt("Alternativtext für Screenreader", "")?.trim() ?? "";
    editor?.chain().focus().insertContent({ type: "figure", attrs: { src, caption, alt } }).run();
    if (imageInput.current) imageInput.current.value = "";
  }

  function setLink() {
    const previous = editor?.getAttributes("link").href as string | undefined;
    const href = window.prompt("Adresse des Links", previous || "https://");
    if (href === null) return;
    if (!href.trim()) editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor?.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Text formatieren">
        <ToolbarButton label="Rückgängig" active={false} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 /></ToolbarButton>
        <ToolbarButton label="Wiederholen" active={false} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 /></ToolbarButton>
        <span className="toolbar-divider" />
        <ToolbarButton label="Absatz" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow /></ToolbarButton>
        <ToolbarButton label="Überschrift" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolbarButton>
        <ToolbarButton label="Zwischenüberschrift" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolbarButton>
        <ToolbarButton label="Fett" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></ToolbarButton>
        <ToolbarButton label="Kursiv" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></ToolbarButton>
        <ToolbarButton label="Aufzählung" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></ToolbarButton>
        <ToolbarButton label="Nummerierung" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
        <ToolbarButton label="Zitat" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}><Link2 /></ToolbarButton>
        <span className="toolbar-divider" />
        <ToolbarButton label="Infobox" active={editor.isActive("callout", { tone: "info" })} onClick={() => editor.chain().focus().wrapIn("callout", { tone: "info" }).run()}><Info /></ToolbarButton>
        <ToolbarButton label="Warnhinweis" active={editor.isActive("callout", { tone: "warning" })} onClick={() => editor.chain().focus().wrapIn("callout", { tone: "warning" }).run()}><TriangleAlert /></ToolbarButton>
        <ToolbarButton label="Grafik einfügen" active={false} onClick={() => imageInput.current?.click()}><ImagePlus /></ToolbarButton>
        <input ref={imageInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => void addFigure(event.target.files?.[0])} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ label, active, disabled, onClick, children }: { label: string; active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} className={active ? "active" : ""} disabled={disabled} onClick={onClick}>{children}</button>;
}
