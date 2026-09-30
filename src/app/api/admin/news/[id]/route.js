import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import { getAdminSession } from "../../../../../lib/admin-auth";
import NewsArticle from "../../../../../models/NewsArticle";
import { normaliseNewsInput, newsJson } from "../../../../../lib/news";
import { writeAuditLog } from "../../../../../lib/admin-audit";

export const runtime = "nodejs";

function validId(id) { return mongoose.Types.ObjectId.isValid(id); }
function access(request, id) {
  const session = getAdminSession(request);
  if (!session) return { response: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };
  if (!validId(id)) return { response: NextResponse.json({ error: "Invalid news item." }, { status: 400 }) };
  if (!hasMongoConfiguration()) return { response: NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 }) };
  return { session };
}

export async function GET(request, { params }) {
  const check = access(request, params.id); if (check.response) return check.response;
  try {
    await connectMongo(); const article = await NewsArticle.findById(params.id).lean();
    if (!article) return NextResponse.json({ error: "News item not found." }, { status: 404 });
    return NextResponse.json({ article: newsJson(article) });
  } catch (error) { console.error("Unable to load news item", error); return NextResponse.json({ error: "Unable to load this news item." }, { status: 503 }); }
}

export async function PATCH(request, { params }) {
  const check = access(request, params.id); if (check.response) return check.response;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid article data." }, { status: 400 }); }
  const parsed = normaliseNewsInput(body); if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    await connectMongo();
    const existing = await NewsArticle.findById(params.id); if (!existing) return NextResponse.json({ error: "News item not found." }, { status: 404 });
    const wasPublished = existing.published;
    Object.assign(existing, parsed.value);
    if (existing.published && !wasPublished) existing.publishedAt = new Date();
    if (!existing.published) existing.publishedAt = null;
    await existing.save();
    void writeAuditLog({ actor: check.session.email, action: existing.published && !wasPublished ? "publish" : "update", entityType: "news", entityId: String(existing._id), summary: existing.title });
    return NextResponse.json({ article: newsJson(existing) });
  } catch (error) {
    if (error?.code === 11000) return NextResponse.json({ error: "That URL slug is already in use." }, { status: 409 });
    console.error("Unable to update news", error); return NextResponse.json({ error: "Unable to save this article." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const check = access(request, params.id); if (check.response) return check.response;
  try {
    await connectMongo();
    const article = await NewsArticle.findByIdAndUpdate(params.id, { $set: { archived: true, archivedAt: new Date(), showOnHome: false, published: false } }, { new: true });
    if (!article) return NextResponse.json({ error: "News item not found." }, { status: 404 });
    void writeAuditLog({ actor: check.session.email, action: "archive", entityType: "news", entityId: String(article._id), summary: article.title });
    return NextResponse.json({ ok: true, article: newsJson(article) });
  } catch (error) { console.error("Unable to archive news", error); return NextResponse.json({ error: "Unable to archive this article." }, { status: 503 }); }
}
