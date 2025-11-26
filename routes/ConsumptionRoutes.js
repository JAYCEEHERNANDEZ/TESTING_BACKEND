import express from "express";
import {
    getAllConsumptions,
    getConsumption,
    addConsumption,
    updateConsumption,    // full update
    updateStatus,         // status-only update
    removeConsumption
} from "../controllers/ConsumptionController.js";

const router = express.Router();

// GET all consumptions
router.get("/all", getAllConsumptions);

// GET consumption by ID
router.get("/:id", getConsumption);

// POST new consumption
router.post("/add", addConsumption);

// PATCH full update (name, readings, billing month, status)
router.patch("/update/:id", updateConsumption);

// PATCH status-only update
router.patch("/status/:id", updateStatus);

// DELETE consumption
router.delete("/delete/:id", removeConsumption);

export default router;
