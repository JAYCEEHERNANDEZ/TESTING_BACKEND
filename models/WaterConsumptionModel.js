import pool from "../config/db.js";

export const getUserBills = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE user_id = ? ORDER BY billing_date DESC",
    [user_id]
  );
  return rows;
};

export const getBillById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [id]
  );
  return rows[0];
};

export const insertPaymentProof = async ({ user_id, bill_id, amount, proof_url, payment_type }) => {
  const bill = await getBillById(bill_id);
  if (!bill) throw new Error("Bill not found");

  let payment_1 = bill.payment_1;
  let payment_2 = bill.payment_2;

  if (payment_type === "full") {
    payment_1 = bill.remaining_balance;
  } else if (payment_type === "partial") {
    payment_1 = Number(amount);
  }

  const payment_total = payment_1 + payment_2;
  const remaining_balance = bill.total_bill - payment_total;
  const status = remaining_balance <= 0 ? "Paid" : "Partial";

  await pool.query(
    `UPDATE water_consumption 
     SET payment_1 = ?, payment_total = ?, remaining_balance = ?, status = ?, proof_url = ?, payment_1_date = NOW()
     WHERE id = ?`,
    [payment_1, payment_total, remaining_balance, status, proof_url, bill_id]
  );

  return true;
};

export const insertMultipleProofs = async ({ user_id, bill_ids, amount, proof_url }) => {
  for (const id of bill_ids) {
    await insertPaymentProof({ user_id, bill_id: id, amount, proof_url, payment_type: "full" });
  }
};
