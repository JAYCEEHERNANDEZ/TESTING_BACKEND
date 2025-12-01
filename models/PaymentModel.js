import pool from "../config/db.js";

/* ----------------------------------------------------
   PAYMENT MODEL FOR RESIDENTS — Supports payment_1 + payment_2
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

// Update payment (supports both payment_1 and payment_2)
export const updatePayment = async (id, { payment_1, payment_2 }) => {
  const old = await getPaymentById(id);

  const totalBill = Number(old.total_bill);
  let newP1 = Number(old.payment_1) || 0;
  let newP2 = Number(old.payment_2) || 0;

  const remainingBeforeP1 = totalBill - (newP1 + newP2);

  // Handle Payment 1
  if (payment_1 !== undefined) {
    const p1 = Number(payment_1);
    if (isNaN(p1) || p1 < 0 || p1 > remainingBeforeP1) {
      throw new Error(`Invalid Payment 1 amount. Must be between 0 and ₱${remainingBeforeP1}`);
    }
    newP1 += p1;
  }

  const remainingAfterP1 = totalBill - (newP1 + newP2);

  // Handle Payment 2 (must be exact remaining, but only after Payment 1)
  if (payment_2 !== undefined) {
    if (newP1 === 0) {
      throw new Error("Payment 2 cannot be made before Payment 1 is completed");
    }
    const p2 = Number(payment_2);
    if (isNaN(p2) || p2 <= 0 || p2 !== remainingAfterP1) {
      throw new Error(`Payment 2 must be the exact remaining balance: ₱${remainingAfterP1}`);
    }
    newP2 += p2;
  }

  // Update database (only payments and remaining balance)
  await pool.query(
    "UPDATE water_consumption SET payment_1 = ?, payment_2 = ?, remaining_balance = ? WHERE id = ?",
    [newP1, newP2, totalBill - (newP1 + newP2), id]
  );

  return await getPaymentById(id);
};
  