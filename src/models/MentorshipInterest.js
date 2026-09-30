import mongoose from "mongoose";

const MentorshipInterestSchema = new mongoose.Schema({
  role: { type: String, enum: ["mentor", "mentee"], required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 40 },
  programme: { type: String, trim: true, maxlength: 140 },
  graduationYear: { type: String, trim: true, maxlength: 12 },
  organisation: { type: String, trim: true, maxlength: 160 },
  areas: [{ type: String, trim: true, maxlength: 80 }],
  note: { type: String, trim: true, maxlength: 1600 },
  consent: { type: Boolean, required: true },
  status: { type: String, enum: ["new", "reviewing", "matched", "closed"], default: "new", index: true },
}, { timestamps: true });

export default mongoose.models.MentorshipInterest || mongoose.model("MentorshipInterest", MentorshipInterestSchema);
