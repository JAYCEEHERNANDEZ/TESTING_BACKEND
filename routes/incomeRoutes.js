import express from "express";
import { getMonthlyIncome } from "../controllers/IncomeController.js";

const router = express.Router();

// GET monthly income
// Example: /api/admin/income?year=2025&month=12
router.get("/income", getMonthlyIncome);

export default router;
