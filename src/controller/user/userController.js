/** @format */

const mongoose = require("mongoose");
const User = require("../../model/user/userSchema");
const UserWallet = require("../../model/userWallet/userWallet");
const BookCab = require("../../model/bookCab/bookCabSchema")
const createError = require("http-errors");
const {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  comparePassword,
  uploadImage,
  generateKey,
} = require("../../helper/helper");
const {
  sendEmailOtp,
  sendVerificationEmail,
} = require("../../services/emailService");

class UserController {
  constructor() {}

  /**
   * Register new user
   * @body
   *  name: string - User's name
   *  email: string - User's email address
   *  password: string - User's password
   *  confirmPassword: string - Confirmation of user's password
   *  city: string - User's city
   *  pin: string - User's PIN code
   *  location: string - User's location
   *  phone: number - User's phone number
   *
   * @returns {Object} Returns JSON object with message, user data, access token, and refresh token
   */
  async userRegister(req, res, next) {
    try {
      // Verify all user inputs
      if (
        !req.body.name.trim() ||
        !req.body.email.trim() ||
        !req.body.password.trim() ||
        !req.body.confirmPassword.trim() ||
        !req.body.location.trim() ||
        !req.body.city.trim() ||
        !req.body.pin.trim() ||
        !req.body.phone
      ) {
        throw createError.BadRequest({ message: "Invalid user register" });
      }
      // Check if password & confirm password match
      else if (req.body.password !== req.body.confirmPassword) {
        throw createError.BadRequest({ message: "Password did not match" });
      } else {
        // Check if user with the same email or phone number already exists
        const isUserExists = await User.findOne({
          $or: [{ phone: req.body.phone }, { email: req.body.email }],
        });
        if (isUserExists) {
          // If user already exists with the same email address
          if (isUserExists.email === req.body.email) {
            throw createError.BadRequest({ message: "Email already exists" });
          }
          // If user already exists with the same phone number
          else if (isUserExists.phone === Number(req.body.phone)) {
            throw createError.BadRequest({
              message: "Phone number already exists",
            });
          }
        } else {
          // Hash the password
          const hash = await hashPassword(req.body.password);
          // Create user data object
          const userData = User({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            password: hash,
            phone: req.body.phone,
            address: {
              city: req.body.city,
              pin: req.body.pin,
              location: req.body.location,
            },
          });
          // Save user data in the database
          const user = await userData.save();
          // Generate access token
          const accessToken = await generateAccessToken(user);
          // Generate refresh token
          const refreshToken = await generateRefreshToken(user);
          // Generate OTP for user
          const generateOTP = Math.floor(100000 + Math.random() * 900000);
          // Update user database with current email OTP
          const updateUser = await User.findByIdAndUpdate(
            user._id,
            { $set: { email_otp: generateOTP } },
            { new: true }
          );
          // Send email verification OTP
          //await sendEmailOtp(user.email, generateOTP);
          return res.status(201).json({
            message: "User registration successful",
            statusCode: 200,
            user,
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    } catch (error) {
      const logData = {
        controller: "User register",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "userRegister",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Login user
   * @body
   *  email: string - User's email address
   *  password: string - User's password
   *
   * @returns {Object} Returns JSON object with message, user data, access token, and refresh token
   */
  async loginUser(req, res, next) {
    try {
      // Verify email and password inputs
      if (!req.body.email.trim() || !req.body.password.trim()) {
        throw createError.BadRequest({ message: "Invalid login credentials" });
      } else {
        // Find user by email
        const isUserExists = await User.findOne({ email: req.body.email });
        if (!isUserExists) {
          // If no user found with this email address
          throw createError.BadRequest({
            message: "No user found with this email address",
          });
        } else {
          // Compare user password
          const isPasswordCorrect = await comparePassword(
            req.body.password,
            isUserExists
          );
          if (!isPasswordCorrect) {
            // If password is incorrect
            throw createError.BadRequest({ message: "Invalid password" });
          } else {
            // Generate access token
            const accessToken = await generateAccessToken(isUserExists);
            // Generate refresh token
            const refreshToken = await generateRefreshToken(isUserExists);
            return res.status(200).json({
              message: "User login successful",
              statusCode: 200,
              user: isUserExists,
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }
    } catch (error) {
      const logData = {
        controller: "User login",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "loginUser",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next({ message: error.message });
    }
  }

  /**
   * Update user profile image
   * @body
   *  image: File - Profile image to be uploaded
   *
   * @returns {Object} Returns JSON object with message and updated user data
   */
  async updateProfileImage(req, res, next) {
    try {
      // Upload profile image to cloudinary
      const imageUrl = await uploadImage(req.files.image);
      // Update user profile image URL in database
      const updateUserData = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { profile_img: imageUrl } },
        { new: true }
      );
      return res.status(200).json({
        message: "Profile image has been updated",
        statusCode: 200,
        user: updateUserData,
      });
    } catch (error) {
      const logData = {
        controller: "User profile image",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "updateProfileImage",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Update user profile name
   * @body
   *  name: String - New name for the user profile
   *
   * @returns {Object} Returns JSON object with message and updated user data
   */
  async updateProfileName(req, res, next) {
    try {
      if (!req.body.name.trim()) {
        throw createError.BadRequest({ message: "User name is not valid" });
      } else {
        // Update user profile name in database
        const updateUserData = await User.findByIdAndUpdate(
          req.user._id,
          { $set: { name: req.body.name } },
          { new: true }
        );
        return res.status(200).json({
          message: "Profile name has been updated",
          statusCode: 200,
          user: updateUserData,
        });
      }
    } catch (error) {
      const logData = {
        controller: "User profile name",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "updateProfileName",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Update user profile email
   * @body
   *  email: String - New email for the user profile
   *
   * @returns {Object} Returns JSON object with message and updated user data
   */
  async updateProfileEmail(req, res, next) {
    try {
      if (!req.body.email.trim()) {
        throw createError.BadRequest({ message: "User email is not valid" });
      } else {
        // Check if the new email is already taken
        const isEmailExists = await User.findOne({ email: req.body.email });
        if (isEmailExists) {
          throw createError.BadRequest({
            message: "Email has already been taken",
          });
        }
        // Update user profile email in database
        const updateUserData = await User.findByIdAndUpdate(
          req.user._id,
          { $set: { email: req.body.email } },
          { new: true }
        );
        return res.status(200).json({
          message: "Profile email has been updated",
          statusCode: 200,
          user: updateUserData,
        });
      }
    } catch (error) {
      const logData = {
        controller: "User profile email",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "updateProfileEmail",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Update user profile address
   * @body
   *  city: String - City name for the user's address
   *  pin: String - PIN code for the user's address
   *  location: String - Location description for the user's address
   *
   * @returns {Object} Returns JSON object with message and updated user data
   */
  async updateProfileAddress(req, res, next) {
    try {
      if (!req.body) {
        throw createError.BadRequest({ message: "Invalid data format" });
      }
      // Update user profile address in database
      const updateUserData = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { address: req.body } },
        { new: true }
      );
      return res.status(200).json({
        message: "Profile address has been updated",
        statusCode: 200,
        user: updateUserData,
      });
    } catch (error) {
      const logData = {
        controller: "User profile address",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "updateProfileAddress",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Update user profile password
   * @body
   *  oldPassword: String - Current password of the user's profile
   *  newPassword: String - New password for the user's profile
   *
   * @returns {Object} Returns JSON object with message and updated user data
   */
  async updateProfilePassword(req, res, next) {
    try {
      if (!req.body.oldPassword.trim() || !req.body.newPassword.trim()) {
        throw createError.BadRequest({ message: "New password is not valid" });
      }
      // Find user by ID
      const user = await User.findById(req.user._id);
      // Compare old password with user's current password
      const isPasswordCorrect = await comparePassword(
        req.body.oldPassword,
        user
      );
      if (!isPasswordCorrect) {
        throw createError.BadRequest({
          message: "Old profile password is not correct",
        });
      }
      // Hash the new password
      const hash = await hashPassword(req.body.newPassword);
      // Update user's password in database
      const updateUserData = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { password: hash } },
        { new: true }
      );
      return res.status(200).json({
        message: "Profile password has been updated",
        statusCode: 200,
        user: updateUserData,
      });
    } catch (error) {
      const logData = {
        controller: "User profile password",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "updateProfilePassword",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Verify user's email with OTP
   * @body
   *  emailOTP: String - OTP sent to user's email for verification
   *
   * @returns {Object} Returns JSON object with message and updated user data
   */
  async verifyEmail(req, res, next) {
    try {
      if (!req.body.emailOTP.trim()) {
        throw createError.BadRequest({ message: "Invalid OTP format" });
      }
      // Convert emailOTP to number
      const emailOTP = Number(req.body.emailOTP);
      // Find user by ID
      const user = await User.findById(req.user._id);
      // Check if email OTP matches
      if (user.email_otp !== emailOTP) {
        throw createError.BadRequest({
          message: "Email verification code is not correct",
        });
      }
      // Update user's email verification status in database
      const updateUserData = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { email_verify: true } },
        { new: true }
      );
      return res.status(200).json({
        message: "User email has been verified",
        statusCode: 200,
        user: updateUserData,
      });
    } catch (error) {
      const logData = {
        controller: "User profile address",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "updateProfileAddress",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Send verification email for password reset
   * @body
   *  email: String - User's email address for password reset
   *
   * @returns {Object} Returns JSON object with success message
   */
  async forgetPassword(req, res, next) {
    try {
      console.log("*****************");
      if (!req.body.email.trim()) {
        throw createError.BadRequest({ message: "Invalid email format" });
      }
      // Find user by email
      const user = await User.findOne({ email: req.body.email }).select(
        "-password"
      );
      if (!user) {
        throw createError.BadRequest({
          message: "No user found with this email address",
        });
      } else {
        // // Generate key for changing password
        // const key = await generateKey(req.body.email);
        // // Send verification email with key
        // const sendEmail = await sendVerificationEmail(req.body.email, key);
        // return res.status(200).json({
        //   message: "Verification mail has been sent",
        //   statusCode: 200,
        // });
        /**
         * NEW CODE
         */
        // Generate OTP for user
        const generateOTP = Math.floor(100000 + Math.random() * 900000);
        const token = await generateAccessToken(user);
        await User.findByIdAndUpdate(
          user._id,
          { $set: { forgetPass_otp: generateOTP } },
          { new: true }
        );
        return res.status(200).json({
          message: "OTP has been send",
          accessToken: token,
          OTP: generateOTP,
          statusCode: 200,
        });
      }
    } catch (error) {
      const logData = {
        controller: "User profile password",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "forgetPassword",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Update user password after password reset
   * @query
   *  key: String - Verification key for password reset
   * @body
   *  password: String - New password for the user
   *  confirmPassword: String - Confirmation of the new password
   *
   * @returns {Object} Returns JSON object with success message
   */
  async forgetUpdatePassword(req, res, next) {
    try {
      if (!req.body.password.trim() || !req.body.confirmPassword.trim()) {
        throw createError.BadRequest({ message: "Invalid format" });
      } else if (req.body.password.trim() !== req.body.confirmPassword.trim()) {
        throw createError.BadRequest({
          message: "Password & Confirm password did not match",
        });
      }
      const user = await User.findById(req.user._id).select("forgetPass_otp");
      if (Number(user.forgetPass_otp) !== Number(req.body.OTP)) {
        throw createError.BadRequest({ message: "OTP is not correct" });
      }
      // Hash the new password
      const hash = await hashPassword(req.body.password);
      // Update user's password in the database
      const updateUserData = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { password: hash, forgetPass_otp: 0 } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "User password has been recovered", statusCode: 200 });
    } catch (error) {
      const logData = {
        controller: "User profile update password",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "forgetUpdatePassword",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Fetches the list of users from the database.
   * Excludes the password field from the returned documents.
   * Sorts the documents in descending order based on the 'createdAt' property.
   * @returns {Array} - List of users sorted by creation date.
   */
  async getUsersList(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      // Fetch list of users excluding password field and sorted by creation date
      const users = await User.find({})
        .select("-password")
        .limit(limit)
        .skip((page - 1) * limit) // Exclude password field
        .sort({ createdAt: -1 }); // Sort by 'createdAt' property in descending order
      return res.status(200).json(users);
    } catch (error) {
      const logData = {
        controller: "GET user liet",
        controller_name: "User Controller",
        email: req.user?.email || "", // Assuming email is available in req.user
        ip: req.ip,
        level: "error",
        log_type: "ERROR",
        message: {
          body_data: req.body,
          error:
            err.message ||
            "Some error occurred while retrieving tutorials.",
          //user_id: req.user?.id || "", // Assuming user ID is available in req.user
        },
        method_name: "getUsersList",
        //name: req.user?.name, // Assuming name is available in req.user
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || "", // Assuming user ID is available in req.user
      };
      logger.error(logData);
      next(error);
    }
  }

  /**
   * Fetches a user by their unique ID from the database.
   * Excludes the password field from the returned user document.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Object} - The user document matching the provided ID.
   */
  async getUserById(req, res, next) {
    try {
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid request parameter" });
      } else {
        // Find user by ID and exclude password field
        const user = await User.findById(req.params.id).select("-password");
        return res.status(200).json({ satatusCode: 200, data: user });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search for users based on provided search key, page number, and limit.
   * @queryParam {string} searchKey - The search key to filter users by name.
   * @queryParam {number} page - The page number for paginated results (default: 1).
   * @queryParam {number} limit - The maximum number of users per page (default: 10).
   * @returns {Array} - An array of users matching the search criteria.
   */
  async searchUser(req, res, next) {
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

      // Retrieve users matching the search term, sorted by creation date in descending order,
      // and paginated based on the specified page and limit
      const users = await User.find(searchTerm)
        .sort({ createdAt: -1 })
        .skip(limit * (page - 1))
        .limit(limit);
      // Send the array of users as the response
      return res.status(200).json({ statusCode: 200, data: users });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a user by their ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @param {string} req.params.id - The ID of the user to be deleted.
   * @returns {Object} - A JSON object containing a success message and the deleted user's information.
   */
  async deleteUserById(req, res, next) {
    try {
      // Check if the request parameter contains a valid user ID
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid request parameter" });
      }
      // Find the user by their ID and delete them from the database
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { status: req.body.status } },
        { new: true }
      ).select("-password");
      // Return a success message along with the deleted user's information
      return res.status(200).json({
        message: `User with ${req.params.id} has been deleted`,
        statusCode: 200,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user status.
   * @body statusCode: string - Status code for user status. It might be active or inactive
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @param {string} req.params.id - The ID of the user to be updated.
   * @returns {Object} - A JSON object containing a success message and the updated user's information.
   */
  async updateProfileStatus(req, res, next) {
    try {
      // Check if request parameter 'id' is defined
      if (!req.params.id) {
        throw createError.BadRequest({
          message: "Request parameter is not defined",
        });
      }
      // Check if request body contains 'statusCode'
      else if (!req.body.statusCode.trim()) {
        throw createError.BadRequest({
          message: "Invalid request body",
        });
      } else {
        // Update user's status in the database
        const updatedUserData = await User.findByIdAndUpdate(
          req.params.id, // User ID to update
          { $set: { status: req.body.statusCode.toLowerCase() } }, // Update status with value from request body
          { new: true } // Return updated document
        );
        // Send success response with updated user data
        return res.status(200).json({
          message: "Admin updated user account status",
          statusCode: 200,
          user: updatedUserData,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteProfile(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest({ message: "Invalid user id provided" });
      }
      const deletedUserData = await User.findByIdAndDelete(id);
      await UserWallet.deleteMany({ user: id });
      return res.status(200).json({
        message: "User successfully deleted account.",
        statusCode: 200,
      });
    } catch (erorr) {
      next(error);
    }
  }

  async deleteProfileStatus(req, res, next) {
    try {
      if (!req.params.id) {
        throw createError.BadRequest({ message: "Invalid ID" });
      }
      const body = req.body.isDelete;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { isDelete: body } },
        { new: true }
      );
      return res.status(200).json({
        message: "User successfully deleted profile.",
        statusCode: 200,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserProfile(req, res, next) {
    try {
      if (!req.user._id) {
        throw createError.BadRequest({ message: "Invalid user ID" });
      }
      const updatedUserData = await User.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true }
      );
      return res.status(200).json({
        message: "User profile has been successfully updated",
        statusCode: 200,
        data: updatedUserData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWalletDetails(req, res, next) {
    try {
      const data = await UserWallet.find({user: req.user._id});
      return res.status(200).json({statusCode: 200, data})
    }
    catch(error) {
      next(error)
    }
  }

  async getProfileBookingHistory(req, res, next) {
    try {
      if(!req.params.id) {
        throw createError.BadRequest({message: "Profile id not found"});
      }
      const bookingData = await BookCab.find({user: req.params.id})
      .populate({ path: "car", select: "name description image" })
      .populate({ path: "user", select: "name email phone" })
      .populate({ path: "driver", select: "name email phone profile_image" })
      .sort({createdAt: -1})
      
      return res.status(200).json({message: "Get profile booking history", status: 200, history: bookingData})
    } catch (error) {
      next(error)
    }
  }
}
module.exports = new UserController();
