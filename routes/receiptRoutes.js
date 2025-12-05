import express from "express";
import { generateReceipt } from "../controllers/ReceiptController.js";

const router = express.Router();

// GET /receipt/:consumption_id
router.get("/:consumption_id", generateReceipt);

export default router;
