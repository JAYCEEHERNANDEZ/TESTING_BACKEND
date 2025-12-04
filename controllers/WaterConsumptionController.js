import fs from "fs";
import path from "path";
import { getUserBills, insertPaymentProof, insertMultipleProofs } from "../models/WaterConsumptionModel.js";

export const fetchUserBills = async (req, res) => {
  try {
    const user_id = req.user.id;
    const bills = await getUserBills(user_id);
    res.json({ success: true, data: bills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { payment_type, amount, bill_id, bill_ids } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Proof file required" });

    const uploadsDir = path.join(process.cwd(), "uploads", "proofs");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${Date.now()}_${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);
    fs.renameSync(file.path, filepath);

    const proof_url = `/uploads/proofs/${filename}`;

    if (payment_type === "pay_all" && bill_ids) {
      const ids = JSON.parse(bill_ids);
      await insertMultipleProofs({ user_id, bill_ids: ids, amount, proof_url });
    } else {
      await insertPaymentProof({ user_id, bill_id, amount, proof_url, payment_type });
    }

    res.json({ success: true, message: "Proof uploaded. Await admin verification." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};
