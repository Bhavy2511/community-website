import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../lib/mongodb";
import NewsArticle from "../../../../models/NewsArticle";
import { newsJson } from "../../../../lib/news";

export const runtime = "nodejs";
const hiddenPublicSlugs = new Set(["garbaraas-merch-kurta-koti-coming-soon"]);

export async function GET(_request, { params }) {
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "News is not configured." }, { status: 404 });
  try {
    await connectMongo();
    const now = new Date();
    if (hiddenPublicSlugs.has(params.slug)) return NextResponse.json({ error: "News article not found." }, { status: 404 });
    const article = await NewsArticle.findOne({ slug: params.slug, published: true, archived: { $ne: true }, $or: [{ publishAt: null }, { publishAt: { $lte: now } }, { publishAt: { $exists: false } }] }).lean();
    if (!article || (!article.coverImage?.startsWith("/") && !/^https?:\/\//i.test(article.coverImage || ""))) return NextResponse.json({ error: "News article not found." }, { status: 404 });
    return NextResponse.json({ article: newsJson(article) });
  } catch (error) {
    console.error("Unable to load news article", error);
    return NextResponse.json({ error: "Unable to load this update right now." }, { status: 503 });
  }
}
