import express from "express";
import {
  getAllConsumptions,
  getConsumption,
  addConsumption,
  updateConsumption, // full update
  removeConsumption,
} from "../controllers/ConsumptionController.js";

const router = express.Router();

// GET all consumptions
router.get("/all", getAllConsumptions);

// GET consumption by ID
router.get("/:id", getConsumption);

// POST new consumption
router.post("/add", addConsumption);

// PATCH full update (name, readings, payments, notes)
router.patch("/update/:id", updateConsumption);

// DELETE consumption
router.delete("/delete/:id", removeConsumption);

export default router;
