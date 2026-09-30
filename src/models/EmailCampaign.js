import mongoose from "mongoose";

const EmailCampaignSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  recipient: { type: String, required: true, trim: true, lowercase: true },
  kind: { type: String, required: true, default: "test_news" },
  status: { type: String, required: true, enum: ["pending", "sent", "failed"], default: "pending" },
  providerId: { type: String, default: "" },
  error: { type: String, default: "" },
  sentAt: { type: Date, default: null },
}, { timestamps: true });

EmailCampaignSchema.index({ articleId: 1, recipient: 1, kind: 1 }, { unique: true });

export default mongoose.models.EmailCampaign || mongoose.model("EmailCampaign", EmailCampaignSchema);
