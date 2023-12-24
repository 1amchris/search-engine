const mongoose = require('mongoose');

module.exports = mongoose.model('webpage-object', new mongoose.Schema({
    urlId: { type: String, unique: true, required: true },
    html: { type: String, required: true },
}));