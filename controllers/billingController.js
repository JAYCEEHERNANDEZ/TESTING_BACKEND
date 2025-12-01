import * as billingModel from "../models/billingModel.js";

export const getBillingForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await billingModel.getUserBilling(userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllBilling = async (req, res) => {
  try {
    const data = await billingModel.getAllBilling();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
