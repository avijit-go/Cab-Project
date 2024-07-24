const mongoose = require("mongoose");

const Contentschema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    slug: {type: String, default: "about"},
    title: {type: String, default: ""},
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    description: {type: String, default: ""},
}, {timestamps: true});

module.exports = mongoose.model("Content", Contentschema)