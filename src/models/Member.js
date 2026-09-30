import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  programme: { type: String, trim: true },
  department: { type: String, trim: true },
  graduationYear: Number,
  city: { type: String, trim: true },
  role: { type: String, trim: true },
  leadershipRole: { type: String, trim: true },
  category: { type: String, enum: ["Core team", "Faculty", "Members", "Alumni"], default: "Members", index: true },
  avatarUrl: String,
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  hostel: { type: String, trim: true },
  sourceData: { type: mongoose.Schema.Types.Mixed, select: false },
  visibleInDirectory: { type: Boolean, default: true, index: true },
}, { timestamps: true });

MemberSchema.index({ name: "text", programme: "text", department: "text", role: "text" });
export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
