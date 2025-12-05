import * as PaymentModel from "../models/PaymentModel.js";
import { createAdminNotification } from "../models/notificationModel.js";

// USER: Get payments for a user
export const getPaymentsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await PaymentModel.getUserPayments(userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// USER: Make payment with reference
export const makePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { amount, reference_code, user_id } = req.body;

    if (!amount || Number(amount) <= 0)
      return res.status(400).json({ success: false, message: "Invalid amount" });
    if (!reference_code || reference_code.trim() === "")
      return res.status(400).json({ success: false, message: "Reference code is required" });

    const uid = user_id || (await PaymentModel.getPaymentById(paymentId)).user_id;
    const updated = await PaymentModel.applyPaymentWithReference(uid, Number(amount), reference_code);

    res.json({ success: true, data: updated, message: "Payment submitted. Await admin verification." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ADMIN: Record payment
export const recordPayment = async (req, res) => {
  try {
    const { payment_id, amount } = req.body;
    if (!payment_id || !amount || amount <= 0)
      return res.status(400).json({ success: false, message: "Invalid input" });

    const updated = await PaymentModel.recordPayment(payment_id, Number(amount));
    res.json({ success: true, data: updated, message: "Payment recorded successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ADMIN: Mark payment status
export const adminMarkPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { status } = req.body;

    const updated = await PaymentModel.markPaymentStatus(paymentId, status);
    res.json({ success: true, data: updated, message: "Payment status updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ADMIN: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await PaymentModel.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Get pending payments
export const getUserPendingPayments = async (req, res) => {
  try {
    const userId = req.params.userId;
    const payments = await PaymentModel.getUserPendingPayments(userId);
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Upload payment proof
export const uploadPaymentProof = async (req, res) => {
  try {
    const { user_id, bill_id } = req.body;

    if (!user_id || !bill_id)
      return res.status(400).json({ success: false, message: "user_id and bill_id are required" });

    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const proof_url = `/uploads/payments/${req.file.filename}`;
    const updated = await PaymentModel.submitPaymentProof({ user_id, bill_id, proof_url });

    // Notify all admins
    await createAdminNotification({
      title: "New Payment Activity",
      message: `User ID ${user_id} uploaded a payment proof.`
    });

    res.json({
      success: true,
      data: updated,
      message: "Payment proof uploaded successfully. Admin has been notified.",
      user_id: user_id  // ✅ this is key
    });
  } catch (err) {
    console.error("Error in uploadPaymentProof:", err);
    res.status(500).json({ success: false, message: "Submission failed. Try again!" });
  }
};

// Submit reference code
export const submitReferenceCode = async (req, res) => {
  try {
    const { user_id, reference_code } = req.body;

    if (!user_id || !reference_code)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const updated = await PaymentModel.saveReferenceCode(user_id, reference_code);

    // Notify all admins
    await createAdminNotification({
      title: "New Payment Activity",
      message: `User ID ${user_id} submitted a reference code for payment.`,
      user_id: user_id  // ✅ this is key
    });

    res.json({
      success: true,
      message: "Reference code submitted successfully. Admin has been notified.",
      data: updated,
    });
  } catch (err) {
    console.error("Error in submitReferenceCode:", err);
    res.status(500).json({ success: false, message: "Submission failed. Try again!" });
  }
};



// USER: Get payment proofs for a specific user
export const getUserPaymentProofs = async (req, res) => {
  try {
    const userId = req.params.userId;
    const proofs = await PaymentModel.getUserPaymentProofs(userId);
    res.json({ success: true, data: proofs });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ADMIN: Get all payment proofs
export const getAllPaymentProofs = async (req, res) => {
  try {
    const proofs = await PaymentModel.getAllPaymentProofs();
    res.json({ success: true, data: proofs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};