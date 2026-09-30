import mongoose from "mongoose";

const ChandaAccessCodeSchema = new mongoose.Schema({
  hostel: { type: String, required: true, trim: true, maxlength: 120, index: true },
  codeLookup: { type: String, required: true, unique: true, select: false },
  codeHash: { type: String, required: true, select: false },
  codeHint: { type: String, required: true, maxlength: 8 },
  codeCiphertext: { type: String, required: false, select: false },
  codeValue: { type: String, required: false, select: false, maxlength: 4 },
  status: { type: String, enum: ["available", "assigned", "revoked"], default: "available", index: true },
  poc: { type: mongoose.Schema.Types.ObjectId, ref: "ChandaPoc", default: null, index: true },
  assignedAt: { type: Date, default: null },
}, { timestamps: true });

ChandaAccessCodeSchema.index({ hostel: 1, status: 1 });
export default mongoose.models.ChandaAccessCode || mongoose.model("ChandaAccessCode", ChandaAccessCodeSchema);
