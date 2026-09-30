export function slugify(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

const text = (value, length) => typeof value === "string" ? value.trim().slice(0, length) : "";

export function normaliseNewsInput(input) {
  const title = text(input.title, 180);
  const summary = text(input.summary, 700);
  const coverImage = text(input.coverImage, 1000);
  const slug = slugify(input.slug || title);
  if (!title || !summary || !coverImage || !slug) return { error: "Title, short summary and cover image are required." };
  if (!coverImage.startsWith("/") && !/^https?:\/\//i.test(coverImage)) return { error: "Cover image must be a website path beginning with / or a full https:// URL." };
  const ctaHref = text(input.ctaHref, 1000);
  if (ctaHref && !ctaHref.startsWith("/") && !/^https?:\/\//i.test(ctaHref)) return { error: "Call-to-action URL must begin with / or https://." };
  return { value: {
    slug, title, summary, coverImage,
    content: text(input.content, 20000), category: text(input.category, 80) || "Announcements", status: text(input.status, 80) || "Published",
    imageAlt: text(input.imageAlt, 300), eventDate: text(input.eventDate, 120), location: text(input.location, 200),
    ctaLabel: text(input.ctaLabel, 100), ctaHref, author: text(input.author, 120) || "Gujarati Community IITG",
    featured: Boolean(input.featured), showOnHome: Boolean(input.showOnHome), published: Boolean(input.published), publishAt: input.publishAt ? new Date(input.publishAt) : null,
  } };
}

export function newsJson(article) {
  const value = article.toObject ? article.toObject() : article;
  return { ...value, id: String(value._id || value.id), _id: undefined };
}
