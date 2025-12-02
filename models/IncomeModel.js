import pool from "../config/db.js";

/**
 * Get total payments for a specific month (monthly income)
 * @param {number} year - e.g., 2025
 * @param {number} month - 1-12
 * @returns {number} total income for that month
 */
export const getMonthlyIncome = async (year, month) => {
  // Construct start and end dates for the month
  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // last day of the month
  const endDate = `${year}-${month.toString().padStart(2, "0")}-${lastDay}`;

  // Query total payment for the month
  const [rows] = await pool.query(
    `SELECT SUM(payment_total) AS total_income
     FROM water_consumption
     WHERE billing_date BETWEEN ? AND ?`,
    [startDate, endDate]
  );

  // Return total income or 0 if none
  return Number(rows[0].total_income) || 0;
};
