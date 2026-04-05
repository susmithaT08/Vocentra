const mongoose = require('mongoose');
const dotenv = require('dotenv');
const GlobalWord = require('../models/GlobalWord');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: '../.env' }); // Adjust path if needed

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vocentra');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data to prevent duplicates on re-run
        await GlobalWord.deleteMany();
        console.log('Database Cleared.');

        // For the full 3000+ dataset, we will read from a JSON file.
        // Today, we are generating the JSON dynamically for the seed due to constraints.
        const dictionaryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'dictionary.json'), 'utf-8'));

        await GlobalWord.insertMany(dictionaryData);

        console.log(`Data Imported Successfully! Inserted ${dictionaryData.length} words.`);
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error.message}`);
        process.exit(1);
    }
};

importData();
