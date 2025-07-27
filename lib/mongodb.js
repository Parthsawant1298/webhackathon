// lib/mongodb.js - FIXED VERSION with improved concurrent handling
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Validate MongoDB URI
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Set Mongoose options globally
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false);

// Connection options optimized for better concurrent handling
const options = {
  // Connection pool settings
  maxPoolSize: 100, // Increased for better concurrent handling
  minPoolSize: 10, // Higher minimum to handle bursts
  maxIdleTimeMS: 60000, // Increased to 60s for better connection reuse
  
  // Timeout settings
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 60000, // 60 seconds
  connectTimeoutMS: 30000, // 30 seconds
  
  // Retry and reliability settings
  retryWrites: true, // Enable retryable writes
  retryReads: true, // Enable retryable reads
  heartbeatFrequencyMS: 10000, // Check connection health every 10s
  
  // Network settings
  family: 4, // Force IPv4
  
  // Buffer settings
  bufferMaxEntries: 0, // Disable buffering
  bufferCommands: false, // Disable command buffering
  
  // Write concern
  writeConcern: {
    w: 'majority',
    j: true, // Wait for journal acknowledgment
    wtimeout: 10000 // 10 second timeout
  },
  
  // Read preference
  readPreference: 'primary',
  
  // Compression
  compressors: ['zstd', 'zlib']
};

// Connection state management
let connectionState = {
  isConnecting: false,
  isConnected: false,
  connectionPromise: null,
  lastConnectionAttempt: 0,
  consecutiveFailures: 0
};

// Cached connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    lastHealthCheck: 0
  };
}

// Connection health check
async function isConnectionHealthy() {
  try {
    if (!cached.conn) return false;
    
    const now = Date.now();
    // Check health every 30 seconds
    if (now - cached.lastHealthCheck < 30000) {
      return cached.conn.readyState === 1;
    }
    
    // Perform actual health check
    await cached.conn.db.admin().ping();
    cached.lastHealthCheck = now;
    
    return cached.conn.readyState === 1;
  } catch (error) {
    console.warn('MongoDB health check failed:', error.message);
    return false;
  }
}

// Connection recovery
async function recoverConnection() {
  console.log('🔄 Attempting MongoDB connection recovery...');
  
  // Reset cached connection
  cached.conn = null;
  cached.promise = null;
  connectionState.isConnected = false;
  
  // Wait a bit before retrying
  const backoffTime = Math.min(1000 * Math.pow(2, connectionState.consecutiveFailures), 30000);
  await new Promise(resolve => setTimeout(resolve, backoffTime));
  
  return connectDB();
}

// Setup connection event listeners
function setupConnectionListeners(connection) {
  connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
    connectionState.isConnected = true;
    connectionState.consecutiveFailures = 0;
  });
  
  connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error.message);
    connectionState.isConnected = false;
    connectionState.consecutiveFailures++;
  });
  
  connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
    connectionState.isConnected = false;
  });
  
  connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
    connectionState.isConnected = true;
    connectionState.consecutiveFailures = 0;
  });
  
  connection.on('close', () => {
    console.log('📦 MongoDB connection closed');
    connectionState.isConnected = false;
  });
}

/**
 * Connect to MongoDB with improved error handling and connection management
 * @returns {Promise<mongoose.Connection>}
 */
async function connectDB() {
  try {
    // If connection exists and is healthy, return it
    if (cached.conn && await isConnectionHealthy()) {
      return cached.conn;
    }
    
    // Prevent concurrent connection attempts
    if (connectionState.isConnecting) {
      console.log('⏳ Connection attempt already in progress, waiting...');
      if (cached.promise) {
        await cached.promise;
        return cached.conn;
      }
    }
    
    // Rate limiting for connection attempts
    const now = Date.now();
    const timeSinceLastAttempt = now - connectionState.lastConnectionAttempt;
    if (timeSinceLastAttempt < 5000 && connectionState.consecutiveFailures > 0) {
      throw new Error('Connection attempt rate limited. Please wait before retrying.');
    }
    
    connectionState.isConnecting = true;
    connectionState.lastConnectionAttempt = now;
    
    // Create connection promise if it doesn't exist
    if (!cached.promise) {
      console.log('🔌 Establishing new MongoDB connection...');
      
      cached.promise = mongoose
        .connect(MONGODB_URI, options)
        .then((mongoose) => {
          console.log('✅ MongoDB connection established');
          setupConnectionListeners(mongoose.connection);
          return mongoose;
        })
        .catch((error) => {
          console.error('❌ MongoDB connection failed:', error.message);
          cached.promise = null;
          connectionState.consecutiveFailures++;
          throw error;
        })
        .finally(() => {
          connectionState.isConnecting = false;
        });
    }
    
    try {
      cached.conn = await cached.promise;
      connectionState.isConnected = true;
      
      // Verify connection is actually working
      await cached.conn.db.admin().ping();
      
    } catch (error) {
      cached.promise = null;
      cached.conn = null;
      connectionState.isConnected = false;
      connectionState.consecutiveFailures++;
      
      console.error('Failed to establish MongoDB connection:', error.message);
      
      // If too many consecutive failures, suggest checking configuration
      if (connectionState.consecutiveFailures >= 3) {
        throw new Error(
          `Database connection failed after ${connectionState.consecutiveFailures} attempts. ` +
          'Please check your MongoDB URI and network connectivity.'
        );
      }
      
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    return cached.conn;
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

// Graceful connection cleanup
async function closeConnection() {
  try {
    if (cached.conn) {
      await cached.conn.close();
      cached.conn = null;
      cached.promise = null;
      connectionState.isConnected = false;
      console.log('📦 MongoDB connection closed gracefully');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing MongoDB connection...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing MongoDB connection...');
  await closeConnection();
  process.exit(0);
});

// Export connection utilities
export default connectDB;
export { closeConnection, isConnectionHealthy, recoverConnection };