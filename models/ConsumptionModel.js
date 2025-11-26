import pool from "../config/db.js";

/* ----------------------------------------------------
   USER CONSUMPTION MODEL (FULLY REWRITTEN)
---------------------------------------------------- */

// Get all
export const getAllConsumptions = async () => {
    const [rows] = await pool.query("SELECT * FROM user_consumption ORDER BY id DESC");
    return rows;
};

// Get one by ID
export const getConsumptionById = async (id) => {
    if (isNaN(id)) {
        const error = new Error("Invalid ID.");
        error.statusCode = 400;
        throw error;
    }

    const [rows] = await pool.query("SELECT * FROM user_consumption WHERE id = ?", [id]);
    if (rows.length === 0) {
        const error = new Error("Consumption record not found.");
        error.statusCode = 404;
        throw error;
    }

    return rows[0];
};

/* ----------------------------------------------------
   CREATE NEW CONSUMPTION
---------------------------------------------------- */

export const createConsumption = async (data) => {
    const { user_id, previous_reading, current_reading, billing_month } = data;

    if (!user_id || previous_reading === undefined || current_reading === undefined || !billing_month) {
        const error = new Error("Missing required fields: user_id, previous_reading, current_reading, billing_month.");
        error.statusCode = 400;
        throw error;
    }

    // ✔ Correct logic: cubic_used = current_reading (NOT subtraction)
    const cubic_used = current_reading;

    // ✔ First record: cubic_all = cubic_used
    const cubic_all = cubic_used;

    // ✔ BILLING RULES
    let amount = 270; // Base rate for 1–5 cubic
    if (cubic_used > 5) amount += (cubic_used - 5) * 17;

    const [result] = await pool.query(
        `
        INSERT INTO user_consumption 
        (user_id, previous_reading, current_reading, cubic_used, cubic_all, amount, billing_month)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            user_id,
            previous_reading,
            current_reading,
            cubic_used,
            cubic_all,
            amount,
            billing_month
        ]
    );

    const [newRow] = await pool.query("SELECT * FROM user_consumption WHERE id = ?", [result.insertId]);
    return newRow[0];
};

/* ----------------------------------------------------
   UPDATE CONSUMPTION RECORD
---------------------------------------------------- */

export const updateConsumption = async (id, data) => {
    const { previous_reading, current_reading, billing_month, status } = data;

    if (previous_reading === undefined || current_reading === undefined || !billing_month) {
        const error = new Error("Fields previous_reading, current_reading, billing_month are required.");
        error.statusCode = 400;
        throw error;
    }

    // ✔ cubic_used = current_reading
    const cubic_used = current_reading;

    // ✔ update cumulative total
    const old = await getConsumptionById(id);
    const cubic_all = old.cubic_all + cubic_used;

    // ✔ billing
    let amount = 270;
    if (cubic_used > 5) amount += (cubic_used - 5) * 17;

    const [result] = await pool.query(
        `
        UPDATE user_consumption
        SET previous_reading = ?,
            current_reading = ?,
            cubic_used = ?,
            cubic_all = ?,
            amount = ?,
            billing_month = ?,
            status = COALESCE(?, status)
        WHERE id = ?
        `,
        [
            previous_reading,
            current_reading,
            cubic_used,
            cubic_all,
            amount,
            billing_month,
            status,
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

/* ----------------------------------------------------
   UPDATE STATUS ONLY
---------------------------------------------------- */

export const updateConsumptionStatus = async (id, status) => {
    if (!["paid", "unpaid"].includes(status)) {
        const error = new Error("Invalid status. Must be 'paid' or 'unpaid'.");
        error.statusCode = 400;
        throw error;
    }

    const [result] = await pool.query(
        "UPDATE user_consumption SET status = ? WHERE id = ?",
        [status, id]
    );

    if (result.affectedRows === 0) {
        const error = new Error("Record not found.");
        error.statusCode = 404;
        throw error;
    }

    return await getConsumptionById(id);
};

/* ----------------------------------------------------
   DELETE
---------------------------------------------------- */

export const deleteConsumption = async (id) => {
    const [result] = await pool.query("DELETE FROM user_consumption WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
        const error = new Error("Record not found.");
        error.statusCode = 404;
        throw error;
    }

    return true;
};
