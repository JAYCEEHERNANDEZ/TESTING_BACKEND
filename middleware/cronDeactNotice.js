import cron from "node-cron";
import { getOverdueUsers, createDeactNotice } from "../models/DeactNoticeModel.js";

// Runs every day at 00:05
cron.schedule("5 0 * * *", async () => {
  try {
    const overdueUsers = await getOverdueUsers();
    for (const user of overdueUsers) {
      await createDeactNotice({
        user_id: user.user_id,
        title: "Account Deactivation Warning",
        message: `You have unpaid bills for ${user.unpaid_count} month(s). Please settle to avoid deactivation.`,
      });
    }
    console.log("Deactivation notices created for overdue users.");
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});
