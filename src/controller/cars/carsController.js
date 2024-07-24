/** @format */

const createError = require("http-errors");
const mongoose = require("mongoose");
const Cars = require("../../model/cars/carsSchema");
const { uploadImage } = require("../../helper/helper");
const Config = require("../../model/config/config");

class CarsController {
  constructor() {}

  /**
   * Create a new car entry in the system.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Object} - A JSON object indicating success or failure.
   */
  async createCarList(req, res, next) {
    try {
      // Check if required fields are present in the request body
      if (!req.body.name.trim() || !req.body.description.trim()) {
        // If name or description is missing or empty, throw BadRequest error
        throw createError.BadRequest({ message: "Invalid request" });
      }
      // Upload image and get image URL
      const imageURL = await uploadImage(req.files.image);
      console.log(imageURL);
      // Create a new car object using the Cars model
      const newCar = Cars({
        _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId for the car
        name: req.body.name, // Extract name from request body
        description: req.body.description, // Extract description from request body
        image: imageURL, // Set image URL obtained from upload
        seats: req.body.seats, // Extract seats from request body
        max_weight: req.body.max_weight, // Extract max weight from request body
        price: req.body.price, // Extract price from request body
      });
      // Save the new car entry to the database
      const carData = await newCar.save();
      // Return success response
      return res.status(201).json({
        message: "Car has been listed",
        statusCode: 200,
        data: carData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a paginated list of cars based on optional filter parameters.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Array} - An array of cars matching the filter criteria.
   */
  async getCarsList(req, res, next) {
    try {
      // Extract page number and limit from query parameters or use default values
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      let query = {};

      // Check if price parameter is provided
      if (req.query.price) {
        const price = parseInt(req.query.price);
        query.price = { $lte: price }; // Filter cars with price less than or equal to the provided value
      }

      // Check if seat parameter is provided
      if (req.query.seats) {
        const seats = parseInt(req.query.seats);
        query.seats = seats; // Filter cars with exact number of seats
      }

      // Retrieve cars matching the query, sorted by creation date in descending order,
      // and paginated based on the specified page and limit
      const cars = await Cars.find({ isBooked: false })
        .limit(limit)
        .skip(limit * (page - 1))
        .sort({ createAt: -1 });
      // Send the array of cars as the response
      return res.status(200).json({ statusCode: 200, data: cars });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search for cars based on provided search key, page number, and limit.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Array} - An array of cars matching the search criteria.
   */
  async searchCars(req, res, next) {
    try {
      console.log(req.query);
      // Extract page number and limit from query parameters or use default values
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      // Construct the search term based on the provided search key
      const searchTerm = req.query.searchKey
        ? {
            $or: [{ name: { $regex: req.query.searchKey, $options: "i" } }],
          }
        : {};
      // Retrieve cars matching the search term, sorted by creation date in descending order,
      // and paginated based on the specified page and limit
      const cars = await Cars.find(searchTerm)
        .sort({ createdAt: -1 })
        .skip(limit * (page - 1))
        .limit(limit);
      // Send the array of cars as the response
      return res.status(200).json({ statusCode: 200, data: cars });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a car by its unique identifier.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Object} - The car object matching the provided ID.
   */
  async getCarById(req, res, next) {
    try {
      // Validate request parameter
      if (!req.params.id) {
        // If the ID parameter is missing or empty, throw BadRequest error
        throw createError.BadRequest({
          message: "Request params id id not valid",
        });
      }
      // Find the car by its ID
      const car = await Cars.findById(req.params.id);
      return res.status(200).json({ statusCode: 200, data: car });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update details of a car by its unique identifier.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Object} - An object indicating success or failure of the update operation.
   */
  async updateCarDetails(req, res, next) {
    try {
      // Validate request parameter
      if (!req.params.id) {
        // If the ID parameter is missing or empty, throw BadRequest error
        throw createError.BadRequest({
          message: "Request params id id not valid",
        });
      }
      // Update car details by ID and request body
      const updateCarDetails = await Cars.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      // Send success response with updated car details
      return res.status(200).json({
        message: "Car details has been updated",
        statusCode: 200,
        data: updateCarDetails,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete details of a car by its unique identifier.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Object} - An object indicating success or failure of the delete operation.
   */
  async deleteCarDetails(req, res, next) {
    try {
      // Validate request parameter
      if (!req.params.id) {
        // If the ID parameter is missing or empty, throw BadRequest error
        throw createError.BadRequest({
          message: "Request params id id not valid",
        });
      }
      // Delete car details by ID
      const deletedCarDetails = await Cars.findByIdAndDelete(req.params.id);

      // Send success response with deleted car details
      return res.status(200).json({
        message: "Car details has been deleted",
        statusCode: 200,
        data: deletedCarDetails,
      });
    } catch (error) {
      next(error);
    }
  }

  async getListOfCars(req, res, next) {
    try {
      const cars = await Cars.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ statusCode: 200, data: cars });
    } catch (error) {
      next(error);
    }
  }

  async getCarsRecomendation(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const configData = await Config.find();
      console.log(configData)
      /* Here we used a static distance data */
      const distance = 3;
      const totalCost =
        distance * Number(configData[0].distance_price);
      const cars = await Cars.find({isBooked: false}).skip(limit*(page-1)).limit(limit);
      for(let i=0; i<cars.length; i++) {
        cars[i].price +=totalCost 
      }
      return res.status(200).json({statusCode: 200, data: cars})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new CarsController();
