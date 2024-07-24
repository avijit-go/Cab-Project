const Content = require("../../model/content/contentModel");
const mongoose = require("mongoose");
const ceateError = require("http-errors");

class ContentController {
    constructor() {}
    
    async createContent(req, res, next) {
        try {
        const data = await Content.find({slug: req.body.slug});

        if(data.length > 0) {
            console.log("**************************", req.body.slug)
            const result = await Content.updateMany({slug: req.body.slug}, {$set: {status: "inactive"}}, {new: true});
            console.log(result)
        }
        const dataObj = Content({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            tags: req.body.tags,
            contact_info: req.body.contact_info ? req.body.contact_info  : {}
        });
        const result = await dataObj.save();
        return res.status(201).json({message: "About us content created", statusCode: 201, data: result});
        } catch (error) {
            next(error)
        }
    }

    async getAboutUs(req, res, next) {
        try {
           const data = await Content.find({slug: "about"});
           return res.status(200).json({statusCode: 200, data})
        } catch (error) {
            next(error)
        }
    }

    async getPrivacy(req, res, next) {
        try {
            const data = await Content.find({slug: "privacy"});
           return res.status(200).json({statusCode: 200, data})
        }
        catch(error) {
            next(error)
        }
    }

    async updateContent(req, res, next) {
        try {}
        catch(error) {
            next(error)
        }
    }

    async updatestatus(req, res, next) {
        try {
           const updateStatus = await Content.findByIdAndUpdate(req.params.id, {status: req.body.status}, {new: true});
           return res.status(200).json({message: "About page system", statusCode: 200, data: updateStatus})
        } catch (error) {
            next(error)
        }
    }

    async updatePrivacyStatus(req, res, next) {
        try {
           const updateStatus = await Content.findOneAndUpdate({slug: "privacy"}, {status: req.body.status}, {new: true});
           return res.status(200).json({message: "Privacy policy page system", statusCode: 200, data: updateStatus})
        } catch (error) {
            next(error)
        }
    }

    async updateContent(req, res, next) {
        try {
            if(!req.params.id) {
                throw createHttpError.BadRequest({message: "Content id is not found"});
            }
            const updateData = await Content.findByIdAndUpdate(req.params.id, req.body, {new: true});
            return res.status(200).json({message: "Content has been updated", statusCode: 200, data: updateData});
        } catch (error) {
           next(error) 
        }
    }

    async getAllContents(req, res, next) {
        try {
            const data = await Content.find({});
            return res.status(200).json({statusCode: 200, data})
        } catch (error) {
            next(error)
        }
    }

    async deleteContent(req, res, next) {
        try {
            if(!req.params.id) {
                throw ceateError.BadRequest({message: "Content id is not present"})
            }
            const deletedData = await Content.findByIdAndDelete(req.params.id);
            return res.status(200).json({message: "Content has been deleted", statusCode: 200, data: deletedData})
        }
        catch(error) {
            next(error)
        }
    }

    async getContentById(req, res, next) {
        try {
          if(!req.params.id) {
            throw ceateError.BadRequest({message: "ID not found"})
          } else {
            const content = await Content.findById(req.params.id);
            return res.status(200).json({message: "Get content",  statusCode: 200, data: content})
          }
        } catch (error) {
           next(error); 
        }
    }
}

module.exports = new ContentController()