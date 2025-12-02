import * as MonthlyIncomeModel from "../models/MonthlyIncomeModel.js";

// Fetch and update monthly income (optional filter: ?year=2025&month=12)
export const fetchMonthlyIncome = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Convert to numbers if provided
    const yearNum = year ? parseInt(year) : undefined;
    const monthNum = month ? parseInt(month) : undefined;

    // Automatically compute income from water_consumption
    const data = await MonthlyIncomeModel.updateMonthlyIncomeTable(yearNum, monthNum);

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch monthly income" });
  }
};
