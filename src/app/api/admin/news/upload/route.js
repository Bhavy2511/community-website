import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import { getAdminSession } from "../../../../../lib/admin-auth";
import NewsImage from "../../../../../models/NewsImage";
import { writeAuditLog } from "../../../../../lib/admin-audit";

export const runtime = "nodejs";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 4 * 1024 * 1024;

export async function POST(request) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  let form;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Choose an image file and try again." }, { status: 400 }); }
  const file = form.get("image");
  if (!file || typeof file === "string") return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!acceptedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 400 });
  if (!file.size || file.size > maxBytes) return NextResponse.json({ error: "Use an image smaller than 4 MB." }, { status: 400 });
  try {
    await connectMongo();
    const image = await NewsImage.create({ filename: file.name || "news-image", contentType: file.type, size: file.size, data: Buffer.from(await file.arrayBuffer()) });
    const src = `/api/news/images/${image._id}`;
    void writeAuditLog({ actor: session.email, action: "upload", entityType: "news_image", entityId: String(image._id), summary: image.filename });
    return NextResponse.json({ src, filename: image.filename, size: image.size });
  } catch (error) { console.error("Unable to upload news image", error); return NextResponse.json({ error: "Unable to upload this image." }, { status: 503 }); }
}
