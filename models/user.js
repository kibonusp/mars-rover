const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true,
        unique: true
    },
    encrypted_password: { 
        type: String, 
        required: true 
    }
});

module.exports = mongoose.model('user', userSchema);