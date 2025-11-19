// src/lib/db.ts
import mongoose from "mongoose";

type MongooseCache = {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
};

// Extend global properly
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please add your MongoDB URI to .env.local\nExample: MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/urlshortener"
  );
}

// This is the trick used by 99% of Next.js + Mongoose projects
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<mongoose.Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };
  
      cached.promise = mongoose
        .connect(MONGODB_URI!, opts)
        .then((m) => {
          console.log("MongoDB connected successfully");
          return m;
        })
        .catch((err) => {
          console.error("MongoDB connection error:", err);
          cached.promise = null; // reset so it retries next time
          throw err;
        });
    }
  
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      // reset promise so subsequent calls can retry connecting
      cached.promise = null;
      throw err;
    }
  }