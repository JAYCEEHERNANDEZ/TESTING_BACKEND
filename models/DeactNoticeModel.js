import pool from "../config/db.js";

/* -------------------------------
   DeactNotice Model
---------------------------------*/

// Fetch overdue users: remaining_balance > 0 AND due_date older than 2 months
// Fetch users whose latest bill is unpaid and notice should be sent 3 days before due date
export const getOverdueUsers = async () => {
  const [rows] = await pool.query(
    `SELECT user_id, name, remaining_balance, billing_date, due_date
     FROM water_consumption
     WHERE remaining_balance > 0
       AND MONTH(billing_date) = MONTH(NOW())
       AND YEAR(billing_date) = YEAR(NOW())
       AND DAY(NOW()) >= DAY(due_date) - 3
     GROUP BY user_id`
  );
  return rows;
};


// Create deactivation notice
export const createDeactNotice = async ({ user_id, title, message }) => {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, title, message)
     VALUES (?, ?, ?)`,
    [user_id, title, message]
  );

  return {
    id: result.insertId,
    user_id,
    title,
    message,
    created_at: new Date(),
  };
};

// Mark notice as read
export const markNoticeAsRead = async (id) => {
  await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
  return true;
};

// Get user notifications
export const getUserNotices = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT *
     FROM notifications
     WHERE user_id = ? OR user_id IS NULL
     ORDER BY created_at DESC`,
    [user_id]
  );
  return rows;
};

// Check if notice already exists
export const hasDeactNotice = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count
     FROM notifications
     WHERE user_id = ? AND title = 'Payment Overdue'`,
    [user_id]
  );
  return rows[0].count > 0;
};
