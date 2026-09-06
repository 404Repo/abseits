import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUploadsDirectory } from "@/db";

const filenamePattern = /^[0-9a-f-]+\.(jpg|png|webp|gif)$/;
const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!filenamePattern.test(filename)) return new Response("Not found", { status: 404 });

  try {
    const file = await readFile(path.join(/* turbopackIgnore: true */ getUploadsDirectory(), filename));
    const extension = filename.split(".").pop() || "";
    return new Response(new Uint8Array(file), {
      headers: {
        "content-type": contentTypes[extension] || "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
