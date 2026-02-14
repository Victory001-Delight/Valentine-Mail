const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        default: "Friend",
    },
    date: {
        type: Date,
        default: Date.now,
    },
    messageSent: {
        type: Boolean,
        default: false,
    },
    sentAt: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
