const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb+srv://connectlocal959:XTu6mm9cmsPoIM7H@local-connect-app-db.jbitocl.mongodb.net/local-connect-db?retryWrites=true&w=majority&appName=local-connect-app-db';
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }

  async connect() {
    try {
      await mongoose.connect(this.connectionString, this.options);
      console.log('✅ Connected to MongoDB');
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });

      process.on('SIGINT', this.gracefulClose);
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
  }

  gracefulClose = async () => {
    await this.disconnect();
    process.exit(0);
  }
}

module.exports = Database;