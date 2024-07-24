const mongoose = require("mongoose");

const ReviewsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    content: {type: String, trim: true, require: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    car: {type: mongoose.Schema.Types.ObjectId, ref: "Cars"},
    bookId: {type: mongoose.Schema.Types.ObjectId, ref: "Cars"},
    //rating: {type: Number,required: true, min: 1, max: 5}
}, {timestamps: true});

module.exports = mongoose.model("Review", ReviewsSchema)