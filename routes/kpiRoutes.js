import express from "express";
import { fetchKPIs } from "../controllers/kpiController.js";

const router = express.Router();

// GET /api/kpi/:user_id
router.get("/:user_id", fetchKPIs);

export default router;
