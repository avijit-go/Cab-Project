/** @format */

const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
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
    password: {
      type: String,
      trim: true,
      required: [true, "User password is required"],
      minlength: [3, "Minimum 3 characters are required"],
    },
    profile_img: { type: String, default: "" },
    isAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Admin", adminSchema);
