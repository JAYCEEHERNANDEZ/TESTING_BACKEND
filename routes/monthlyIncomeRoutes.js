import express from "express";
import * as MonthlyIncomeController from "../controllers/MonthlyIncomeController.js";

const router = express.Router();

// GET monthly incomes (optionally filtered by ?year=2025&month=12)
router.get("/all", MonthlyIncomeController.fetchMonthlyIncome);

export default router;
