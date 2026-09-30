import mongoose from "mongoose";

const DandiyaOrderSchema = new mongoose.Schema(
  {
    submissionKey: {
      type: String,
      maxlength: 36,
      unique: true,
      sparse: true,
      index: true,
      immutable: true,
      select: false,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    unitDeposit: { type: Number, required: true, default: 50 },
    totalAmount: { type: Number, required: true, min: 50 },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: true,
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },
    pickupCode: { type: String, required: true, unique: true, index: true },
    pickupTokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    distributionStatus: {
      type: String,
      enum: ["pending", "distributed"],
      default: "pending",
      index: true,
    },
    distributedAt: { type: Date, default: null },
    distributedBy: { type: String, trim: true, maxlength: 254, default: "" },
    orderedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.DandiyaOrder ||
  mongoose.model("DandiyaOrder", DandiyaOrderSchema);
