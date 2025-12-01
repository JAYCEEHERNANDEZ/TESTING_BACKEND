import express from "express";
import { getPaymentsForUser, makePayment } from "../controllers/PaymentController.js";

const router = express.Router();

// Fetch all payments for a resident
router.get("/user/:userId", getPaymentsForUser);

// Update a payment
router.patch("/pay/:id", makePayment);

export default router;
