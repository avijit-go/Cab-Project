/** @format */

const Redis = require("ioredis");
const redis = new Redis();
const createError = require("http-errors");

class RedisHelpers {
  constructor() {}

  async setValue(key, value) {
    try {
      console.log("Set redis ");
      await redis.set(key, value);
      return { message: "Added in Redis" };
    } catch (error) {
      throw createError.BadRequest({ message: error.message });
    }
  }

  async getValue(key) {
    try {
      const data = await redis.get(key);
      return data;
    } catch (error) {
      throw createError.BadRequest({ message: error.message });
    }
  }

  async deleteKey(key) {
    try {
      const data = await redis.del(key);
      return "Successfully deleted";
    } catch (error) {
      throw createError.BadRequest({ message: error.message });
    }
  }
}

module.exports = new RedisHelpers();
