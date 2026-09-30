import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required. Copy .env.example to .env.local and add your connection string.");
}

const coreTeam = [
  { name: "Dhruv Pansuriya", programme: "B.Tech", department: "Computer Science & Engineering", graduationYear: 2027 },
  { name: "Viraj Nagariya", programme: "PhD", department: "Centre for Sustainable Polymers", graduationYear: 2028 },
  { name: "Het Patel", programme: "B.Tech", department: "Chemical Engineering", graduationYear: 2027 },
  { name: "Jinay Mehta", programme: "B.Tech", department: "Chemistry", graduationYear: 2027 },
  { name: "Mihir Agarwal", programme: "M.Tech", department: "Computer Science & Engineering", graduationYear: 2027 },
  { name: "Keval Juthani", programme: "M.Tech", department: "Computer Science & Engineering", graduationYear: 2027 },
  { name: "Harshit Patel", programme: "B.Tech", department: "Electronics and Electrical Engineering", graduationYear: 2027 },
  { name: "Darshan Agarwal", programme: "M.Tech", department: "Mechanical Engineering", graduationYear: 2027 },
  { name: "Aditya Bhawsar", programme: "B.Tech", department: "Computer Science & Engineering", graduationYear: 2027 },
].map((member) => ({ ...member, role: "Student", category: "Core team", visibleInDirectory: true }));

await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB_NAME || "gujarati-community-iitg",
});

const Member = mongoose.models.Member || mongoose.model("Member", new mongoose.Schema({}, { strict: false }));

for (const member of coreTeam) {
  await Member.updateOne({ name: member.name }, { $set: member }, { upsert: true });
}

console.log(`Upserted ${coreTeam.length} approved core-team profiles without deleting existing records.`);
await mongoose.disconnect();
