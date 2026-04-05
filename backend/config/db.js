const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI) {
            // Try to connect to persistent database (Atlas)
            try {
                const conn = await mongoose.connect(process.env.MONGO_URI, {
                    serverSelectionTimeoutMS: 10000,
                });
                console.log(`MongoDB Connected (Persistent): ${conn.connection.host}`);
                return;
            } catch (atlasError) {
                console.warn(`Atlas connection failed: ${atlasError.message}`);
                if (process.env.NODE_ENV === 'production') {
                    console.error('CRITICAL: Cannot connect to Atlas in production. Exiting.');
                    process.exit(1);
                }
                console.warn('Falling back to Memory Server for local development...');
            }
        }

        if (process.env.NODE_ENV === 'production') {
            console.error('CRITICAL: MONGO_URI is required in production. Exiting.');
            process.exit(1);
        }

        // Fallback to Memory Server in development only
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            const conn = await mongoose.connect(mongoUri);
            console.log(`MongoDB Memory Server Connected (Volatile): ${conn.connection.host}`);
            console.warn("WARNING: Running in Memory Server mode. Data will be lost on restart.");
        } catch (memError) {
            console.error(`Failed to start Memory Server: ${memError.message}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
