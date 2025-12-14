import * as receiptModel from "../models/ReceiptModel.js";

// Generate receipt for a confirmed payment
export const generateReceipt = async (req, res) => {
  try {
    const { consumption_id } = req.params;

    const consumption = await receiptModel.getConsumptionForReceipt(consumption_id);

    if (!consumption.payment_1 && !consumption.payment_2) {
      return res.status(400).json({ message: "Payment not confirmed yet." });
    }

    // Compute total paid
    const totalPaid = Number(consumption.payment_1 || 0) + Number(consumption.payment_2 || 0);

    // Generate unique receipt number
    const receiptNumber = `SWS-${consumption.user_id}-${Date.now()}`;

    // Save receipt in DB
    await receiptModel.saveReceipt({
      user_id: consumption.user_id,
      consumption_id: consumption.id,
      payment_amount: totalPaid,
      receipt_number: receiptNumber
    });

    // Respond with receipt data
    return res.json({
      receipt_number: receiptNumber,
      user_id: consumption.user_id,
      name: consumption.name,
      billing_date: consumption.billing_date,
      total_bill: consumption.total_bill,
      payment_1: consumption.payment_1,
      payment_2: consumption.payment_2,
      total_paid: totalPaid,
      remaining_balance: consumption.remaining_balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
