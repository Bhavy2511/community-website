import mongoose from "mongoose";

const NewsImageSchema = new mongoose.Schema({
  filename: { type: String, required: true, trim: true, maxlength: 180 },
  contentType: { type: String, required: true, trim: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
}, { timestamps: true });

export default mongoose.models.NewsImage || mongoose.model("NewsImage", NewsImageSchema);
