import connectMongo from "./mongodb";
import AdminAuditLog from "../models/AdminAuditLog";

export async function writeAuditLog(entry) {
  try { await connectMongo(); await AdminAuditLog.create(entry); } catch (error) { console.error("Unable to record admin audit entry", error); }
}
