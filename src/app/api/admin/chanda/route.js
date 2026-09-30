import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../lib/chanda-admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../lib/mongodb";
import ChandaDonation from "../../../../models/ChandaDonation";
import ChandaPoc from "../../../../models/ChandaPoc";
import "../../../../models/ChandaAccessCode";
import ChandaAccessCode from "../../../../models/ChandaAccessCode";
import { decryptAccessCode } from "../../../../lib/chanda-code-vault";
import { CHANDA_HOSTELS } from "../../../../lib/chanda-options";

export const runtime = "nodejs";
export async function GET(request) {
  if (!getAdminSession(request)) return NextResponse.json({ error: "Sign in to the main admin workspace first.", code: "primary_auth_required" }, { status: 401 });
  if (!getChandaAdminSession(request)) return NextResponse.json({ error: "Enter the separate Chanda admin credentials.", code: "chanda_auth_required" }, { status: 403 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  try {
    await connectMongo();
    const includeCodes = request.nextUrl.searchParams.get("includeCodes") === "1";
    const donorIdentity = {
      $cond: [
        { $ne: [{ $ifNull: ["$donorEmail", ""] }, ""] },
        { $toLower: "$donorEmail" },
        { $toLower: "$donorName" },
      ],
    };
    const [donations, pocs, hostelTotals, total, donorTotal, accessCodes] = await Promise.all([
      ChandaDonation.find({}).populate("poc", "fullName hostel rollNumber email phone branch degree yearOfStudy").sort({ submittedAt: -1 }).lean(),
      ChandaPoc.find({}).populate("accessCode", "codeHint status").sort({ createdAt: -1 }).lean(),
      ChandaDonation.aggregate([
        { $set: { donorIdentity } },
        { $group: { _id: { hostel: "$donorHostel", donor: "$donorIdentity" }, amount: { $sum: "$amount" }, receipts: { $sum: 1 } } },
        { $group: { _id: "$_id.hostel", amount: { $sum: "$amount" }, donors: { $sum: 1 }, receipts: { $sum: "$receipts" } } },
        { $sort: { amount: -1, _id: 1 } },
      ]),
      ChandaDonation.aggregate([{ $group: { _id: null, amount: { $sum: "$amount" }, count: { $sum: 1 } } }]),
      ChandaDonation.aggregate([{ $set: { donorIdentity } }, { $group: { _id: "$donorIdentity" } }, { $count: "count" }]),
      includeCodes
        ? ChandaAccessCode.find({ status: { $in: ["available", "assigned"] } }).select("+codeCiphertext +codeValue").populate("poc", "fullName rollNumber email phone").sort({ hostel: 1, createdAt: 1 }).lean()
        : Promise.resolve([]),
    ]);
    const hostelTotalMap = new Map(hostelTotals.map((item) => [item._id, item]));
    const allHostelTotals = CHANDA_HOSTELS.map((hostel) => {
      const item = hostelTotalMap.get(hostel);
      const amount = item?.amount || 0;
      const donors = item?.donors || 0;
      const receipts = item?.receipts || 0;
      return { hostel, amount, donors, receipts, perHead: donors ? Math.round(amount / donors) : 0 };
    });
    return NextResponse.json({ donations: donations.map((item) => ({ ...item, id: item._id.toString() })), pocs: pocs.map((item) => ({ ...item, id: item._id.toString() })), accessCodes: accessCodes.map((item) => ({ id: item._id.toString(), hostel: item.hostel, code: item.codeValue || decryptAccessCode(item.codeCiphertext), codeHint: item.codeHint, status: item.status, poc: item.poc ? { ...item.poc, id: item.poc._id.toString() } : null })), hostelTotals: allHostelTotals, summary: { ...(total[0] || { amount: 0, count: 0 }), donors: donorTotal[0]?.count || 0 } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error("Unable to load Chanda admin data", error); return NextResponse.json({ error: "Unable to load Chanda records." }, { status: 503 }); }
}
