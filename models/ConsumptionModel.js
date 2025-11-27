import pool from "../config/db.js";

/* ----------------------------------------------------
   WATER CONSUMPTION MODEL (NO OVER_30_DAYS FIELD)
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
    const error = new Error(
      "Missing required fields: user_id, name, current_reading."
    );
    error.statusCode = 400;
    throw error;
  }

  const previous_reading = 0;
  const cubic_used = current_reading;

  // Basic billing logic
  let current_bill = 270;
  if (cubic_used > 5) current_bill += (cubic_used - 5) * 17;

  const total_bill = current_bill;

  const [result] = await pool.query(
    `INSERT INTO water_consumption
      (user_id, name, previous_reading, present_reading, cubic_used,
       current_bill, total_bill, payment_1, payment_2, remaining_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      name,
      previous_reading,
      current_reading,
      cubic_used,
      current_bill,
      total_bill,
      0, // payment_1
      0, // payment_2
      total_bill // remaining balance
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
  const { present_reading, payment_1, payment_2 } = data;

  if (present_reading === undefined) {
    const error = new Error("Field present_reading is required.");
    error.statusCode = 400;
    throw error;
  }

  // Fetch existing record
  const old = await getConsumptionById(id);

  const cubic_used = present_reading;

  // Calculate bill
  let current_bill = 270;
  if (cubic_used > 5) current_bill += (cubic_used - 5) * 17;

  const total_bill = current_bill;

  const new_payment_1 = payment_1 !== undefined ? payment_1 : old.payment_1;
  const new_payment_2 = payment_2 !== undefined ? payment_2 : old.payment_2;

  // Calculate remaining balance
  const remaining_balance = old.present_reading + total_bill - (new_payment_1 + new_payment_2);


  // Update record
  const [result] = await pool.query(
    `UPDATE water_consumption
     SET previous_reading = ?,
         present_reading = ?,
         cubic_used = ?, 
         current_bill = ?, 
         total_bill = ?, 
         payment_1 = ?, 
         payment_2 = ?, 
         remaining_balance = ?
     WHERE id = ?`,
    [
      old.present_reading,  // previous reading becomes the last total bill
      total_bill,           // current reading = new total bill
      cubic_used,
      current_bill,
      total_bill,
      new_payment_1,
      new_payment_2,
      remaining_balance,
      id
    ]
  );

  if (result.affectedRows === 0) {
    const error = new Error("Consumption record not found.");
    error.statusCode = 404;
    throw error;
  }

  return await getConsumptionById(id);
};

// DELETE consumption
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
