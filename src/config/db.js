const mongoose = require('mongoose');


async function connectDB(uri) {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { dbName: 'career_health' });
    console.log('✅ MongoDB connected');
}


module.exports = connectDB;