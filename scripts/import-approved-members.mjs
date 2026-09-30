import mongoose from "mongoose";
import XLSX from "xlsx";

import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const sourcePath = process.argv[2];
const applyChanges = process.argv.includes("--apply");

if (!sourcePath) {
  throw new Error("Usage: node scripts/import-approved-members.mjs <responses.xlsx> [--apply]");
}

const coreTeamNames = new Set([
  "dhruv pansuriya", "viraj nagariya", "het patel", "jinay mehta", "mihir agarwal",
  "keval juthani", "harshit patel", "darshan agarwal", "aditya bhawsar",
]);

const clean = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
const fullNameKey = (value) => clean(value).toLowerCase();
const field = (row, label) => {
  const matchingKey = Object.keys(row).find((key) => fullNameKey(key) === fullNameKey(label));
  return matchingKey ? row[matchingKey] : "";
};
const graduationYear = (value) => {
  const match = clean(value).match(/20\d{2}/);
  return match ? Number(match[0]) : undefined;
};

const workbook = XLSX.readFile(sourcePath, { cellDates: true });
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: false });

const members = rows
  .map((row) => {
    const name = clean(field(row, "Full Name"));
    const status = clean(field(row, "I am a/an..."));
    const isAlumni = /alumn/i.test(status);
    return {
      name,
      programme: clean(field(row, "Degree (e.g., B.Tech, M.Tech)")),
      department: clean(field(row, "Department (e.g., CSE, Civil)")),
      graduationYear: graduationYear(field(row, "Graduating Year")),
      role: isAlumni ? "Alumnus / Alumna" : "Student",
      leadershipRole: fullNameKey(name) === "viraj nagariya" ? "Community Head" : "",
      category: coreTeamNames.has(fullNameKey(name)) ? "Core team" : isAlumni ? "Alumni" : "Members",
      visibleInDirectory: true,
      // Preserve the original response privately for organisers; the public API explicitly excludes this field.
      sourceData: Object.fromEntries(Object.entries(row).map(([key, value]) => [clean(key), clean(value)])),
    };
  })
  .filter((member) => member.name);

const uniqueMembers = [...new Map(members.map((member) => [fullNameKey(member.name), member])).values()];
console.log(`Prepared ${uniqueMembers.length} approved directory profiles from ${rows.length} response rows.`);
console.log("The public directory exposes only approved profile fields; the original response is retained privately for organisers.");

if (!applyChanges) {
  console.log("Dry run complete. Add --apply to write these approved profiles to MongoDB.");
  process.exit(0);
}

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required when using --apply.");

await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB_NAME || "gujarati-community-iitg",
});

const Member = mongoose.models.Member || mongoose.model("Member", new mongoose.Schema({}, { strict: false }));
for (const member of uniqueMembers) {
  await Member.updateOne({ name: member.name }, { $set: member }, { upsert: true });
}

console.log(`Upserted ${uniqueMembers.length} approved directory profiles without deleting existing records.`);
await mongoose.disconnect();
