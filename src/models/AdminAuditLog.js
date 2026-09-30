import mongoose from "mongoose";

const AdminAuditLogSchema = new mongoose.Schema({
  actor: { type: String, required: true, trim: true },
  action: { type: String, required: true, trim: true },
  entityType: { type: String, required: true, trim: true },
  entityId: { type: String, default: "", trim: true },
  summary: { type: String, default: "", trim: true, maxlength: 500 },
}, { timestamps: true });

export default mongoose.models.AdminAuditLog || mongoose.model("AdminAuditLog", AdminAuditLogSchema);
