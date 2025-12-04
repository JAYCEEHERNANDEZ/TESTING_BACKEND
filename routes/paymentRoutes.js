import express from "express";
import {
  getPaymentsForUser,
  makePayment,
  recordPayment,
  adminMarkPayment,
  getAllUsers,
  getUserPendingPayments,
  submitUserReference
} from "../controllers/PaymentController.js";

const router = express.Router();

/* -------------------- USER -------------------- */
router.get("/user/:userId", getPaymentsForUser);
router.patch("/pay/:id", makePayment);
router.post("/submit-reference", submitUserReference);

/* -------------------- ADMIN -------------------- */
router.get("/all-users", getAllUsers);
router.get("/user/:userId/pending", getUserPendingPayments);
router.post("/record", recordPayment);
router.patch("/admin/pay/:id", adminMarkPayment);

export default router;
