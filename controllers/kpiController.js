import { getConsumptionKPIs } from "../models/kpi.js";

export const fetchKPIs = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);
    if (!user_id) return res.status(400).json({ success: false, message: "User ID is required" });

    const kpis = await getConsumptionKPIs(user_id, 6); // last 6 months
    res.json({ success: true, data: kpis });
  } catch (err) {
    console.error("❌ KPI fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch KPIs" });
  }
};
