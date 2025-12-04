import pool from "../config/db.js";

/* ------------------------------------------
   NOTIFICATION MODEL
------------------------------------------- */

// Create a new notification (admin → specific user or broadcast)
export const createNotification = async ({ user_id, title, message }) => {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, title, message)
     VALUES (?, ?, ?)`,
    [user_id || null, title, message]
  );

  return {
    id: result.insertId,
    user_id: user_id || null,
    title,
    message,
    created_at: new Date(),
  };
};

// Get notifications for a specific user (or broadcast)
export const getUserNotifications = async (user_id) => {
  if (user_id === "all") {
    // Admin: fetch all notifications
    const [rows] = await pool.query(
      `SELECT * FROM notifications ORDER BY created_at DESC`
    );
    return rows;
  }

  // Normal user: fetch their notifications + broadcasts
  const [rows] = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = ? OR user_id IS NULL
     ORDER BY created_at DESC`,
    [user_id]
  );

  return rows;
};

// Mark a notification as read
export const markAsRead = async (id) => {
  await pool.query(
    `UPDATE notifications
     SET is_read = 1
     WHERE id = ?`,
    [id]
  );
  return true;
};

export const createNotificationPerUser = async ({ user_id, title, message }) => {
  const query = `
    INSERT INTO notifications (user_id, title, message, is_read, created_at)
    VALUES (?, ?, ?, 0, NOW())
  `;
  const [result] = await db.execute(query, [user_id, title, message]);
  return result;
};

// Fetch notifications for a specific user
export const getUserNotificationsPerUser = async (user_id) => {
  const query = `
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  const [rows] = await db.execute(query, [user_id]);
  return rows;
};

// Mark a notification as read
export const markAsReadPerUser = async (id) => {
  const query = `UPDATE notifications SET is_read = 1 WHERE id = ?`;
  const [result] = await db.execute(query, [id]);
  return result;
};