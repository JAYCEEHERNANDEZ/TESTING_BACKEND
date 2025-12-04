import pool from "../config/db.js";

/* ----------------------------------------------------
   CONSUMPTION MODEL (BILLING + 2 PAYMENT LOGIC + DUE DATE)
---------------------------------------------------- */

// Helper: calculate bill based on cubic used
const calculateBill = (cubicUsed) => {
  if (cubicUsed <= 5) return 270;
  const extra = cubicUsed - 5;
  const ratePerExtra = 17;
  return 270 + extra * ratePerExtra;
};

// GET all consumptions (latest per user)
export const getAllConsumptions = async () => {
  const [rows] = await pool.query(`
    SELECT w1.*
    FROM water_consumption w1
    INNER JOIN (
      SELECT user_id, MAX(billing_date) AS latest_billing
      FROM water_consumption
      GROUP BY user_id
    ) w2 ON w1.user_id = w2.user_id AND w1.billing_date = w2.latest_billing
    ORDER BY w1.user_id
  `);
  return rows;
};

// GET consumption by ID
export const getConsumptionById = async (id) => {
  if (isNaN(id)) throw new Error("Invalid ID.");
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [id]
  );
  if (rows.length === 0) throw new Error("Consumption record not found.");
  return rows[0];
};

// CREATE new consumption
// CREATE new consumption
export const createConsumption = async (data) => {
  const { user_id, name, cubic_used } = data;

  if (!user_id || !name || cubic_used === undefined) {
    const error = new Error("Missing required fields.");
    error.statusCode = 400;
    throw error;
  }

  // Get last record to calculate previous readings
  const [last] = await pool.query(
    "SELECT present_reading, cubic_used FROM water_consumption WHERE user_id = ? ORDER BY billing_date DESC LIMIT 1",
    [user_id]
  );

  const previous_reading = last.length ? last[0].present_reading : 0;
  const cubic_used_last_month = last.length ? last[0].cubic_used : 0;

  const current_bill = calculateBill(cubic_used);
  const total_bill = current_bill;

  const today = new Date();
  const billing_date = new Date(today.getFullYear(), today.getMonth(), 1); // start of month
  const due_date = new Date(today);
  due_date.setDate(due_date.getDate() + 30);

  // Insert new consumption record
  const [result] = await pool.query(
    `INSERT INTO water_consumption
      (user_id, name, previous_reading, present_reading, cubic_used, cubic_used_last_month,
       current_bill, total_bill, payment_1, payment_2, remaining_balance, billing_date, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      name,
      previous_reading, // previous reading comes from last present_reading
      current_bill, // present_reading temporarily = current bill
      cubic_used,
      cubic_used_last_month,
      current_bill,
      total_bill,
      0,
      0,
      total_bill,
      billing_date,
      due_date,
    ]
  );

  // Keep only last 6 records
  const [userRecords] = await pool.query(
    "SELECT id FROM water_consumption WHERE user_id = ? ORDER BY billing_date ASC",
    [user_id]
  );
  if (userRecords.length > 6) {
    const oldestId = userRecords[0].id;
    await pool.query("DELETE FROM water_consumption WHERE id = ?", [oldestId]);
  }

  // Return newly inserted record
  const [newRow] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [result.insertId]
  );

  return newRow[0];
};

// UPDATE consumption
export const updateConsumption = async (id, data) => {
  const { cubic_used, payment_1, payment_2 } = data;
  const old = await getConsumptionById(id);

  const calculateBill = (cubic) => {
    if (cubic <= 5) return 270;
    return 270 + (cubic - 5) * 17;
  };

  // Only update cubic_used if provided
  const newCubicUsed = cubic_used ?? old.cubic_used;
  const current_bill = calculateBill(newCubicUsed);
  const total_bill = current_bill;

  // Handle payments
  let newPayment1 = old.payment_1;
  let newPayment2 = old.payment_2;
  let remaining = total_bill - newPayment1 - newPayment2;

  if (payment_1 !== undefined && old.payment_2 === 0) {
    newPayment1 = payment_1;
    remaining = total_bill - newPayment1 - newPayment2;
  }

  if (payment_2 !== undefined) {
    newPayment2 = payment_2;
    remaining = total_bill - newPayment1 - newPayment2;
  }

  await pool.query(
    `UPDATE water_consumption SET
       cubic_used = ?,
       current_bill = ?,
       total_bill = ?,
       payment_1 = ?,
       payment_2 = ?,
       remaining_balance = ?
     WHERE id = ?`,
    [
      newCubicUsed,
      current_bill,
      total_bill,
      newPayment1,
      newPayment2,
      remaining,
      id,
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
