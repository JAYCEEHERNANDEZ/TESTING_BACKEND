import pool from "../config/db.js";

/* ----------------------------------------------------
   CONSUMPTION MODEL (BILLING + 2 PAYMENT LOGIC)
---------------------------------------------------- */

// Helper: calculate bill based on cubic used
const calculateBill = (cubicUsed) => {
  if (cubicUsed <= 5) return 270;
  const extra = cubicUsed - 5;
  const ratePerExtra = 17; // 17 pesos per extra cubic
  return 270 + extra * ratePerExtra;
};

// GET all consumptions
export const getAllConsumptions = async () => {
  const [rows] = await pool.query("SELECT * FROM water_consumption ORDER BY id");
  return rows;
};

// GET consumption by ID
export const getConsumptionById = async (id) => {
  if (isNaN(id)) throw new Error("Invalid ID.");
  const [rows] = await pool.query("SELECT * FROM water_consumption WHERE id = ?", [id]);
  if (rows.length === 0) throw new Error("Consumption record not found.");
  return rows[0];
};

// CREATE new consumption
export const createConsumption = async (data) => {
  const { user_id, name, cubic_used } = data;
  if (!user_id || !name || cubic_used === undefined) {
    const error = new Error("Missing required fields.");
    error.statusCode = 400;
    throw error;
  }

  // Get last record for this user
  const [last] = await pool.query(
    "SELECT current_bill, cubic_used FROM water_consumption WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [user_id]
  );

  const previous_reading = last.length ? last[0].current_bill : 0;
  const cubic_used_last_month = last.length ? last[0].cubic_used : 0;

  // Calculate current bill based on cubic used
  const current_bill = calculateBill(cubic_used);
  const total_bill = current_bill;

  // First day of current month (DATE)
  const today = new Date();
  const billing_month = new Date(today.getFullYear(), today.getMonth(), 1);

  const [result] = await pool.query(
    `INSERT INTO water_consumption
      (user_id, name, previous_reading, present_reading, cubic_used, cubic_used_last_month,
       current_bill, total_bill, payment_1, payment_2, remaining_balance, billing_month)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      name,
      previous_reading,
      total_bill,               // present reading = this month’s total bill
      cubic_used,
      cubic_used_last_month,
      current_bill,
      total_bill,
      0,                        // payment_1 default
      0,                        // payment_2 default
      total_bill,               // remaining_balance
      billing_month
    ]
  );

  const [newRow] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [result.insertId]
  );

  return newRow[0];
};

// UPDATE consumption (with payment_1 and payment_2)
export const updateConsumption = async (id, data) => {
  const { cubic_used, payment_1, payment_2 } = data;
  const old = await getConsumptionById(id);

  // Billing calculation: 1-5 m³ = 270, +17 per extra cubic above 5
  const calculateBill = (cubic) => {
    if (cubic <= 5) return 270;
    return 270 + (cubic - 5) * 17;
  };

  const newCubicUsed = cubic_used ?? old.cubic_used;
  const current_bill = calculateBill(newCubicUsed); // current month bill
  const total_bill = current_bill;

  // Handle payments
  let newPayment1 = old.payment_1;
  let newPayment2 = old.payment_2;
  let remaining = total_bill - old.payment_1 - old.payment_2;

  if (payment_1 !== undefined && old.payment_2 === 0) {
    newPayment1 = payment_1;
    remaining = total_bill - newPayment1 - newPayment2;
  }

  if (payment_2 !== undefined) {
    newPayment2 = remaining;
    remaining = 0;
  }

  const today = new Date();
  const billing_month = new Date(today.getFullYear(), today.getMonth(), 1);

  await pool.query(
    `UPDATE water_consumption SET
       previous_reading = ?,
       present_reading = ?,
       cubic_used_last_month = ?,
       cubic_used = ?,
       current_bill = ?,
       total_bill = ?,
       payment_1 = ?,
       payment_2 = ?,
       remaining_balance = ?,
       billing_month = ?
     WHERE id = ?`,
    [
      old.current_bill,   // previous_reading = last month's current_bill
      current_bill,       // present_reading = this month's bill
      old.cubic_used,     // cubic_used_last_month = old cubic_used
      newCubicUsed,       // new cubic_used
      current_bill,       // current_bill = this month's bill
      total_bill,
      newPayment1,
      newPayment2,
      remaining,
      billing_month,
      id
    ]
  );  

  return await getConsumptionById(id);
};


// DELETE consumption
export const deleteConsumption = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM water_consumption WHERE id = ?",
    [id]
  );
  if (result.affectedRows === 0) throw new Error("Record not found.");
  return true;
};

// GET consumptions by user
export const getConsumptionsByUser = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE user_id = ? ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};


