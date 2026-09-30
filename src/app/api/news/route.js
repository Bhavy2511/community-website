import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import NewsArticle from "../../../models/NewsArticle";
import { newsJson } from "../../../lib/news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const publicCache = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

function hasUsableImage(article) { return article.coverImage?.startsWith("/") || /^https?:\/\//i.test(article.coverImage || ""); }

export async function GET(request) {
  if (!hasMongoConfiguration()) return NextResponse.json({ articles: [], source: "fallback" }, { headers: publicCache });
  try {
    await connectMongo();
    const now = new Date();
    const homeOnly = new URL(request.url).searchParams.get("home") === "1";
    const articles = await NewsArticle.find({ published: true, archived: { $ne: true }, ...(homeOnly ? { showOnHome: true } : {}), $or: [{ publishAt: null }, { publishAt: { $lte: now } }, { publishAt: { $exists: false } }] }).sort({ featured: -1, publishedAt: -1, createdAt: -1 }).lean();
    return NextResponse.json({ articles: articles.filter(hasUsableImage).map(newsJson), source: "mongodb" }, { headers: publicCache });
  } catch (error) {
    console.error("Unable to load public news", error);
    return NextResponse.json({ articles: [], source: "fallback" }, { headers: publicCache });
  }
}
