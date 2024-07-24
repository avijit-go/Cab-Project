const Enquire = require("../../model/enquire/enquire");
const createError = require("http-errors");
const mongoose = require("mongoose");


class EnquireController {
    constructor() {}

    async createEnquire(req, res, next) {
        try {
           if(!req.body.message) {
            throw createError.BadRequest({message: "No message found"})
           } 
           const enquireData = Enquire({
            _id: new mongoose.Types.ObjectId(),
            message: req.body.message,
            user: req.user._id
           });
           const result = await enquireData.save();
           await result.populate({path: "user", select: "name email profile_img phone"});
           return res.status(201).json({message: "Enquire send", statuscode: 201, data: result})
        } catch (error) {
            next(error)
        }
    }

    async getAllEnquires(req, res, next) {
        try {
          const page = req.query.page || 1;
          const limit = req.query.limit || 10;
          const result = await Enquire.find({}).populate({path: "user", select: "name email profile_img phone"}).limit(limit).skip(limit*(page-1)).sort({createAt: -1});
          return res.status(200).json({statusCode: 200, data: result})
        } catch (error) {
            next(error)
        }
    }

    async getEnquire(req, res, next) {
        try {
            if(!req.params.id) {
                throw createError.BadRequest({message: "No id found"})
            }
            const result = await Enquire.findById(req.params.id).populate({path: "user", select: "name email profile_img phone"});
            return res.status(200).json({statusCode: 200, data: result})
        } catch (error) {
            next(error)
        }
    }

    async updateEnquire(req, res, next) {
        try {
          if(!req.params.id) {
            throw createError.BadRequest({message: "Enquire ID is not found"})
          }  else {
            const updateEnquire = await Enquire.findByIdAndUpdate(req.params.id, {$set: {status: "read"}}, {new: true});
            return res.status(200).json({message: "Enquire message has been read", statusCode: 200, data: updateEnquire})
          }
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new EnquireController();