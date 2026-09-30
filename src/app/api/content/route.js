import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import Event from "../../../models/Event";
import GalleryItem from "../../../models/GalleryItem";
import Place from "../../../models/Place";

// Events, gallery records and food places can be updated in Atlas without a redeploy.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const publicCache = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

export async function GET() {
  if (!hasMongoConfiguration()) return NextResponse.json({ events: [], gallery: [], places: [], source: "unconfigured" }, { headers: publicCache });

  try {
    await connectMongo();
    const [events, gallery, places] = await Promise.all([
      Event.find({ published: true }).select("slug name month description image featured order").sort({ order: 1 }).lean(),
      GalleryItem.find({ published: true }).select("year event image alt order").sort({ year: -1, order: 1 }).lean(),
      Place.find({ published: true }).select("name cuisine description locality address mapUrl verified").sort({ name: 1 }).lean(),
    ]);
    return NextResponse.json({ events, gallery, places, source: "mongodb" }, { headers: publicCache });
  } catch (error) {
    console.error("Unable to load public site content", error);
    return NextResponse.json({ events: [], gallery: [], places: [], source: "error", error: "Content is temporarily unavailable." }, { status: 503, headers: publicCache });
  }
}
