import mongoose from "mongoose";

const NewsArticleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  summary: { type: String, required: true, trim: true, maxlength: 700 },
  content: { type: String, default: "", trim: true, maxlength: 20000 },
  category: { type: String, default: "Announcements", trim: true, maxlength: 80 },
  status: { type: String, default: "Published", trim: true, maxlength: 80 },
  coverImage: { type: String, required: true, trim: true, maxlength: 1000 },
  imageAlt: { type: String, default: "", trim: true, maxlength: 300 },
  eventDate: { type: String, default: "", trim: true, maxlength: 120 },
  location: { type: String, default: "", trim: true, maxlength: 200 },
  ctaLabel: { type: String, default: "", trim: true, maxlength: 100 },
  ctaHref: { type: String, default: "", trim: true, maxlength: 1000 },
  author: { type: String, default: "Gujarati Community IITG", trim: true, maxlength: 120 },
  featured: { type: Boolean, default: false, index: true },
  showOnHome: { type: Boolean, default: false, index: true },
  published: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date, default: null, index: true },
  publishAt: { type: Date, default: null, index: true },
  archived: { type: Boolean, default: false, index: true },
  archivedAt: { type: Date, default: null, index: true },
}, { timestamps: true });

export default mongoose.models.NewsArticle || mongoose.model("NewsArticle", NewsArticleSchema);
