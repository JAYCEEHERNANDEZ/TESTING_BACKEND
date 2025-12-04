import pool from "../config/db.js";

// Helper: format JS Date to MySQL DATETIME
const formatDate = (date) => {
  return date.toISOString().slice(0, 19).replace("T", " ");
};

// Fetch all users
export const getAllUsers = async () => {
  const [rows] = await pool.query("SELECT id, name FROM users ORDER BY name ASC");
  return rows;
};

// Get all payments for a user
export const getUserPayments = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM water_consumption WHERE user_id = ? ORDER BY billing_date ASC`,
    [user_id]
  );
  return rows;
};

// Get single payment record
export const getPaymentById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM water_consumption WHERE id = ?", [id]);
  if (!rows.length) throw new Error("Payment record not found");
  return rows[0];
};

// Record payment (admin) - auto assign to payment_1 or payment_2
export const recordPayment = async (payment_id, amount) => {
  const record = await getPaymentById(payment_id);

  let payment1 = Number(record.payment_1) || 0;
  let payment2 = Number(record.payment_2) || 0;
  let remaining = Number(record.remaining_balance);

  if (remaining <= 0) throw new Error("No remaining balance");

  const toPay = Math.min(amount, remaining);

  if (payment1 === 0) {
    payment1 = toPay;
  } else {
    payment2 = toPay;
  }

  remaining -= toPay;
  const status = remaining === 0 ? "Paid" : "Partial";
  const payment_total = payment1 + payment2;

  const now = formatDate(new Date());
  const payment1Date = payment1 > 0 ? record.payment_1_date || now : null;
  const payment2Date = payment2 > 0 ? record.payment_2_date || now : null;

  await pool.query(
    `UPDATE water_consumption SET
      payment_1 = ?, payment_1_date = ?,
      payment_2 = ?, payment_2_date = ?,
      payment_total = ?, remaining_balance = ?, status = ?
     WHERE id = ?`,
    [payment1, payment1Date, payment2, payment2Date, payment_total, remaining, status, payment_id]
  );

  return await getPaymentById(payment_id);
};

// Apply payment with reference (user)
export const applyPaymentWithReference = async (user_id, amount, reference_code) => {
  const [records] = await pool.query(
    `SELECT * FROM water_consumption WHERE user_id = ? AND remaining_balance > 0 ORDER BY billing_date ASC`,
    [user_id]
  );

  if (!records.length) throw new Error("No unpaid bills found");

  let remainingAmount = amount;
  const now = formatDate(new Date());

  for (const record of records) {
    if (remainingAmount <= 0) break;

    const toPay = Math.min(record.remaining_balance, remainingAmount);
    let payment1 = Number(record.payment_1) || 0;
    let payment2 = Number(record.payment_2) || 0;

    if (payment1 === 0) payment1 = toPay;
    else payment2 = toPay;

    const newRemaining = record.remaining_balance - toPay;
    const status = newRemaining === 0 ? "Paid" : "Partial";
    const payment_total = payment1 + payment2;

    const payment1Date = payment1 > 0 ? record.payment_1_date || now : null;
    const payment2Date = payment2 > 0 ? record.payment_2_date || now : null;

    await pool.query(
      `UPDATE water_consumption SET
         payment_1 = ?, payment_1_date = ?,
         payment_2 = ?, payment_2_date = ?,
         payment_total = ?, remaining_balance = ?, status = ?, reference_code = ?
       WHERE id = ?`,
      [payment1, payment1Date, payment2, payment2Date, payment_total, newRemaining, status, reference_code, record.id]
    );

    remainingAmount -= toPay;
  }

  return await getUserPayments(user_id);
};

// Submit reference code only
export const submitReferenceCode = async ({ user_id, bill_id, reference_code }) => {
  const now = formatDate(new Date());

  await pool.query(
    `UPDATE water_consumption SET reference_code = ?, payment_1_date = IFNULL(payment_1_date, ?), payment_2_date = IFNULL(payment_2_date, ?) 
     WHERE id = ? AND user_id = ?`,
    [reference_code, now, now, bill_id, user_id]
  );

  return await getPaymentById(bill_id);
};

// Get unpaid/partial payments
export const getUserPendingPayments = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM water_consumption WHERE user_id = ? AND remaining_balance > 0 ORDER BY billing_date ASC`,
    [user_id]
  );
  return rows;
};

// Mark payment status
export const markPaymentStatus = async (id, status) => {
  const record = await getPaymentById(id);

  let payment1 = Number(record.payment_1) || 0;
  let payment2 = Number(record.payment_2) || 0;
  let remaining = Number(record.remaining_balance) || record.current_bill;

  switch (status) {
    case "Paid":
      payment1 = record.current_bill;
      payment2 = 0;
      remaining = 0;
      break;
    case "Partial":
      payment1 = record.current_bill - remaining;
      payment2 = 0;
      break;
    case "Unpaid":
      payment1 = 0;
      payment2 = 0;
      remaining = record.current_bill;
      break;
    default:
      throw new Error("Invalid status");
  }

  const payment_total = payment1 + payment2;
  const now = formatDate(new Date());
  const payment1Date = payment1 > 0 ? record.payment_1_date || now : null;
  const payment2Date = payment2 > 0 ? record.payment_2_date || now : null;

  await pool.query(
    `UPDATE water_consumption SET
      payment_1 = ?, payment_1_date = ?,
      payment_2 = ?, payment_2_date = ?,
      payment_total = ?, remaining_balance = ?, status = ?
     WHERE id = ?`,
    [payment1, payment1Date, payment2, payment2Date, payment_total, remaining, status, id]
  );

  return await getPaymentById(id);
};

// Update proof URL only
export const submitPaymentProof = async ({ user_id, bill_id, proof_url }) => {
  const now = formatDate(new Date());

  await pool.query(
    `UPDATE water_consumption 
     SET proof_url = ?, 
         payment_1_date = IFNULL(payment_1_date, ?), 
         payment_2_date = IFNULL(payment_2_date, ?) 
     WHERE id = ? AND user_id = ?`,
    [proof_url, now, now, bill_id, user_id]
  );

  return await getPaymentById(bill_id);
};

// Get payment proofs for a specific user (with user details)
export const getUserPaymentProofs = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT wc.*, u.name as user_name 
     FROM water_consumption wc
     JOIN users u ON wc.user_id = u.id
     WHERE wc.user_id = ? AND wc.proof_url IS NOT NULL
     ORDER BY wc.billing_date DESC`,
    [user_id]
  );
  return rows;
};

// Get all payment proofs (admin view)
export const getAllPaymentProofs = async () => {
  const [rows] = await pool.query(
    `SELECT wc.*, u.name as user_name 
     FROM water_consumption wc
     JOIN users u ON wc.user_id = u.id
     WHERE wc.proof_url IS NOT NULL
     ORDER BY wc.billing_date DESC`
  );
  return rows;
};