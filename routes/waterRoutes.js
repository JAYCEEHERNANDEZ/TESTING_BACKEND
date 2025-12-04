import express from "express";
import { fetchUserBills, uploadPaymentProof } from "../controllers/WaterConsumptionController.js";
import { authMiddleware } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

router.get("/user-bills", authMiddleware, fetchUserBills);
router.post("/upload-proof", authMiddleware, upload.single("proof_file"), uploadPaymentProof);

export default router;
