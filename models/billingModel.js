import pool from "../config/db.js";

export const getUserBilling = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE user_id = ? ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};;

export const getAllBilling = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption ORDER BY id DESC"
  );
  return rows;
};
