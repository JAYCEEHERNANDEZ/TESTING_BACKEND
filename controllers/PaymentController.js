import * as PaymentModel from "../models/PaymentModel.js";

// Fetch all payments for a user
export const getPaymentsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await PaymentModel.getUserPayments(userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error fetching payments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a payment
export const makePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure payment_1 is a number
    const payment_1 = Number(req.body.payment_1);

    if (isNaN(payment_1) || payment_1 < 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount" });
    }

    const data = await PaymentModel.updatePayment(id, { payment_1 });
    res.json({ success: true, data, message: "Payment updated successfully" });
  } catch (err) {
    console.error("❌ Payment update failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
