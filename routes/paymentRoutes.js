import express from "express";
import * as Payment from "../controllers/PaymentController.js";
import upload from "../middleware/uploadPaymentProof.js";

const paymentroutes = express.Router();

// Get all payments for a user
paymentroutes.get("/user/:userId", Payment.getPaymentsForUser);

// Submit reference code only
paymentroutes.post("/submit-reference", Payment.submitReferenceCode);

// Upload payment proof image
paymentroutes.post("/upload-proof", upload.single("proof"), Payment.uploadPaymentProof);

// Get payment proofs for a specific user
paymentroutes.get("/proofs/user/:userId", Payment.getUserPaymentProofs);

// Admin 

// Get all users
paymentroutes.get("/all-users", Payment.getAllUsers);

// Record payment manually
paymentroutes.post("/record", Payment.recordPayment);

export default paymentroutes;