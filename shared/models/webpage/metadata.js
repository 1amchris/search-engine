const mongoose = require('mongoose');

module.exports = mongoose.model('webpage-metadata', new mongoose.Schema({
    urlId: { type: String, unique: true, required: true },
    url: { type: String, unique: true, required: true },
    timestampOfLastCrawl: Number,
}));