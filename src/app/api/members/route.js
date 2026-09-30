import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import Member from "../../../models/Member";

// Directory data comes from Atlas and must never be pre-rendered at build time.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  if (!hasMongoConfiguration()) return NextResponse.json({ members: [], source: "unconfigured" });

  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(48, Math.max(1, Number.parseInt(searchParams.get("limit") || "12", 10) || 12));
    const conditions = { visibleInDirectory: true };

    if (category && category !== "All") conditions.category = category;
    if (query) {
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      conditions.$or = ["name", "programme", "department", "role"].map((field) => ({ [field]: { $regex: safeQuery, $options: "i" } }));
    }

    const [total, members] = await Promise.all([
      Member.countDocuments(conditions),
      Member.find(conditions)
        .select("name programme department graduationYear role leadershipRole category avatarUrl")
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({ members, source: "mongodb", pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Unable to load member directory", error);
    return NextResponse.json({ members: [], source: "error", error: "Directory is temporarily unavailable." }, { status: 503 });
  }
}
