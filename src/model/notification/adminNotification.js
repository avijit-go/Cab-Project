const mongoose = require("mongoose");

const AdminNotificationSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    title: {type: String},
    type: {type: Number, default: 1},
    from: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    booking: {type: mongoose.Schema.Types.ObjectId, ref: "BookCab"},
    isRead: {type: Boolean, default: false}
}, {timestamps: true});

module.exports = new mongoose.model("AdminNotification", AdminNotificationSchema)