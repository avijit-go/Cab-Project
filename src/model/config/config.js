const mongoose = require("mongoose");

const ConfigSchema= mongoose.Schema({
    _id: {type: mongoose.Schema.Types. ObjectId},
    distance_price: {type: Number, default: 100},
    max_extrapassener: {type: Number, default: 2},
    passerner_cost: {type: Number, default: 100},
    wallet_point: {type: Number, default: 1}
}, {timestamps: true});

module.exports = mongoose.model("config", ConfigSchema);