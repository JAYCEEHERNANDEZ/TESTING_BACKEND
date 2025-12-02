import pool from "../config/db.js";

// Compute monthly income from water_consumption (optionally filtered by year/month)
export const computeMonthlyIncome = async (year, month) => {
  let query = `
    SELECT 
      MONTHNAME(created_at) AS month,
      YEAR(created_at) AS year,
      SUM(COALESCE(payment_1,0) + COALESCE(payment_2,0)) AS total_income
    FROM water_consumption
    WHERE COALESCE(payment_1,0) + COALESCE(payment_2,0) > 0
  `;
  const params = [];

  if (year) {
    query += " AND YEAR(created_at) = ?";
    params.push(year);
  }

  if (month) {
    query += " AND MONTH(created_at) = ?";
    params.push(month);
  }

  query += `
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY YEAR(created_at) DESC, MONTH(created_at) DESC
  `;

  const [rows] = await pool.query(query, params);
  return rows;
};

// Update monthly_income table
export const updateMonthlyIncomeTable = async (year, month) => {
  const monthlyData = await computeMonthlyIncome(year, month);

  for (const item of monthlyData) {
    const { month: monthName, year: yearNum, total_income } = item;

    await pool.query(
      `INSERT INTO monthly_income (month, year, total_income)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE total_income = ?`,
      [monthName, yearNum, total_income, total_income]
    );
  }

  return monthlyData;
};

// Fetch all monthly income
export const getAllMonthlyIncome = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM monthly_income ORDER BY year DESC, month DESC"
  );
  return rows;
};
