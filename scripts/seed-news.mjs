import connectMongo from "../src/lib/mongodb.js";
import NewsArticle from "../src/models/NewsArticle.js";
import { communityNews } from "../src/data/site-content.js";

await connectMongo();
for (const item of communityNews) {
  await NewsArticle.updateOne({ slug: item.id }, { $setOnInsert: {
    slug: item.id, title: item.title, summary: item.copy, category: item.category, status: item.status,
    coverImage: item.image, eventDate: item.date, imageAlt: item.title, featured: false, published: true, publishedAt: new Date(),
  } }, { upsert: true });
}
console.log(`Seeded ${communityNews.length} legacy news items.`);
