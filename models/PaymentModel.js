import pool from "../config/db.js";

/* ----------------------------------------------------
   PAYMENT MODEL FOR RESIDENTS — Supports payment_1 + payment_2 with payment dates
---------------------------------------------------- */

export const getUserPayments = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE user_id = ? ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};

export const getPaymentById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [id]
  );
  if (rows.length === 0) throw new Error("Payment record not found");
  return rows[0];
};

export const updatePayment = async (id, { payment_1, payment_2 }) => {
  const old = await getPaymentById(id);

  const totalBill = Number(old.total_bill);
  let newP1 = Number(old.payment_1) || 0;
  let newP2 = Number(old.payment_2) || 0;

  let payment1Date = old.payment_1_date;
  let payment2Date = old.payment_2_date;

  const remainingBeforeP1 = totalBill - (newP1 + newP2);

  // Handle Payment 1
  if (payment_1 !== undefined) {
    const p1 = Number(payment_1);
    if (isNaN(p1) || p1 < 0 || p1 > remainingBeforeP1) {
      throw new Error(`Invalid Payment 1 amount. Must be between 0 and ₱${remainingBeforeP1}`);
    }
    newP1 += p1;
    if (!payment1Date && p1 > 0) {
      payment1Date = new Date(); // record current datetime for Payment 1
    }
  }

  const remainingAfterP1 = totalBill - (newP1 + newP2);

  // Handle Payment 2 (only after Payment 1)
  if (payment_2 !== undefined) {
    if (newP1 === 0) {
      throw new Error("Payment 2 cannot be made before Payment 1 is completed");
    }
    const p2 = Number(payment_2);
    if (isNaN(p2) || p2 <= 0 || p2 !== remainingAfterP1) {
      throw new Error(`Payment 2 must be the exact remaining balance: ₱${remainingAfterP1}`);
    }
    newP2 += p2;
    if (!payment2Date && p2 > 0) {
      payment2Date = new Date(); // record current datetime for Payment 2
    }
  }

  const payment_total = newP1 + newP2;
  const remaining_balance = totalBill - payment_total;
  const status = remaining_balance === 0 ? "Paid" : "Unpaid";

  // Update database with payment dates
  await pool.query(
    `UPDATE water_consumption 
     SET payment_1 = ?, payment_1_date = ?, 
         payment_2 = ?, payment_2_date = ?, 
         payment_total = ?, remaining_balance = ?, status = ? 
     WHERE id = ?`,
    [newP1, payment1Date, newP2, payment2Date, payment_total, remaining_balance, status, id]
  );

  return await getPaymentById(id);
};


// Fetch all bills due in X days (e.g., 3 days before due date)
export const getBillsNearDue = async (daysBefore = 3) => {
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + daysBefore);

  const formattedTarget = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD

  const [rows] = await pool.query(
    `SELECT * FROM water_consumption 
     WHERE status = 'Unpaid' AND due_date = ?`,
    [formattedTarget]
  );

  return rows;
};

