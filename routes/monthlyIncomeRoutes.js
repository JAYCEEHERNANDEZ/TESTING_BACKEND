import express from "express";
import * as MonthlyIncomeController from "../controllers/MonthlyIncomeController.js";

const router = express.Router();

// GET all monthly incomes (computed from water_consumption)
router.get("/all", MonthlyIncomeController.fetchMonthlyIncome);

export default router;
