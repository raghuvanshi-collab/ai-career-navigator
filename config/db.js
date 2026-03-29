const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error("MONGO_URI is missing in your .env file!");
    }

    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    
    // Global connection error handlers after initial connect
    mongoose.connection.on('error', (err) => {
      console.error(`⚠️ MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('Please ensure your IP is whitelisted on Atlas and credentials are correct.');
    process.exit(1);
  }
};

module.exports = connectDB;
