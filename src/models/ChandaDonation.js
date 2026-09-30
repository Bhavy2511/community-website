import mongoose from "mongoose";

const ChandaDonationSchema = new mongoose.Schema({
  submissionKey: { type: String, required: true, unique: true, immutable: true, maxlength: 64, select: false },
  receiptNumber: { type: String, required: true, unique: true, index: true },
  poc: { type: mongoose.Schema.Types.ObjectId, ref: "ChandaPoc", default: null, index: true },
  donorName: { type: String, required: true, trim: true, maxlength: 120 },
  donorHostel: { type: String, required: true, trim: true, maxlength: 120 },
  donorEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
  amount: { type: Number, required: true, min: 1, max: 100000 },
  paymentMethod: { type: String, enum: ["cash", "online"], required: true },
  paymentReference: { type: String, trim: true, maxlength: 120, default: "" },
  paymentProofBase64: { type: String, default: "", select: false },
  paymentProofContentType: { type: String, trim: true, maxlength: 80, default: "" },
  paymentProofFilename: { type: String, trim: true, maxlength: 180, default: "" },
  paymentProofSize: { type: Number, default: 0 },
  submittedAt: { type: Date, required: true, default: Date.now, index: true },
  thankYouEmailSentAt: { type: Date, default: null },
  thankYouEmailTo: { type: String, trim: true, lowercase: true, maxlength: 254, default: "", select: false },
  thankYouEmailMessageId: { type: String, trim: true, maxlength: 240, default: "", select: false },
  thankYouEmailLastError: { type: String, trim: true, maxlength: 500, default: "" },
  thankYouEmailLastAttemptAt: { type: Date, default: null },
  thankYouEmailAttemptCount: { type: Number, default: 0, min: 0 },
  receiptPdfBase64: { type: String, default: "", select: false },
  receiptPdfFilename: { type: String, trim: true, maxlength: 180, default: "", select: false },
  recordingSource: { type: String, enum: ["poc", "admin"], default: "poc", index: true },
}, { timestamps: true });

export default mongoose.models.ChandaDonation || mongoose.model("ChandaDonation", ChandaDonationSchema);
