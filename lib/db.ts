import mongoose from "mongoose";

const MONGODB_URI = process.env.ATLASDB_URL;

if (!MONGODB_URI) {
  throw new Error(
    "Missing ATLASDB_URL environment variable. Set it in .env.local (dev) or in Vercel's Production/Preview environment variables."
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

/**
 * Vercel functions are stateless and can run many concurrent invocations;
 * a naive mongoose.connect() per request exhausts Atlas's connection limit.
 * This caches the connection (and the in-flight connect promise) on the
 * Node global so a warm serverless instance reuses it across invocations,
 * and concurrent cold calls await the same connect() instead of racing.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
