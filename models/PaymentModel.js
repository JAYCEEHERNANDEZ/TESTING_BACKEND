import pool from "../config/db.js";

/* ----------------------------------------------------
   PAYMENT MODEL FOR RESIDENTS  — Payment 2 Removed
---------------------------------------------------- */

// Get all billing/payment records for a user
export const getUserPayments = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE user_id = ? ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};

// Get a single payment record by ID
export const getPaymentById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [id]
  );
  if (rows.length === 0) throw new Error("Payment record not found");
  return rows[0];
};

// Update payment for a billing record (ONLY payment_1)
export const updatePayment = async (id, { payment_1 }) => {
  const old = await getPaymentById(id);

  const oldPayment1 = Number(old.payment_1 || 0);
  const totalBill = Number(old.total_bill || 0);

  // New payment (fallback to old if empty)
  const newPayment1 = Number(payment_1 ?? oldPayment1);

  // Recalculate remaining balance
  const remaining_balance = totalBill - newPayment1;

  // Update only payment_1 + remaining_balance
  await pool.query(
    "UPDATE water_consumption SET payment_1 = ?, remaining_balance = ? WHERE id = ?",
    [newPayment1, remaining_balance, id]
  );

  return await getPaymentById(id);
};
