const mongoose = require("mongoose");

const NotificationTemplate = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    title: {type: String, required: true, default: ""},
    description: {type: String, required: true, default: ""}
}, {timestamps: true});

module.exports = mongoose.model('Template', NotificationTemplate)