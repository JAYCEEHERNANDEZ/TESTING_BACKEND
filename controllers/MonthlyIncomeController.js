import * as MonthlyIncomeModel from "../models/MonthlyIncomeModel.js";

// Fetch and update monthly income
export const fetchMonthlyIncome = async (req, res) => {
  try {
    // Automatically compute income from water_consumption
    const data = await MonthlyIncomeModel.updateMonthlyIncomeTable();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch monthly income" });
  }
};
