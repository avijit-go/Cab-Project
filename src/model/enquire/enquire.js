const mongoose = require("mongoose");

const EnquireSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    message: {type: String, default: "", trim: true},
    user: {type: mongoose.Types.ObjectId, ref: "User"},
    status: { type: String, enum: ["read", "unread", "replied"], default: "unread" },
    //replyText: {type: String, default: "", trim: true},
}, {timestamps: true});

module.exports = mongoose.model("Enquire", EnquireSchema)