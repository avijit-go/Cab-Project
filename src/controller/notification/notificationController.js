const createHttpError = require("http-errors");
const AdminNotification = require("../../model/notification/adminNotification");
const Notification = require("../../model/notification/userNotification");
const NotificationTemplate = require("../../model/notification/notificationTemplate");
const { default: mongoose } = require("mongoose");
class NotificationController {
    constructor() {}

    async getNotifications(req, res, next) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 20;
            const notifications = await AdminNotification.find({}).populate({path: "from", select: "name email profile_img"}).skip(limit*(page-1)).limit(limit).sort({createdAt: -1});
            return res.status(200).json({statusCode: 200, notifications})
        } catch (error) {
            next(error)
        }
    }

    async getUserNotification(req, res, next) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 20;
            const notifications = await Notification.find({to: req.user._id}).skip(limit*(page-1)).limit(limit).sort({createdAt: -1});
            return res.status(200).json({statusCode: 200, notifications})
        }
        catch(error) {
            next(error);
        }
    }

    async updateNotification(req, res, next) {
        try {
            if(!req.params.id) {
                throw createHttpError.BadRequest({message: "Invalid notification id"})
            }
            const updateNotification = await AdminNotification.findByIdAndUpdate(req.params.id, {$set: {isRead: true}}, {new: true});
           
            return res.status(200).json({messag: "Message read", status: 200})
        }
        catch(error) {
            next(error)
        }
    }

    async updateUserNotification(req, res, next) {
        try {
            if(!req.params.id) {
                throw createHttpError.BadRequest({message: "Invalid notification id"})
            }
            console.log("CAME HERE")
            const updateNotification = await Notification.findByIdAndUpdate(req.params.id, {$set: {isRead: true}}, {new: true});
            return res.status(200).json({messag: "Message read", status: 200})
        }
        catch(error) {
            next(error)
        }
    }

    async createNotification(req, res, next) {
        try {
            const {title, description} = req.body;
            const newTemplate = NotificationTemplate({
                _id: new mongoose.Types.ObjectId(),
                title: title,
                description: description
            });
            const templateData = await newTemplate.save();
            return res.status(201).json({message: "New template has been saved", statusCode: 201, data: templateData})
        }
        catch(error) {
            next(error)
        }
    }

    async getNotificationTemplate(req, res, next) {
        try {
           const data = await NotificationTemplate.find({});
           return res.status(200).json({status: 200, data})
        }
        catch(error) {
            next(error)
        }
    }

    async getNotificationTemplateById(req, res, next) {
        try {
            if(!req.params.id) throw createHttpError.BadRequest({message: "ID not found"})
           const data = await NotificationTemplate.findById(req.params.id);
           return res.status(200).json({status: 200, data})
        }
        catch(error) {
            next(error)
        }
    }

    async updateNotificationTemplateById(req, res, next) {
        try {
            if(!req.params.id) throw createHttpError.BadRequest({message: "ID not found"})
           const data = await NotificationTemplate.findByIdAndUpdate(req.params.id, req.body, {new: true});
           return res.status(200).json({message: "Template has been updated", status: 200, data})
        }
        catch(error) {
            next(error)
        }
    }

    async deleteNotificationTemplateById(req, res, next) {
        try {
            if(!req.params.id) throw createHttpError.BadRequest({message: "ID not found"})
           const data = await NotificationTemplate.findByIdAndDelete(req.params.id,);
           return res.status(200).json({message: "Template has been deleted", status: 200, data})
        }
        catch(error) {
            next(error)
        }
    }

}

module.exports = new NotificationController()