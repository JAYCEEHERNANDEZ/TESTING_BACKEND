import {
  createNotification,
  getUserNotifications,
  markAsRead,
  fetchAllAdminNotifications,
  markNotificationAsRead,
} from "../models/notificationModel.js";

// Fetch notifications (admin or user)
export const fetchNotifications = async (req, res) => {
  try {
    const { user_id } = req.params; // user_id = "all" for admin
    const list = await getUserNotifications(user_id);
    res.json({ success: true, notifications: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin sends a notification
export const sendNotification = async (req, res) => {
  try {
    const { user_id, title, message } = req.body;
    const result = await createNotification({ user_id, title, message });
    res.json({ success: true, notification: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Mark a notification as read
export const readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await markAsRead(id);
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const sendNotificationPerUser = async (req, res) => {
  try {
    const { user_id, title, message } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({ error: "user_id, title, and message are required" });
    }

    await Notification.createNotificationPerUser({ user_id, title, message });
    res.status(200).json({ message: "Notification sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch notifications for a user
export const fetchUserNotificationsPerUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const notifications = await Notification.getUserNotificationsPerUser(user_id);
    res.status(200).json({ data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Mark notification as read
export const readNotificationPerUser = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsReadPerUser(id);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch all admin notifications
export const getAllAdminNotifications = async (req, res) => {
  try {
    const rows = await fetchAllAdminNotifications(); // from your model
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching admin notifications:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark admin notification as read
export const markAdminNotificationAsRead = async (req, res) => {
  try {
    const notifId = req.params.id;
    await markNotificationAsRead(notifId); // from your model
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


