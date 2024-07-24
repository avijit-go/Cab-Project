const router = require("express").Router();
const {getNotifications,
     getUserNotification, 
     updateNotification,
      updateUserNotification,
      createNotification,
      getNotificationTemplate,
      getNotificationTemplateById,
      updateNotificationTemplateById,
      deleteNotificationTemplateById
    } = require("../../controller/notification/notificationController");
const authentication = require("../../middleware/authentication");
const verifyAdmin = require("../../middleware/verifyAdmin");

router.get("/admin", getNotifications);
router.get("/user-notification", authentication, getUserNotification);
router.put("/update/:id", updateNotification)
router.put("/user-update/:id", updateUserNotification)
/**
 * Create notification
 */
router.post("/create", verifyAdmin ,createNotification);
router.get("/get-all-templates", verifyAdmin, getNotificationTemplate)
router.get("/:id", verifyAdmin, getNotificationTemplateById)
router.put("/update-template/:id", updateNotificationTemplateById)
router.delete("/delete-template/:id", deleteNotificationTemplateById)

module.exports = router;
