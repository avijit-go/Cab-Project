/** @format */

const mongoose = require("mongoose");
const createError = require("http-errors");
const Admin = require("../../model/admin/adminSchema");
const {
  hashPassword,
  generateAdminAccessToken,
  generateAdminRefreshToken,
  comparePassword,
  generateKey,
  uploadImage,
} = require("../../helper/helper");
const { sendVerificationEmail } = require("../../services/emailService");
// const { setValue, getValue, deleteKey } = require("../../database/redis");

class AdminController {
  constructor() {}

  /**
   * Register new admin
   * @body
   *  name: String - Name of the admin
   *  email: String - Email of the admin
   *  password: String - Password for the admin
   *  confirmPassword: String - Confirmation of the password
   *
   * @returns {Object} Returns JSON object with success message and admin details
   */
  async adminRegister(req, res, next) {
    try {
      // Validate user inputs
      if (
        !req.body.name.trim() ||
        !req.body.email.trim() ||
        !req.body.password.trim() ||
        !req.body.confirmPassword.trim()
      ) {
        throw createError.BadRequest({
          message: "Invalid registration format",
        });
      } else if (req.body.confirmPassword.trim() !== req.body.password.trim()) {
        throw createError.BadRequest({
          message: "Password & Confirm password did not match",
        });
      }
      // Check if admin with same email exists
      const isAdminExists = await Admin.findOne({
        $and: [{ email: req.body.email }],
      });
      if (isAdminExists) {
        throw createError.BadRequest({
          message: "Admin with same email id already exists",
        });
      }
      // Hash admin password
      const hash = await hashPassword(req.body.password);
      // Save admin data in database
      const admin = Admin({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        password: hash,
      });
      const adminData = await admin.save();
      // Generate access token
      const accessToken = await generateAdminAccessToken(adminData);
      // Generate refresh token
      const refreshToken = await generateAdminRefreshToken(adminData);
      return res.status(201).json({
        message: "Registration successfull",
        statusCode: 201,
        admin: adminData,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticate admin login
   * @body
   *  email: String - Email of the admin
   *  password: String - Password of the admin
   *
   * @returns {Object} Returns JSON object with success message, admin details, access token, and refresh token
   */
  async adminLogin(req, res, next) {
    try {
      // Validate user inputs
      if (!req.body.email.trim() || !req.body.password.trim()) {
        throw createError.BadRequest({ message: "Invalid login format" });
      }
      // Find admin by email
      const admin = await Admin.findOne({ $and: [{ email: req.body.email }] });
      if (!admin) {
        throw createError.BadRequest({
          message: "No admin found with this email address",
        });
      }
      // Compare passwords
      const isPasswordCorrect = await comparePassword(req.body.password, admin);
      if (!isPasswordCorrect) {
        throw createError.BadRequest({ message: "Invalid credential" });
      }
      // Generate access token
      const accessToken = await generateAdminAccessToken(admin);
      // Generate refresh token
      const refreshToken = await generateAdminRefreshToken(admin);
      return res.status(200).json({
        message: "Login successfull",
        statusCode:200,
        admin,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate the password recovery process
   * @body
   *  email: String - Email of the admin
   *
   * @returns {Object} Returns JSON object with success message after sending verification email
   */
  async forgetPassword(req, res, next) {
    try {
      // Validate user input
      if (!req.body.email.trim()) {
        throw createError.BadRequest({ message: "Invalid email format" });
      }
      // Find admin by email
      const admin = await Admin.findOne({ email: req.body.email });
      if (!admin) {
        throw createError.BadRequest({
          message: "No admin found with this email address",
        });
      }
      // generate 6 digit email OTP
      const generateOTP = Math.floor(Math.random() * 900000) + 100000;
      console.log("GET USER", generateOTP);
      // save the OTP in Redis with 2min TTL
      // await setValue(`${admin._id}`, generateOTP);
      // give resposnse back to user
      return res.status(200).json({
        message: "View email to verify your rmail address",
        statusCode: 200,
        generateOTP,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Middleware function to verify email OTP (One-Time Password) for admin.
   * @async
   * @function verifyEmailOTP
   * @memberof module:middlewares
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async verifyEmailOTP(req, res, next) {
    try {
      // Check if request body contains a valid email
      if (!req.body.email.trim()) {
        throw createError.BadRequest({ message: "Invalid request body" });
      }
      // Find admin by email in the database
      const admin = await Admin.findOne({ email: req.body.email });
      // Get OTP value from cache using admin's ID
      // const data = await getValue(admin._id);
      // Compare OTP value from cache with the one provided in the request body
      if (Number(data) !== Number(req.body.otp)) {
        throw createError.BadRequest({ message: "Invalid OTP" });
      }
      // Delete OTP key from cache
      // await deleteKey(admin._id);
      // Send success response if OTP is valid
      return res.status(200).json({ message: "Email has been verified", statusCode: 200 });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update the admin's password after verification
   * @body
   *  password: String - New password for the admin
   *  confirmPassword: String - Confirmation of the new password
   *
   * @returns {Object} Returns JSON object with success message after updating the password
   */
  async forgetUpdatePassword(req, res, next) {
    try {
      // Validate user input
      if (!req.body.password.trim() || !req.body.confirmPassword.trim()) {
        throw createError.BadRequest({ message: "Invalid format" });
      } else if (req.body.password.trim() !== req.body.confirmPassword.trim()) {
        throw createError.BadRequest({
          message: "Password & Confirm password did not match",
        });
      }
      // Hash the new password
      const hash = await hashPassword(req.body.password);
      // Update admin's password in the database
      // search admin by admin's email address
      const updateUserData = await Admin.findOneAndUpdate(
        { email: req.user.email },
        { $set: { password: hash } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Admin password has been recovered", statusCode: 200 });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller function to retrieve the profile of an admin.
   * @async
   * @function getAdminProfile
   * @memberof module:controllers/adminController
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getAdminProfile(req, res, next) {
    try {
      // Check if request parameter contains a valid admin ID
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Inavlid request parameter" });
      } else {
        // Find admin by ID in the database and exclude password field from the response
        const admin = await Admin.findById(req.params.id).select("-password");
        // Send admin profile data as response
        return res.status(200).json({statusCode: 200, data: admin});
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller function to update the profile image of an admin.
   * @async
   * @function updateProfileImage
   * @memberof module:controllers/adminController
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async updateProfileImage(req, res, next) {
    try {
      // Check if request parameter contains a valid admin ID
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid request parameter" });
      }
      // Check if request contains image file(s)
      else if (!req.files) {
        throw createError.BadRequest({ message: "No image file is present" });
      }
      // Upload image file and get its URL
      const imageUrl = await uploadImage(req.files.image);

      // Update admin's profile image URL in the database
      const updatedAdminData = await Admin.findByIdAndUpdate(
        req.params.id,
        {
          $set: { profile_img: imageUrl },
        },
        { new: true }
      );

      // Send success response with updated admin data
      return res.status(200).json({
        message: "Admin's profile image has been updated",
        statuscode: 200,
        admin: updatedAdminData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller function to retrieve a paginated list of admin users.
   * @async
   * @function getAdminList
   * @memberof module:controllers/adminController
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getAdminList(req, res, next) {
    try {
      // Extract page and limit parameters from request query, default to 1 and 10 respectively
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      // Retrieve admin list from database, excluding the password field, and apply pagination
      const adminList = await Admin.find({})
        .select("-password")
        .limit(limit)
        .skip(limit * (page - 1));
      // Send paginated admin list as response
      return res.status(200).json({statusCode: 200, data: adminList});
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller function to update the profile of an admin.
   * @async
   * @function updateAdminProfile
   * @memberof module:controllers/adminController
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async updateAdminProfile(req, res, next) {
    try {
      // Check if request parameter contains a valid admin ID
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid request parameter" });
      }
      // Check if request body contains valid email and name
      else if (!req.body.email || !req.body.name) {
        throw createError.BadRequest({ message: "Invalid request" });
      }
      // Update admin's profile data in the database
      const updateAdminData = await Admin.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      // Send success response with updated admin data
      return res.status(200).json({
        message: "Admin profile has been updated",
        statusCode: 200,
        admin: updateAdminData,
      });
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }

  /**
   * Controller function to update the password of an admin.
   * @async
   * @function updatePassword
   * @memberof module:controllers/adminController
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async updatePassword(req, res, next) {
    try {
      // Check if request parameter contains a valid admin ID
      if (!req.params.id) {
        throw createError.BadRequest({
          message: "Request parameter is not valid",
        });
      }
      // Check if old password is provided and not empty
      else if (!req.body.old_password.trim()) {
        throw createError.BadRequest({
          message: "Old password cannot be empty",
        });
      }
      // Check if new password is provided and not empty
      else if (!req.body.new_password.trim()) {
        throw createError.BadRequest({
          message: "New password cannot be empty",
        });
      }
      // Check if new password is different from old password
      else if (req.body.new_password === req.body.old_password) {
        throw createError.BadRequest({
          message: "New password & Old password cannot be same",
        });
      }
      // Find admin by ID in the database
      const admin = await Admin.findById(req.params.id);
      // Throw error if admin not found
      if (!admin) {
        throw createError.BadRequest({ message: "No user found" });
      }
      // Check if provided old password matches the stored password
      const isPasswordCorrect = await comparePassword(
        req.body.old_password,
        admin
      );
      // Throw error if old password is incorrect
      if (!isPasswordCorrect) {
        throw createError.BadRequest({ message: "Password is not correct" });
      }
      // Hash the new password
      const hash = await hashPassword(req.body.new_password);
      // Update admin's password in the database
      const updatedAdminData = await Admin.findByIdAndUpdate(
        req.params.id,
        { $set: { password: hash } },
        { new: true }
      );
      // Send success response
      return res
        .status(200)
        .json({ message: "Admin's password has been updated", statusCode: 200 });
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }

  /**
   * Controller function to search for admin users.
   * @async
   * @function searchAdmin
   * @memberof module:controllers/adminController
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async searchAdmin(req, res, next) {
    try {
      // Extract page number and limit from query parameters or use default values
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      // Construct the search term based on the provided search key
      const searchTerm = req.query.searchKey
        ? {
            $or: [{ name: { $regex: req.query.searchKey, $options: "i" } }],
          }
        : {};
      // Retrieve admins matching the search term, sorted by creation date in descending order,
      // and paginated based on the specified page and limit
      const admins = await Admin.find(searchTerm)
        .sort({ createdAt: -1 })
        .skip(limit * (page - 1))
        .limit(limit);
      // Send the array of admins as the response
      return res.status(200).json({statuscode: 200, data: admins});
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new AdminController();
