const mongoose = require("mongoose");

const UserWallet = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    amount: {type: Number, default: 0},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    booking: {type: mongoose.Schema.Types.ObjectId, ref: "BookCab"}
}, {timestamps: true});

module.exports = new mongoose.model("Wallet", UserWallet);