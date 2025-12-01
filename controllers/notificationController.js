import {
  createNotification,
  getUserNotifications,
  markAsRead
} from "../models/notificationModel.js";

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
