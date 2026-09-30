import mongoose from "mongoose";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import NewsImage from "../../../../../models/NewsImage";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  if (!hasMongoConfiguration() || !mongoose.Types.ObjectId.isValid(params.id)) return new Response(null, { status: 404 });
  try {
    await connectMongo();
    const image = await NewsImage.findById(params.id).lean();
    if (!image) return new Response(null, { status: 404 });
    return new Response(image.data.buffer.slice(image.data.byteOffset, image.data.byteOffset + image.data.byteLength), { headers: { "Content-Type": image.contentType, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch (error) { console.error("Unable to read news image", error); return new Response(null, { status: 503 }); }
}
