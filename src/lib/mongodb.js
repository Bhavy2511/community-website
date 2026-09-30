import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const globalCache = globalThis;

if (!globalCache.__mongoose) {
  globalCache.__mongoose = { connection: null, promise: null };
}

export function hasMongoConfiguration() {
  return Boolean(MONGODB_URI);
}

export default async function connectMongo() {
  if (!MONGODB_URI) return null;
  if (globalCache.__mongoose.connection) return globalCache.__mongoose.connection;

  if (!globalCache.__mongoose.promise) {
    const configuredPoolSize = Number.parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10", 10);
    const maxPoolSize = Number.isFinite(configuredPoolSize) ? Math.min(Math.max(configuredPoolSize, 1), 50) : 10;
    globalCache.__mongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME || "gujarati-community-iitg",
      maxPoolSize,
      minPoolSize: 0,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    });
  }

  try {
    globalCache.__mongoose.connection = await globalCache.__mongoose.promise;
    return globalCache.__mongoose.connection;
  } catch (error) {
    globalCache.__mongoose.promise = null;
    throw error;
  }
}
