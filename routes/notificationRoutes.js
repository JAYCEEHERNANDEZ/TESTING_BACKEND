import express from "express";
import * as notification from "../controllers/NotificationController.js";

const notificationroutes = express.Router();

// Admin: fetch all notifications
notificationroutes.get("/all", notification.fetchNotifications);  // admin view

// User: fetch notifications for specific user
notificationroutes.get("/user/:user_id", notification.fetchNotifications);

// Admin sends notification
notificationroutes.post("/send", notification.sendNotification);

// Mark notification as read
notificationroutes.put("/read/:id", notification.readNotification);


// Send notification (admin)
notificationroutes.post("/send", notification.sendNotificationPerUser);

// Get notifications for a specific user
notificationroutes.get("/user/:user_id", notification.fetchUserNotificationsPerUser);

// Mark notification as read
notificationroutes.put("/read/:id", notification.readNotificationPerUser);

// Fetch all admin notifications
notificationroutes.get("/admin/all", notification.getAllAdminNotifications);

// Mark a notification as read
notificationroutes.put("/admin/read/:id", notification.markAdminNotificationAsRead);

export default notificationroutes;
