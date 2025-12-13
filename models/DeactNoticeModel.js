import pool from "../config/db.js";

// --------------------------
// Fetch overdue users
// --------------------------
export const getOverdueUsers = async () => {
  const [rows] = await pool.query(
    `SELECT 
        user_id,
        name,
        remaining_balance,
        DATE_FORMAT(billing_date, '%Y-%m-%d') AS billing_date,
        DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date
     FROM water_consumption
     WHERE remaining_balance > 0
       AND DATEDIFF(CURDATE(), due_date) >= 1
     ORDER BY user_id, due_date ASC`
  );
  return rows;
};

// --------------------------
// Fetch specific billing record by billing_date
// --------------------------
export const getUserBillByDate = async (user_id, billing_date) => {
  const [rows] = await pool.query(
    `SELECT name, due_date, remaining_balance
     FROM water_consumption
     WHERE user_id = ? AND DATE(billing_date) = ?
     LIMIT 1`,
    [user_id, billing_date]
  );
  return rows[0] || null;
};

// --------------------------
// Check if a notice was already sent for a specific billing record
// --------------------------
export const hasDeactNoticeForBilling = async (user_id, billing_date) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count
     FROM notifications
     WHERE user_id = ?
       AND title = 'Payment Overdue'
       AND DATE(created_at) = ?`,
    [user_id, billing_date]
  );
  return rows[0].count > 0;
};

// --------------------------
// Create a deactivation notice
// --------------------------
export const createDeactNotice = async ({ user_id, name, due_date, remaining_balance }) => {
  const title = "Payment Overdue";
  const message = `Dear ${name}, our records show that you still have an unpaid balance of ₱${remaining_balance}. Please settle your payment for ${new Date(due_date).toLocaleDateString()} to avoid service interruption.`;

  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, title, message, created_at)
     VALUES (?, ?, ?, NOW())`,
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

// --------------------------
// Mark notice as read
// --------------------------
export const markNoticeAsRead = async (id) => {
  await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
  return true;
};

// --------------------------
// Get all notifications for a user
// --------------------------
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

// --------------------------
// Check if a notice exists in the current month
// --------------------------
export const hasDeactNotice = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count
     FROM notifications
     WHERE user_id = ?
       AND title = 'Payment Overdue'
       AND MONTH(created_at) = MONTH(CURDATE())
       AND YEAR(created_at) = YEAR(CURDATE())`,
    [user_id]
  );
  return rows[0].count > 0;
};

// --------------------------
// Fetch the latest billing record
// --------------------------
export const getLatestUserBill = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT name, due_date, remaining_balance
     FROM water_consumption
     WHERE user_id = ?
     ORDER BY billing_date DESC
     LIMIT 1`,
    [user_id]
  );
  return rows[0] || null;
};
