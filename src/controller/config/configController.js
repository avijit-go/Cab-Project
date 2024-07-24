const createError = require("http-errors");
const mongoose = require("mongoose");
const Config = require("../../model/config/config")

class ConfigController {
    constructor() {}

    async createConfig(req, res, next) {
        try {
          const confiObj = Config({
            _id: new mongoose.Types.ObjectId(),
            distance_price: req.body.distance_price,
            max_extrapassener: req.body.max_extrapassener,
            passerner_cost: req.body.passerner_cost,
            wallet_point: req.body.wallet_point
          });
          const configData = await confiObj.save();
          return res.status(201).json({message: "Confi data has been saved", statusCode: 201, data: configData})
        } catch (error) {
            next(error)
        }
    }

    async updateConfig(req, res, next) {
        try {
           if(!req.params.id) {
            throw createError.BadRequest({message: "Invalid config id"})
           } else {
            const updateData = await Config.findByIdAndUpdate(req.params.id, req.body, {new: true});
            return res.status(200).json({message: 'Config data has been updated', statusCode: 200, data: updateData });
           } 
        } catch (error) {
            next(error)
        }
    }

    async getConfigData(req, res, next) {
        try {
           const data = await Config.find();
           return res.status(200).json({statusCode: 200, data}) 
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new ConfigController();