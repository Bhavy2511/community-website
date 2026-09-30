import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../lib/mongodb";
import { getAdminSession } from "../../../../lib/admin-auth";
import NewsArticle from "../../../../models/NewsArticle";
import { normaliseNewsInput, newsJson } from "../../../../lib/news";
import { writeAuditLog } from "../../../../lib/admin-audit";

export const runtime = "nodejs";

function denied(request) { return !getAdminSession(request); }

export async function GET(request) {
  if (denied(request)) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  try { await connectMongo(); const articles = await NewsArticle.find().sort({ updatedAt: -1 }).lean(); return NextResponse.json({ articles: articles.map(newsJson) }); }
  catch (error) { console.error("Unable to load admin news", error); return NextResponse.json({ error: "Unable to load news." }, { status: 503 }); }
}

export async function POST(request) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid article data." }, { status: 400 }); }
  const parsed = normaliseNewsInput(body);
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    await connectMongo();
    const data = { ...parsed.value, publishedAt: parsed.value.published ? new Date() : null };
    const article = await NewsArticle.create(data);
    void writeAuditLog({ actor: session.email, action: data.published ? "publish" : "create_draft", entityType: "news", entityId: String(article._id), summary: article.title });
    return NextResponse.json({ article: newsJson(article) }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) return NextResponse.json({ error: "That URL slug is already in use." }, { status: 409 });
    console.error("Unable to create news", error); return NextResponse.json({ error: "Unable to save this article." }, { status: 503 });
  }
}
