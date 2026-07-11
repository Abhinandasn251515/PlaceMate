import mongoose from 'mongoose';

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI;
  if (!connUri) {
    console.error('❌ MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(connUri, options);
      console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
      break;
    } catch (err) {
      retries -= 1;
      console.error(`❌ MongoDB Connection Attempt Failed (${5 - retries}/5): ${err.message}`);
      if (retries === 0) {
        console.error('❌ Could not establish database connection after 5 attempts. Exiting...');
        process.exit(1);
      }
      console.log('🔄 Retrying database connection in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Handle runtime connection drops
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected! Attempting automatic reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🟢 MongoDB successfully reconnected!');
  });
};

export default connectDB;
