import express from "express";
import {
  sendNotification,
  fetchNotifications,
  readNotification
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

export default router;
