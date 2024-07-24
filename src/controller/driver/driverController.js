/** @format */

const mongoose = require("mongoose");
const Driver = require("../../model/drivers/driverSchema");
const createHttpError = require("http-errors");
const { uploadImage } = require("../../helper/helper");

class DriverController {
  constructor() {}

  async createNewDriver(req, res, next) {
    try {
      const { name, bloodgroup, email, phone, drivingNo } = req.body;
      // Upload profile image to cloudinary
      const imageUrl = await uploadImage(req.files.image);
      const driverObj = Driver({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        bloodGrp: bloodgroup,
        email: email,
        phone: phone,
        drivingLicense: drivingNo,
        profile_image: imageUrl,
      });
      const driverData = await driverObj.save();
      return res
        .status(201)
        .json({
          message: "New driver added",
          statusCode: 201,
          data: driverData,
        });
    } catch (error) {
      next(error);
    }
  }

  async getDrivers(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const drivers = await Driver.find()
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      return res.status(200).json({ statusCode: 200, data: drivers });
    } catch (error) {
      next(error);
    }
  }

  async searchDriver(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      // Construct the search term based on the provided search key
      const searchTerm = req.query.searchKey
        ? {
            $or: [
              { name: { $regex: req.query.searchKey, $options: "i" } },
              { email: { $regex: req.query.searchKey, $options: "i" } },
            ],
          }
        : {};
      // Retrieve cars matching the search term, sorted by creation date in descending order,
      // and paginated based on the specified page and limit
      const drivers = await Driver.find(searchTerm)
        .sort({ createdAt: -1 })
        .skip(limit * (page - 1))
        .limit(limit);
      // Send the array of cars as the response
      return res.status(200).json({ statusCode: 200, data: drivers });
    } catch (error) {
      next(error);
    }
  }

  async updateDriverDetails(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw createHttpError.BadRequest({ message: "Invalid driver id" });
      }
      const { name, bloodgroup, email, phone, drivingNo } = req.body;
      if (!name || !bloodgroup || !email || !phone || !drivingNo) {
        throw createHttpError.BadRequest({ message: "Invalid request" });
      }
      const updatedDriverData = await Driver.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res
        .status(200)
        .json({
          message: "Driver data successfully updated",
          statusCode: 200,
          data: updatedDriverData,
        });
    } catch (error) {
      next(error);
    }
  }

  async deleteDriverData(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw createHttpError.BadGateway({ message: "Driver id is missing" });
      }
      const deletedData = await Driver.findByIdAndDelete(id);
      return res
        .status(200)
        .json({
          message: "Driver data successfully deleted",
          statusCode: 200,
          data: deletedData,
        });
    } catch (error) {
      next(error);
    }
  }

  async getDriverById(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw createHttpError.BadRequest({
          message: "Driver id is not present",
        });
      } else {
        const data = await Driver.findById(id);
        return res.status(200).json({ statusCode: 200, data });
      }
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new DriverController();
