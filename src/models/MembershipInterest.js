import mongoose from "mongoose";

const MembershipInterestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 40 },
  programme: { type: String, trim: true, maxlength: 140 },
  graduationYear: { type: String, trim: true, maxlength: 12 },
  hometown: { type: String, trim: true, maxlength: 120 },
  interests: { type: String, trim: true, maxlength: 1000 },
  status: { type: String, enum: ["new", "contacted", "member"], default: "new", index: true },
}, { timestamps: true });

export default mongoose.models.MembershipInterest || mongoose.model("MembershipInterest", MembershipInterestSchema);
