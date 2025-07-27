// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Validate MongoDB URI
if (!MONGODB_URI) {
 throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Set Mongoose options globally
mongoose.set('strictQuery', false);

// Connection options optimized for 50 concurrent users
const options = {
 bufferCommands: false,
 serverSelectionTimeoutMS: 20000, // 20 seconds
 socketTimeoutMS: 45000, // 45 seconds  
 connectTimeoutMS: 20000, // 20 seconds
 maxPoolSize: 50, // Perfect for 50 concurrent users
 minPoolSize: 5, // Maintain minimum connections
 maxIdleTimeMS: 30000, // Close idle connections after 30s
 retryWrites: true, // Enable retryable writes
 heartbeatFrequencyMS: 10000, // Check connection health every 10s
 family: 4 // Force IPv4
};

// Cached connection
let cached = global.mongoose;

if (!cached) {
 cached = global.mongoose = { conn: null, promise: null };
}

/**
* Connect to MongoDB - Optimized for 50 concurrent users
* @returns {Promise<mongoose.Connection>}
*/
async function connectDB() {
 // If connection exists and is ready, return it
 if (cached.conn && cached.conn.readyState === 1) {
   return cached.conn;
 }

 // If a connection attempt is in progress, wait for it
 if (!cached.promise) {
   // Create connection promise
   cached.promise = mongoose
     .connect(MONGODB_URI, options)
     .then((mongoose) => {
       console.log('✅ MongoDB connected successfully - Ready for 50 users');
       return mongoose;
     })
     .catch((error) => {
       console.error('❌ MongoDB connection error:', error);
       cached.promise = null;
       throw error;
     });
 }

 try {
   cached.conn = await cached.promise;
 } catch (error) {
   cached.promise = null;
   console.error('Failed to connect to MongoDB:', error.message);
   throw new Error(`Database connection failed: ${error.message}`);
 }

 return cached.conn;
}

export default connectDB;