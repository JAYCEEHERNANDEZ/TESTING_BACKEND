import express from "express";
import {
  sendNotification,
  fetchNotifications,
  readNotification,
  sendNotificationPerUser,
  fetchUserNotificationsPerUser,
  readNotificationPerUser,
  getAllAdminNotifications,
  markAdminNotificationAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Admin: fetch all notifications
router.get("/all", fetchNotifications);  // admin view

// User: fetch notifications for specific user
router.get("/user/:user_id", fetchNotifications);


// Admin sends notification
router.post("/send", sendNotification);

// Mark notification as read
router.put("/read/:id", readNotification);


// Send notification (admin)
router.post("/send", sendNotificationPerUser);

// Get notifications for a specific user
router.get("/user/:user_id", fetchUserNotificationsPerUser);

// Mark notification as read
router.put("/read/:id", readNotificationPerUser);

// Fetch all admin notifications
router.get("/admin/all", getAllAdminNotifications);

// Mark a notification as read
router.put("/admin/read/:id", markAdminNotificationAsRead);
export default router;
