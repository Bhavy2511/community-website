import mongoose from "mongoose";

const GalleryItemSchema = new mongoose.Schema({
  year: { type: Number, required: true, index: true },
  event: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  alt: { type: String, required: true },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.models.GalleryItem || mongoose.model("GalleryItem", GalleryItemSchema);
