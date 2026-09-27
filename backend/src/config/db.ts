import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoURI = process.env.DB_URL;
  if (!mongoURI) {
    throw new Error("DB_URL is not defined in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoURI).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
