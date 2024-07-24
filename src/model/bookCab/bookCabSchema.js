/** @format */

const mongoose = require("mongoose");

const BookCabSchema = mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    book_id: {type: String},
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user who made the booking
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Cars" },
    travelDate: { type: String, required: true },
    pickupTime: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    primaryDrop: {type: String, trim: true}, // this is primary drop loaction
    dropLocation: { type: [String], default: [] },
    luggage: { type: Number, default: 0 },
    extraPassengers: { type: Number, default: 0, max: 2 },
    extraPassengerFare: { type: Number, default: 0 }, // Extra fare for additional passengers
    totalDistance: {type: String},
    distance_price: {type: String},
    fare: { type: Number, required: true }, // Fare calculated based on total distance
    bookingDetails: { type: String }, // Additional booking details
    // walletPoints: { type: Number, default: 0 }, // User's wallet points
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    }, // Payment status
    paymentMethod: { type: String }, // Payment method used
    paymentDate: { type: Date }, // Date of payment
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "cancel", "completed"],
      default: "active",
    },
    distance: { type: Number, default: 0 },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    isAccept: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("BookCab", BookCabSchema);

/**
 * Status Details:
 * 1. Active: When user booked a cab.
 * 2. Inactive: When user cancel booking. (before 24 hours),
 * 3. Pendeing: When user requested ADMIN to cancel user's booking.
 * 4. Cancel: When ADMIN cancel user's booking.
 * 5. Completed: After successfully completed the ride
 */