const mongoose = require('mongoose');

module.exports = mongoose.model('link-to-link', new mongoose.Schema({
    sourceUrlId: { type: String, required: true },
    destinationUrlId: { type: String, required: true },
}));