import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  month: String,
  description: String,
  image: String,
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
