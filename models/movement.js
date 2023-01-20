const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    direction: {
        type: String,
        required: true
    },
    nextMovement: {
        type: String
    },
    timestamp: Date,
    sessionID: String
});

module.exports = mongoose.model('movement', movementSchema);