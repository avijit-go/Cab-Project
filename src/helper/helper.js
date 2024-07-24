/** @format */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

class Helper {
  constructor() {}

  async hashPassword(password) {
    try {
      const hashPass = await bcrypt.hash(password, 10);
      return hashPass;
    } catch (error) {
      throw createError.BadRequest(error.message);
    }
  }

  async comparePassword(password, user) {
    try {
      const result = await bcrypt.compare(password, user.password);
      return result;
    } catch (error) {
      throw createError.BadRequest(error.message);
    }
  }

  async generateAccessToken(body) {
    try {
      const token = await jwt.sign(
        {
          _id: body._id,
          email: body.email,
          name: body.name,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "1d" }
      );
      return token;
    } catch (error) {
      throw createError.BadRequest(error.message);
    }
  }

  async generateRefreshToken(body) {
    try {
      const token = await jwt.sign(
        {
          _id: body._id,
          email: body.email,
          name: body.name,
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: "90d" }
      );
      return token;
    } catch (error) {
      throw createError.BadRequest(error.message);
    }
  }

  async uploadImage(image) {
    try {
      const result = await cloudinary.uploader.upload(image.tempFilePath);
      return result.url;
    } catch (error) {
      throw createError.BadRequest(error.message);
    }
  }

  async generateKey(email) {
    try {
      const token = await jwt.sign(
        {
          email: email,
        },
        "secret_key_2024",
        { expiresIn: "1d" }
      );
      return token;
    } catch (error) {
      throw createError.BadRequest(error.message);
    }
  }

  async generateAdminAccessToken(body) {
    try {
      const token = await jwt.sign(
        {
          _id: body._id,
          email: body.email,
          isAdmin: body.isAdmin,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "1d" }
      );
      return token;
    } catch (error) {
      throw createError.BadRequest(error.message);
    }
  }

  async generateAdminRefreshToken(body) {
    try {
      const token = await jwt.sign(
        {
          _id: body._id,
          email: body.email,
          isAdmin: body.isAdmin,
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: "90d" }
      );
      return token;
    } catch (error) {
      throw createError.BadRequest(error.message);
    }
  }

  async calculateTimeDiff(data) {
    try {
      const travelDate = data.travelDate;
      const pickupTime = data.pickupTime;
      const now = new Date();

      // Step 2: Define the travel date and pickup time
      // const travelDate = "2024-05-25";
      // const pickupTime = "05:00:00"; // 05:00 AM

      // Combine travel date and pickup time into a single timestamp
      const travelDateTime = new Date(`${travelDate}T${pickupTime}`);

      // Step 3: Calculate the difference in milliseconds
      const differenceInMilliseconds = travelDateTime - now;

      // Step 4: Convert the difference to hours
      const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
      console.log(differenceInHours)

      // Validate if the difference is not greater than 24 hours
      if (differenceInHours <= 24) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      throw createError.BadRequest({ message: error.message });
    }
  }
}

module.exports = new Helper();
