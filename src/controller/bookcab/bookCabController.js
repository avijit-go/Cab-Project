/** @format */

const mongoose = require("mongoose");
const User = require("../../model/user/userSchema");
const BookCab = require("../../model/bookCab/bookCabSchema");
const Car = require("../../model/cars/carsSchema");
const Driver = require("../../model/drivers/driverSchema");
const createError = require("http-errors");
const { calculateTimeDiff } = require("../../helper/helper");
const UserWallet = require("../../model/userWallet/userWallet");
const {
  confirmationMail,
  sendCancelationMail,
} = require("../../services/emailService");
const AdminNotification = require("../../model/notification/adminNotification");
const Notification = require("../../model/notification/userNotification")
const Config = require("../../model/config/config");

class BookCabController {
  /**
   * Creates a new booking for a cab ride.
   * Validates the request body for required fields.
   * Calculates cab fare based on distance and number of extra passengers.
   * Updates wallet points for the user.
   * @param {Object} req - Express request object containing the request body with travel details.
   * @param {Object} res - Express response object to send the response.
   * @param {Function} next - Express next function to pass control to the next middleware.
   * @returns {Object} - JSON response indicating the success of the booking and the booking details.
   */
  async createBookingCab(req, res, next) {
    try {
      // Check if required fields are present in the request body
      if (
        !req.body.travelDate ||
        !req.body.pickupTime ||
        !req.body.pickupLocation
      ) {
        throw createError.BadRequest({ message: "Invalid format" });
      }
      const carData = await Car.findById(req.body.car);
      const configData = await Config.find();
      // check that userf does not select more than 2 extra passenger
      if(req.body.extraPassengers > configData[0].max_extrapassener) {
        throw createError.BadRequest({message: "Cannot have more than 2 passener"})
      }
      // calculate cab fare
      const distance = 2;
      const costPerKM = 100;
      const costPerExtraPessenger = 150;
      const totalCost =
        distance * Number(configData[0].distance_price) + Number(configData[0].passerner_cost) * req.body.extraPassengers + carData.price;

        const result = {
          travelDate: req.body.travelDate,
          pickupTime: req.body.pickupTime,
          pickupLocation: req.body.pickupLocation,
          dropLocation: req.body.dropLocation,
          primaryDropLocation: req.body.primaryDropLocation,
          carDetails: carData,
          totalCose: totalCost,
          distanceCost: distance * Number(configData[0].distance_price),
          extra_passenger_cost: Number(configData[0].passerner_cost) * req.body.extraPassengers,
          luggage: req.body.luggage,
          extraPassengers: req.body.extraPassengers
        };
        return res.status(201).json({
          message: "Your cab booking is estimate",
          statusCode: 201,
          bookingDetails: result
        });
    } catch (error) {
      next(error);
    }
  }

