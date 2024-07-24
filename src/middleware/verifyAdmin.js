/** @format */

const createError = require("http-errors");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      throw createError.BadGateway({
        message: "Authentication token is not present",
      });
    }
    const isVerify = await jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!isVerify) {
      throw createError.BadRequest({ message: "Not admin" });
    }
    req.admin = isVerify;
    next();
  } catch (error) {
    next(error);
  }
};
