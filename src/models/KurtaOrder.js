import mongoose from "mongoose";

const KurtaDesignSchema = new mongoose.Schema({
  designId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1, max: 3 },
  size: { type: String, enum: ["M", "L", "XL", "XXL"], required: false },
  sizes: { type: [String], default: undefined },
}, { _id: false });

const KurtaOrderSchema = new mongoose.Schema({
  submissionKey: { type: String, required: true, maxlength: 36, unique: true, sparse: true, index: true, immutable: true, select: false },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  rollNumber: { type: String, required: true, trim: true, maxlength: 40 },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  designs: { type: [KurtaDesignSchema], required: true },
  totalCount: { type: Number, required: true, min: 1, max: 4 },
  unitPrice: { type: Number, required: true, enum: [449, 499] },
  amount: { type: Number, required: true, min: 499 },
  hostelOrResidence: { type: String, trim: true, maxlength: 160, default: "" },
  branch: { type: String, trim: true, maxlength: 120, default: "" },
  degree: { type: String, trim: true, maxlength: 120, default: "" },
  paymentReference: { type: String, trim: true, maxlength: 80, default: "" },
  paymentConfirmedAt: { type: Date, required: true, default: Date.now },
  paymentStatus: { type: String, enum: ["submitted", "verified", "needs_clarification"], default: "submitted", index: true },
  paymentReviewNote: { type: String, trim: true, maxlength: 500, default: "" },
  paymentReviewedAt: { type: Date, default: null },
  paymentReviewedBy: { type: String, trim: true, maxlength: 254, default: "" },
  pickupCode: { type: String, required: true, unique: true, index: true },
  pickupTokenHash: { type: String, required: true, unique: true, select: false },
  deliveryStatus: { type: String, enum: ["awaiting_collection", "delivered"], default: "awaiting_collection", index: true },
  deliveredAt: { type: Date, default: null },
  deliveredBy: { type: String, trim: true, maxlength: 254, default: "" },
  paymentReceipt: {
    filename: { type: String, required: true, trim: true, maxlength: 180 },
    contentType: { type: String, enum: ["image/jpeg", "image/png", "image/webp"], required: true },
    size: { type: Number, required: true, max: 4 * 1024 * 1024 },
    data: { type: Buffer, required: true, select: false },
  },
  orderedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

export default mongoose.models.KurtaOrder || mongoose.model("KurtaOrder", KurtaOrderSchema);
