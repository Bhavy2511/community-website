import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";

const KurtaOrder = mongoose.models.KurtaOrder || mongoose.model("KurtaOrder", new mongoose.Schema({}, { strict: false, collection: "kurtaorders" }));

function createPickupToken(prefix = "KR") {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex"), code: `${prefix}-${randomBytes(5).toString("hex").toUpperCase()}` };
}

const targets = new Map([
  ["086B5782", "shivansh.jain73@gmail.com"], ["BCD1618E", "pranshukachhadiya13@gmail.com"],
  ["050CBE01", "hardikkathekiya108@gmail.com"], ["D3054DD9", "abhinavdeka711@gmail.com"],
  ["21FC1EB2", "sujal.utpure@iitg.ac.in"], ["21FC1EBC", "deepanshu777patel@gmail.com"],
  ["B4CD901B", "rohan.lokhande@iitg.ac.in"], ["835F14C0", "rathodaravind2007@gmail.com"],
  ["9C7834BA", "luvvya@iitg.ac.in"], ["9C7834C4", "aditya.tapariya@iitg.ac.in"],
  ["6D03F183", "premmaradana9903@gmail.com"], ["99D66E47", "arnab.bhattacharya@iitg.ac.in"],
  ["014CD9A2", "harshagarwal06219@gmail.com"], ["C9581876", "aditya.y@iitg.ac.in"],
  ["2B5ECBCF", "rushilkadivar@gmail.com"], ["0F755E98", "charanjitsiva@gmail.com"],
  ["690D566B", "ktoni@iitg.ac.in"], ["A41D9A7F", "bhattrajil2@gmail.com"],
  ["F92305E4", "apurbakumar176@gmail.com"], ["C435F344", "eternals0811@gmail.com"],
  ["7FAE6967", "pachingtangapachingtanga@gmail.com"], ["4AA88348", "pujak8002@iitg.ac.in"],
  ["93B4ABC2", "nagolu@iitg.ac.in"], ["3D0EAD02", "g.bivash@iitg.ac.in"],
  ["C76B18ED", "cheela@iitg.ac.in"], ["C76B18FD", "swastik@iitg.ac.in"],
  ["0DB21BC4", "kssatvik@gmail.com"],
]);

function csv(value) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${String(text).replaceAll('"', '""')}"`;
}

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || "gujarati-community-iitg", serverSelectionTimeoutMS: 10000 });
const orders = await KurtaOrder.find({}).select("+pickupTokenHash +paymentReceipt.data").lean();
const stamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
const backupPath = path.resolve("backups", `kurta-orders-before-token-rotation-${stamp}.csv`);
await fs.mkdir(path.dirname(backupPath), { recursive: true });
const headers = ["_id", "name", "email", "pickupCode", "pickupTokenHash", "orderedAt", "paymentReceipt", "fullRecord"];
const rows = orders.map((order) => headers.map((key) => {
  if (key === "paymentReceipt") {
    const receipt = order.paymentReceipt ? { ...order.paymentReceipt, data: order.paymentReceipt.data?.toString("base64") } : null;
    return csv(receipt);
  }
  if (key === "fullRecord") return csv({ ...order, paymentReceipt: order.paymentReceipt ? { ...order.paymentReceipt, data: order.paymentReceipt.data?.toString("base64") } : null });
  return csv(key === "_id" ? String(order._id) : order[key]);
}));
await fs.writeFile(backupPath, [headers.join(","), ...rows].join("\n") + "\n");

const matches = orders.filter((order) => targets.get(order._id.toString().slice(-8).toUpperCase()) === order.email);
if (matches.length !== targets.size) throw new Error(`Safety check failed: matched ${matches.length} of ${targets.size} target orders`);
const rotated = [];
for (const order of matches) {
  const suffix = order._id.toString().slice(-8).toUpperCase();
  const pickup = createPickupToken("KR");
  await KurtaOrder.updateOne({ _id: order._id }, { $set: { pickupTokenHash: pickup.tokenHash, pickupCode: pickup.code } });
  rotated.push({ orderId: String(order._id), suffix, email: order.email, oldPickupCode: order.pickupCode, newPickupCode: pickup.code, newToken: pickup.token });
}
console.log(JSON.stringify({ backupPath, totalOrdersBackedUp: orders.length, rotated: rotated.map(({ newToken, ...row }) => row), tokens: rotated }, null, 2));
await mongoose.disconnect();
