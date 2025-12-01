import express from "express";
import {
  getBillingForUser,
  getAllBilling
} from "../controllers/billingController.js";

const router = express.Router();

router.get("/user/:userId", getBillingForUser);

router.get("/all", getAllBilling);

export default router;
