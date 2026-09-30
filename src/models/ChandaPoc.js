import mongoose from "mongoose";

const ChandaPocSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  rollNumber: { type: String, required: true, trim: true, lowercase: true, unique: true, immutable: true, maxlength: 40 },
  hostel: { type: String, required: true, trim: true, maxlength: 120 },
  branch: { type: String, required: true, trim: true, maxlength: 120 },
  degree: { type: String, required: true, trim: true, maxlength: 80 },
  yearOfStudy: { type: String, required: true, trim: true, maxlength: 40 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
  accessCode: { type: mongoose.Schema.Types.ObjectId, ref: "ChandaAccessCode", default: null },
  passwordHash: { type: String, required: true, select: false },
  status: { type: String, enum: ["pending", "active", "disabled"], default: "pending", index: true },
}, { timestamps: true });

export default mongoose.models.ChandaPoc || mongoose.model("ChandaPoc", ChandaPocSchema);
