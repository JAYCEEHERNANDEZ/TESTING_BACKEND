import express from "express";
import {
  fetchOverdueUsers,
  sendDeactNoticeController,
  readNotice,
  fetchNoticesForUser,
} from "../controllers/DeactNoticeController.js";

const router = express.Router();

// Overdue users
router.get("/overdue", fetchOverdueUsers);

// Admin sends notice
router.post("/send", sendDeactNoticeController);

// Mark as read
router.put("/read/:id", readNotice);

// User fetch notices
router.get("/user/:user_id", fetchNoticesForUser);

export default router;
