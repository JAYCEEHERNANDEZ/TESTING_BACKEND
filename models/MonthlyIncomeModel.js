import pool from "../config/db.js";

// Step 2.1: Compute monthly income from water_consumption
export const computeMonthlyIncome = async () => {
  const [rows] = await pool.query(`
    SELECT 
      MONTHNAME(created_at) AS month,
      YEAR(created_at) AS year,
      SUM(COALESCE(payment_1,0) + COALESCE(payment_2,0)) AS total_income
    FROM water_consumption
    WHERE COALESCE(payment_1,0) + COALESCE(payment_2,0) > 0
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY YEAR(created_at) DESC, MONTH(created_at) DESC
  `);
  return rows;
};

// Step 2.2: Update monthly_income table
export const updateMonthlyIncomeTable = async () => {
  const monthlyData = await computeMonthlyIncome();

  for (const item of monthlyData) {
    const { month, year, total_income } = item;

    await pool.query(
      `INSERT INTO monthly_income (month, year, total_income)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE total_income = ?`,
      [month, year, total_income, total_income]
    );
  }

  return monthlyData;
};

// Step 2.3: Fetch all monthly income
export const getAllMonthlyIncome = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM monthly_income ORDER BY year DESC, month DESC"
  );
  return rows;
};
