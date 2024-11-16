const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    sessions: [{
        sessionId: String,
        loginTime: Date,
        logoutTime: Date,
        scores: [{
          score: Number,
          date: { type: Date, default: Date.now }
        }]
    }]
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

