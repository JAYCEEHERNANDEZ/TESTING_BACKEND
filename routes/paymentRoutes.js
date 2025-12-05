import express from "express";
import {
  getPaymentsForUser,
  makePayment,
  recordPayment,
  adminMarkPayment,
  getAllUsers,
  getUserPendingPayments,
  submitReferenceCode,
  uploadPaymentProof,
  getUserPaymentProofs,
  getAllPaymentProofs
} from "../controllers/PaymentController.js";
import upload from "../middleware/uploadPaymentProof.js";

const router = express.Router();

/* -------------------- USER ROUTES -------------------- */
// Get all payments for a user
router.get("/user/:userId", getPaymentsForUser);

// Make payment with reference code
router.patch("/pay/:id", makePayment);

// Submit reference code only
router.post("/submit-reference", submitReferenceCode);

// Upload payment proof image
router.post("/upload-proof", upload.single("proof"), uploadPaymentProof);

// Get payment proofs for a specific user
router.get("/proofs/user/:userId", getUserPaymentProofs);

/* -------------------- ADMIN ROUTES -------------------- */
// Get all users
router.get("/all-users", getAllUsers);

// Get pending payments for a user
router.get("/user/:userId/pending", getUserPendingPayments);

// Record payment manually
router.post("/record", recordPayment);

// Mark payment status
router.patch("/admin/pay/:id", adminMarkPayment);

// Get all payment proofs from all users
router.get("/proofs/all", getAllPaymentProofs);




export default router;