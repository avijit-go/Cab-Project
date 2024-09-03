/** @format */

const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: {
      type: String,
      trim: true,
      required: [true, "User name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "User email is required"],
      unique: true,
    },
    address: {
      city: { type: String },
      pin: { type: String },
      location: { type: String },
    },
    password: {
      type: String,
      trim: true,
    },
    phone: {
      type: Number,
      trim: true,
    },
    email_otp: { type: Number, default: 0 },
    email_verify: { type: Boolean, default: false },
    phone_otp: { type: Number, default: 0 },
    phone_verify: { type: Boolean, default: false },
    profile_img: { type: String, default: "" },
    points: { type: Number, default: 0 },
    walletPoints: { type: Number, default: 0 }, // User's wallet points
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDelete: { type: Boolean, default: false },
    forgetPass_otp: { type: Number, default: 0 },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);