  async confirmBooking(req, res, next) {
    try {
      const dateStamp = new Date().getTime().toString();
      console.log(dateStamp)
      const book_id = "#" + dateStamp.slice(9, 13);
      const newBookingData = BookCab({
        _id: new mongoose.Types.ObjectId(),
        book_id,
        user: req.user._id,
        car: req.body.car,
        travelDate: req.body.travelDate,
        pickupTime: req.body.pickupTime,
        pickupLocation: req.body.pickupLocation,
        primaryDrop: req.body.primaryDropLocation,
        dropLocation: req.body.dropLocation,
        luggage: req.body.luggage,
        extraPassengers: req.body.extraPassengers,
        extraPassengerFare: req.body.extra_passenger_cost,
        totalDistance: 2, // this distance should be calculated
        distance_price: req.body.distanceCost,
        fare: req.body.totalCost
      });
      const isBooked = await Car.findById(req.body.car).select("isBooked");
      if (isBooked.isBooked) {
        return res.status(200).json({ message: "this car alredy booked" });
      }
      // Save the new booking data
      const bookingData = await newBookingData.save();
      // Populate user details in booking data
      await bookingData.populate({
        path: "user",
        select: "name email phone profile_img",
      });
      await bookingData.populate('car')

      await Car.findByIdAndUpdate(
        req.body.car,
        { $set: { isBooked: true } },
        { new: true }
      );
      // Send notification to admin after successfully booked the cab

      const notificationObj = AdminNotification({
        _id: new mongoose.Types.ObjectId(),
        title: "Booking",
        type: 1,
        from: req.user._id,
        booking:bookingData._id
      })

      const notificationData = await notificationObj.save();
      // Respond with success message and booking data
      return res.status(201).json({
        message: "Your cab booking is successfull",
        statusCode: 201,
        bookingData,
        notificationData
        
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a list of bookings associated with the logged-in user.
   * Accepts optional query parameters for pagination (page and limit).
   * Retrieves bookings from the database based on the user's ID.
   * Populates user details for each booking in the list.
   * Sorts the bookings based on creation date in descending order.
   * @param {Object} req - Express request object containing the query parameters for pagination.
   * @param {Object} res - Express response object to send the list of bookings.
   * @param {Function} next - Express next function to pass control to the next middleware.
   * @returns {Object} - JSON response containing the list of bookings associated with the user.
   */
  async getUserBookingList(req, res, next) {
    try {
      // Extract page and limit parameters from the request query, or use defaults
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const sortStatus = req.query.sortStatus || "all";
      if (sortStatus === "all") {
        // Retrieve list of bookings for the logged-in user with pagination
        const list = await BookCab.find({ user: req.user._id })
          .limit(limit)
          .skip((page - 1) * limit)
          .populate({
            path: "user",
            select: "name email phone profile_img",
          }).populate("car").populate("driver")
          .sort({ createdAt: -1 }); // Sort bookings based on creation date in descending order
        // Respond with the list of bookings
        return res.status(200).json(list);
      } else if (sortStatus === "active") {
        // Retrieve list of bookings for the logged-in user with pagination
        const list = await BookCab.find({
          $and: [{ user: req.user._id }, { status: "active" }],
        })
          .limit(limit)
          .skip((page - 1) * limit)
          .populate({
            path: "user",
            select: "name email phone profile_img",
          }).populate("car").populate("driver")
          .sort({ createdAt: -1 }); // Sort bookings based on creation date in descending order
        // Respond with the list of bookings
        return res.status(200).json({ statusCode: 200, data: list });
      } else {
        // Retrieve list of bookings for the logged-in user with pagination
        const list = await BookCab.find({
          $and: [{ user: req.user._id }, { status: "inactive" }],
        })
          .limit(limit)
          .skip((page - 1) * limit)
          .populate({
            path: "user",
            select: "name email phone profile_img",
          }).populate("car").populate("driver")
          .sort({ createdAt: -1 }); // Sort bookings based on creation date in descending order
        // Respond with the list of bookings
        return res.status(200).json({ statusCode: 200, data: list });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves details of a single booking based on the provided booking ID.
   * Validates the request parameter to ensure the presence of the booking ID.
   * Retrieves booking details from the database using the provided ID.
   * Populates user details associated with the booking.
   * @param {Object} req - Express request object containing the booking ID in the parameters.
   * @param {Object} res - Express response object to send the booking details.
   * @param {Function} next - Express next function to pass control to the next middleware.
   * @returns {Object} - JSON response containing the details of the single booking.
   */
  async getSingleBookingDetails(req, res, next) {
    try {
      // Validate the presence of the booking ID in the request parameters
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid request parameter" });
      }
      // Retrieve details of the single booking based on the provided ID
      const bookingData = await BookCab.findById(req.params.id)
        .populate({
          path: "user",
          select: "profile_img name phone email",
        })
        .populate("car")
        .populate({
          path: "driver",
          select: "profile_image name phone email drivingLicense",
        });
      // Respond with the booking details
      return res.status(200).json({ statusCode: 200, data: bookingData });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates details of a booking based on the provided booking ID.
   * Validates the request parameter to ensure the presence of the booking ID.
   * Validates the request body for required fields.
   * Retrieves booking details from the database using the provided ID.
   * Checks if the booking update is allowed based on a time difference condition.
   * Updates the booking details if the condition is met.
   * @param {Object} req - Express request object containing the booking ID in the parameters and updated details in the body.
   * @param {Object} res - Express response object to send the updated booking details.
   * @param {Function} next - Express next function to pass control to the next middleware.
   * @returns {Object} - JSON response indicating the success of the update and the updated booking details.
   */
  async updateBookingDetails(req, res, next) {
    try {
      // Validate the presence of the booking ID in the request parameters
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid request parameter" });
      }
      // Retrieve details of the booking based on the provided ID
      const bookingData = await BookCab.findById(req.params.id);
      const result = await calculateTimeDiff(bookingData);
      if (!result) {
        throw createError.BadRequest({
          message: "you cannot change booking details",
        });
      }
      const updatedData = await BookCab.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      return res.status(200).json({ statusCode: 200, data: updatedData });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a list of all bookings with optional pagination.
   * Accepts optional query parameters for pagination (page and limit).
   * Retrieves bookings from the database.
   * Populates user details for each booking in the list.
   * Sorts the bookings based on creation date in descending order.
   * @param {Object} req - Express request object containing the query parameters for pagination.
   * @param {Object} res - Express response object to send the list of bookings.
   * @param {Function} next - Express next function to pass control to the next middleware.
   * @returns {Object} - JSON response containing the list of bookings.
   */
  async getBookingList(req, res, next) {
    try {
      // Extract page and limit parameters from the request query, or use defaults
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const sortStatus = req.query.sortStatus || "all";

      if (sortStatus === "all") {
        // Retrieve list of bookings with pagination
        const list = await BookCab.find({})
          .limit(limit)
          .skip((page - 1) * limit)
          .populate({
            path: "user",
            select: "name email phone profile_img",
          }).populate("car").populate("driver")
          .sort({ createdAt: -1 }); // Sort bookings based on creation date in descending order
        // Respond with the list of bookings
        return res.status(200).json({ statusCode: 200, data: list });
      } else if (sortStatus === "active") {
        // Retrieve list of bookings with pagination
        const list = await BookCab.find({ status: "active" })
          .limit(limit)
          .skip((page - 1) * limit)
          .populate({
            path: "user",
            select: "name email phone profile_img",
          }).populate("car").populate("driver")
          .sort({ createdAt: -1 }); // Sort bookings based on creation date in descending order
        // Respond with the list of bookings
        return res.status(200).json({ statusCode: 200, data: list });
      } else {
        // Retrieve list of bookings with pagination
        const list = await BookCab.find({ status: "inactive" })
          .limit(limit)
          .skip((page - 1) * limit)
          .populate({
            path: "user",
            select: "name email phone profile_img",
          }).populate("car").populate("driver")
          .sort({ createdAt: -1 }); // Sort bookings based on creation date in descending order
        // Respond with the list of bookings
        return res.status(200).json({ statusCode: 200, data: list });
      }
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      // Validate the presence of the booking ID in the request parameters
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid request parameter" });
      }
      
      // Retrieve details of the booking based on the provided ID
      const bookingData = await BookCab.findById(req.params.id);
      // Calculate time difference to check if the booking update is allowed
      const timeDifference = await calculateTimeDiff(bookingData);

      // if timeDifference is lesser than the 24 hour then user can't update booking status
      // Otherwise user can update the booking status
      if (!timeDifference) {
        await BookCab.findByIdAndUpdate(
          req.params.id,
          { $set: { status: "request" } },
          { new: true }
        );
        /**
         * Notification System
         */
        const notificationObj = AdminNotification({
          _id: new mongoose.Types.ObjectId(),
          title: "Cancel booking request",
          type: 2,
          from :req.user._id,
          booking:req.params.id
        });
        const notificationData = await notificationObj.save();
        return res.status(200).json({
          message: "Connect to admin to cancel your booking",
          statusCode: 200,
          notification: notificationData
        });
      }
      // update booking status to inactive
      await BookCab.findByIdAndUpdate(
        req.params.id,
        { $set: { status: "inactive" } },
        { new: true }
      );
      // also update the car's status to false i.e car is available for new booking
      await Car.findByIdAndUpdate(
        bookingData.car,
        { $set: { isBooked: false } },
        { new: true }
      );
      await Driver.findByIdAndUpdate(
        bookingData.driver,
        { $set: { status: false } },
        { new: true }
      );
      return res.status(200).json({
        message: "Your booking successfully canceled",
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  async claimToken(req, res, next) {
    console.log("********")
    try {
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid request" });
      }
      const bookingDetails = await BookCab.findById(req.params.id);
      if(!bookingDetails) {
        throw createError.BadRequest({message: "No booking details found"})
      }
      await BookCab.findByIdAndUpdate(req.params.id, {$set: {status: "completed"}}, {new: true})
      const walletPoint =
        bookingDetails.distance * Number(process.env.WALLET_POINT);
      // updating the car booking status from true to false
      // if the booking status is false that means other users can booked that car
      // if the booking status is true then users cannot booked the same car util present booking is completed or canceled..
      const updateCarStatus = await Car.findByIdAndUpdate(
        bookingDetails.car,
        { $set: { isBooked: false } },
        { new: true }
      );
      console.log("CAR:::", updateCarStatus)

      // if the ride is completed then update the wallet document with wallet token
      const walletData = UserWallet({
        _id: new mongoose.Types.ObjectId(),
        user: req.user._id,
        amount: walletPoint,
        booking: req.params.id,
      });
      await walletData.save();
      await Driver.findByIdAndUpdate(
        bookingDetails.driver,
        { $set: { status: false } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Successfully claimed token", statusCode: 200 });
    } catch (error) {
      next(error);
    }
  }

  async acceptingBooking(req, res, next) {
    try {
      const id = req.params.id;
      const driverId = req.body.driverId;
      if (!id) {
        throw createError.BadRequest({ message: "Invalid booking id" });
      } else if (!driverId) {
        throw createError.BadRequest({ message: "Driver id not found" });
      }
      // update the driver status with true
      await Driver.findByIdAndUpdate(
        driverId,
        { $set: { status: true } },
        { new: true }
      );
      const bookingdata = await BookCab.findByIdAndUpdate(
        id,
        { $set: { driver: driverId, isAccept: true, status: 'active' } },
        { new: true }
      );
      const data = await BookCab.findById(id)
        .populate({ path: "user", select: "name email phone profile_img" })
        .populate({ path: "driver", select: "name phone email profile_image" })
        .populate({ path: "car", select: "name image price type description" });
      const result = await confirmationMail(data);

      /**
       * Send notification from ADMIN after successfully accept the booking request
       */
      const notificationObj = Notification({
        _id: new mongoose.Types.ObjectId(),
        title: "Accept booking",
        type: 1, 
        to: bookingdata.user,
        booking: bookingdata._id
      })
      const notificationData = await notificationObj.save();
      return res.status(200).json({
        message: "Successuly booked",
        statusCode: 200,
        bookingData: data,
        notification: notificationData
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelRideFromAdmin(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw createError.BadRequest({ message: "No booking id found" });
      }
      const bookingData = await BookCab.findById(id);
      // booking status updated
      const bookingUpdate = await BookCab.findByIdAndUpdate(
        id,
        { $set: { status: "cancel" } },
        { new: true }
      );
      // update in driver status
      const updateDriverUpdate = await Driver.findByIdAndUpdate(
        bookingData.driver,
        { $set: { status: false } },
        { new: true }
      );
      const updatedCar = await Car.findByIdAndUpdate(
        bookingData.car,
        { $set: { isBooked: false } },
        { new: true }
      );
      const user = await User.findById(bookingData.user);
      /**
       * Send Notification to user after ADMIN successfully cqancel user ride
       */
      /**
       * Send notification from ADMIN after successfully accept the booking request
       */
      const notificationObj = Notification({
        _id: new mongoose.Types.ObjectId(),
        title: "Cancel booking",
        type: 2, 
        to: bookingData.user,
        booking: bookingData._id
      })
      const notificationData = await notificationObj.save();
      return res
        .status(200)
        .json({ message: "successfully canceled", statusCode: 200, notification: notificationData });
    } catch (error) {
      next(error);
    }
  }

  async getAllBookingList(req, res, next) {
    try {
      const data = await BookCab.find({})
        .populate({ path: "user", select: "-password" })
        .populate("car").populate("driver");
      return res.status(200).json({ statusCode: 200, data });
    } catch (error) {
      next(error);
    }
  }

  async cancelBookingList(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const result = await BookCab.find({status: 'request'}).limit(limit).skip(limit * (page-1));
      return res.status(200).json({statusCode: 200, data: result})
    } catch (error) {
      next(error)
    }
  }

  async getPendinCarList(req, res, next) {
    try {
      const cars = await BookCab.find({status: "pending"}).populate("user").populate("car")
      return res.status(200).json({statuscode: 200, cars})
    } catch (error) {
      next(error)
    }
  }

  async getActiveCarList(req, res, next) {
    try {
      const cars = await BookCab.find({status: "active"}).populate("user").populate("car").populate("driver")
      return res.status(200).json({statuscode: 200, cars})
    } catch (error) {
      next(error)
    }
  }

  async getInactiveCarList(req, res, next) {
    try {
      const cars = await BookCab.find({status: "inactive"}).populate("user").populate("car").populate("driver")
      return res.status(200).json({statuscode: 200, cars})
    } catch (error) {
      next(error)
    }
  }

  async getCancelCarList(req, res, next) {
    try {
      const cars = await BookCab.find({status: "cancel"}).populate("user").populate("car").populate("driver")
      return res.status(200).json({statuscode: 200, cars})
    } catch (error) {
      next(error)
    }
  }
}
module.exports = new BookCabController();
