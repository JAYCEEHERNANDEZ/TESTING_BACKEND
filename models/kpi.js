import pool from "../config/db.js";

/* ----------------------------------------------------
   KPI MODEL — Average & Monthly Usage
---------------------------------------------------- */

export const getConsumptionKPIs = async (user_id, months = 6) => {
  if (!user_id) throw new Error("User ID is required");

  // Monthly Usage Trend (last N months)
  const [monthlyRows] = await pool.query(
    `SELECT DATE_FORMAT(billing_month, '%Y-%m') AS month,
            SUM(cubic_used) AS total_consumption
     FROM water_consumption
     WHERE user_id = ?
       AND billing_month >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
     GROUP BY month
     ORDER BY month ASC`,
    [user_id, months]
  );

  // Average Consumption (last N months)
  const [avgRows] = await pool.query(
    `SELECT AVG(cubic_used) AS avg_consumption
     FROM water_consumption
     WHERE user_id = ?
       AND billing_month >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)`,
    [user_id, months]
  );

  return {
    monthlyUsageTrend: monthlyRows,
    averageConsumption: avgRows[0].avg_consumption || 0
  };
};
