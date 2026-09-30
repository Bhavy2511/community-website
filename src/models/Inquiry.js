import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 40 },
  subject: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  status: { type: String, enum: ["new", "in-progress", "closed"], default: "new", index: true },
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);
