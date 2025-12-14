import pool from "../config/db.js";


// Create a new notification
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

export const createAdminNotification = async ({ title, message, user_id }) => {
  try {
    const [admins] = await pool.query(
      `SELECT id FROM admin_reader WHERE role = 'admin'`
    );

    if (!admins.length) return;

    // Check if a notification for this user + title already exists
    const [existing] = await pool.query(
      `SELECT id, message FROM admin_notifications 
       WHERE user_id = ? AND title = ?`,
      [user_id, title]
    );

    let notifPromises = [];

    admins.forEach((admin) => {
      if (existing.length > 0) {
        // Parse existing messages JSON
        let messagesArray;
        try {
          messagesArray = JSON.parse(existing[0].message).messages || [];
        } catch {
          messagesArray = [];
        }

        // Add new message if not already present
        if (!messagesArray.includes(message)) {
          messagesArray.push(message);
        }

        const updatedMessage = JSON.stringify({ messages: messagesArray });

        notifPromises.push(
          pool.query(
            `UPDATE admin_notifications 
             SET message = ?, created_at = NOW(), is_read = 0 
             WHERE id = ? AND admin_id = ?`,
            [updatedMessage, existing[0].id, admin.id]
          )
        );
      } else {
        // Create new notification as JSON
        const newMessage = JSON.stringify({ messages: [message] });
        notifPromises.push(
          pool.query(
            `INSERT INTO admin_notifications (admin_id, user_id, title, message, is_read, created_at)
             VALUES (?, ?, ?, ?, 0, NOW())`,
            [admin.id, user_id || null, title, newMessage]
          )
        );
      }
    });

    await Promise.all(notifPromises);
  } catch (err) {
    console.error("Error creating admin notification:", err);
  }
};

export const fetchAllAdminNotifications = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM admin_notifications ORDER BY created_at DESC`
  );
  return rows;
};

// Mark a notification as read
export const markNotificationAsRead = async (notifId) => {
  await pool.query(
    `UPDATE admin_notifications SET is_read = 1 WHERE id = ?`,
    [notifId]
  );
};