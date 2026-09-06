import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { getUploadsDirectory } from "@/db";
import { getAuthorizedEditor } from "@/lib/editor-auth";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);
const maximumBytes = 12 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await getAuthorizedEditor())) return Response.json({ error: "Keine Berechtigung." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) return Response.json({ error: "Bitte eine Bilddatei auswählen." }, { status: 400 });

  const extension = allowedTypes.get(file.type);
  if (!extension) return Response.json({ error: "Unterstützt werden JPG, PNG, WebP und GIF." }, { status: 400 });
  if (file.size > maximumBytes) return Response.json({ error: "Das Bild darf höchstens 12 MB groß sein." }, { status: 400 });

  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(/* turbopackIgnore: true */ getUploadsDirectory(), filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return Response.json({ path: `/uploads/${filename}` }, { status: 201 });
}
