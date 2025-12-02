import * as incomeModel from "../models/IncomeModel.js";

export const getMonthlyIncome = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: "Year and month are required" });
    }

    const totalIncome = await incomeModel.getMonthlyIncome(Number(year), Number(month));

    res.json({ success: true, data: { totalIncome } });
  } catch (err) {
    next(err);
  }
};
