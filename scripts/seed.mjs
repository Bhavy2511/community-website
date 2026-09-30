import mongoose from "mongoose";

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required. Copy .env.example to .env.local and add your connection string.");

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || "gujarati-community-iitg" });
const Member = mongoose.models.Member || mongoose.model("Member", new mongoose.Schema({}, { strict: false }));
const Event = mongoose.models.Event || mongoose.model("Event", new mongoose.Schema({}, { strict: false }));
const Place = mongoose.models.Place || mongoose.model("Place", new mongoose.Schema({}, { strict: false }));
const GalleryItem = mongoose.models.GalleryItem || mongoose.model("GalleryItem", new mongoose.Schema({}, { strict: false }));

const members = [
  { name: "Dhruv Pansuriya", programme: "B.Tech, 2027", role: "Student coordinator", city: "Surat", category: "Core team", visibleInDirectory: true },
  { name: "Aarav Shah", programme: "B.Tech, 2026", role: "Culture & events", city: "Ahmedabad", category: "Core team", visibleInDirectory: true },
  { name: "Mitali Patel", programme: "M.Des, 2027", role: "Outreach", city: "Vadodara", category: "Members", visibleInDirectory: true },
  { name: "Prof. N. V. Desai", programme: "Faculty advisor", role: "Faculty advisor", city: "Gujarat", category: "Faculty", visibleInDirectory: true },
];
const events = [
  { slug: "garba-raas", name: "Garba Raas", month: "September", description: "Four nights of music, raas, colour and a packed dance floor.", image: "/community/garba-2025.jpg", featured: true, order: 1, published: true },
  { slug: "nutan-varsh-milan", name: "Nutan Varsh Milan", month: "October", description: "Food, warmth and new beginnings with the IITG family.", image: "/community/nutan-varsh-2025.jpg", order: 2, published: true },
  { slug: "sharad-poonam", name: "Sharad Poonam", month: "Winter", description: "A moonlit Gujarati tradition with shared food and music.", order: 3, published: true },
  { slug: "farewell-2025", name: "Farewell 2025", month: "April 2025", description: "A warm send-off for graduating members and the memories they leave with the community.", image: "/community/farewell-2025/IMG_6328.JPG", order: 4, published: true },
];
const places = [
  { name: "Gopal Maharaj", cuisine: "Gujarati thali", description: "A familiar, home-style thali for group lunches.", locality: "Guwahati", verified: false, published: true },
  { name: "Rajasthani Dhaba", cuisine: "Rajasthani", description: "Dal baati, gatte and a festive dinner feel.", locality: "Guwahati", verified: false, published: true },
];
const gallery = [
  { year: 2025, event: "Garba Raas", image: "/community/gallery/garba-dance.jpeg", alt: "Garba dancers celebrating at IIT Guwahati", order: 1, published: true },
  { year: 2025, event: "Garba Raas", image: "/community/gallery/garba-crowd.jpg", alt: "Community gathering during Garba Raas", order: 2, published: true },
  { year: 2025, event: "Nutan Varsh Milan", image: "/community/nutan-varsh-2025.jpg", alt: "Nutan Varsh Milan gathering", order: 3, published: true },
];

await Promise.all([Member.deleteMany({}), Event.deleteMany({}), Place.deleteMany({}), GalleryItem.deleteMany({})]);
await Promise.all([Member.insertMany(members), Event.insertMany(events), Place.insertMany(places), GalleryItem.insertMany(gallery)]);
console.log(`Seeded ${members.length} members, ${events.length} events, ${places.length} places and ${gallery.length} gallery items.`);
await mongoose.disconnect();
