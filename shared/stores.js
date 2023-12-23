require("dotenv").config();
const mongoose = require('mongoose');

function connect(storeUrl) {
    mongoose
        .connect(storeUrl)
        .then(() => console.log("MongoDB connected..."))
        .catch(err => console.error("MongoDB connection error:", err));
}

module.exports = {
    connect,
};