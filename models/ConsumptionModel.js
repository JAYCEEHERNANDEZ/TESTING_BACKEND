import pool from "../config/db.js";

/* ----------------------------------------------------
   WATER CONSUMPTION MODEL (ONLY ONE PAYMENT FIELD)
---------------------------------------------------- */

// GET all consumptions
export const getAllConsumptions = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption ORDER BY id"
  );
  return rows;
};

// GET consumption by ID
export const getConsumptionById = async (id) => {
  if (isNaN(id)) {
    const error = new Error("Invalid ID.");
    error.statusCode = 400;
    throw error;
  }

  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    const error = new Error("Consumption record not found.");
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
};

// CREATE new consumption
export const createConsumption = async (data) => {
  const { user_id, name, current_reading } = data;

  if (!user_id || !name || current_reading === undefined) {
    const error = new Error("Missing required fields.");
    error.statusCode = 400;
    throw error;
  }

  // Get last reading
  const [last] = await pool.query(
    "SELECT present_reading FROM water_consumption WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [user_id]
  );

  const previous_reading = last.length ? last[0].present_reading : 0;
  const cubic_used = current_reading - previous_reading;

  if (cubic_used < 0) {
    throw new Error("Present reading cannot be lower than previous reading.");
  }

  // Billing logic
  let current_bill = 270;
  if (cubic_used > 5) current_bill += (cubic_used - 5) * 17;

  const total_bill = current_bill;

  const [result] = await pool.query(
    `INSERT INTO water_consumption
      (user_id, name, previous_reading, present_reading, cubic_used,
       current_bill, total_bill, payment_1, remaining_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      name,
      previous_reading,
      current_reading,
      cubic_used,
      current_bill,
      total_bill,
      0,                 // payment_1 default
      total_bill         // remaining_balance
    ]
  );

  const [newRow] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [result.insertId]
  );

  return newRow[0];
};

// UPDATE consumption
export const updateConsumption = async (id, data) => {
  const { present_reading, payment_1 } = data;

  const old = await getConsumptionById(id);

  const cubic_used = present_reading - old.previous_reading;
  if (cubic_used < 0) throw new Error("Present reading cannot be smaller.");

  // Bill
  let current_bill = 270;
  if (cubic_used > 5) current_bill += (cubic_used - 5) * 17;

  const total_bill = current_bill;

  const p1 = payment_1 ?? old.payment_1;
  const remaining_balance = total_bill - p1;

  await pool.query(
    `UPDATE water_consumption SET
       present_reading = ?,
       cubic_used = ?,
       current_bill = ?,
       total_bill = ?,
       payment_1 = ?,
       remaining_balance = ?
     WHERE id = ?`,
    [
      present_reading,
      cubic_used,
      current_bill,
      total_bill,
      p1,
      remaining_balance,
      id
    ]
  );

  return await getConsumptionById(id);
};

// DELETE
export const deleteConsumption = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM water_consumption WHERE id = ?",
    [id]
  );

  if (result.affectedRows === 0) {
    const error = new Error("Record not found.");
    error.statusCode = 404;
    throw error;
  }

  return true;
};

export const getConsumptionsByUser = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE user_id = ? ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};
