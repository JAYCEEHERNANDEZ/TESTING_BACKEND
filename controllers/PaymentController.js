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

// Update a payment (supports payment_1 AND payment_2)
export const makePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_1, payment_2 } = req.body;

    if (payment_1 !== undefined) {
      const num = Number(payment_1);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, message: "Invalid Payment 1 amount" });
      }
    }

    const data = await PaymentModel.updatePayment(id, { payment_1, payment_2 });

    res.json({ success: true, data, message: "Payment updated successfully" });
  } catch (err) {
    console.error("❌ Payment update failed:", err);

    if (err.message.includes("Payment")) {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};
