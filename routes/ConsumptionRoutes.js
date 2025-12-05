import express from "express";
import {
  getAllConsumptions,
  getConsumption,
  addConsumption,
  updateConsumption,
  removeConsumption,
  getConsumptionsByUser,
  archiveOldConsumptions
} from "../controllers/ConsumptionController.js";

const router = express.Router();

// Get latest consumption per user (dashboard)
router.get("/all", getAllConsumptions);

// Get a specific consumption by ID
router.get("/:id", getConsumption);

// Add new consumption record (new month)
router.post("/add", addConsumption);

// Update existing consumption (payments/cubic_used adjustments)
router.patch("/update/:id", updateConsumption);

// Delete a consumption record
router.delete("/delete/:id", removeConsumption);

// Get all consumptions for a specific user
router.get("/user/:userId", getConsumptionsByUser); 



// Archive old records manually
router.post("/archive-old", archiveOldConsumptions);

export default router;
