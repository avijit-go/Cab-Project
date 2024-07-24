const mongoose = require("mongoose");

const UserNotificationSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    title: {type: String},
    type: {type: Number, default: 1},
    to: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    booking: {type: mongoose.Schema.Types.ObjectId, ref: "BookCab"},
    isRead: {type: Boolean, default: false},
    description: {type: String, default: ""}
}, {timestamps: true});

module.exports = new mongoose.model("UserNotification", UserNotificationSchema)