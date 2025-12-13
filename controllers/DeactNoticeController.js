import {
  getOverdueUsers,
  createDeactNotice,
  markNoticeAsRead,
  getUserNotices,
  hasDeactNotice,
  getLatestUserBill,
  getUserBillByDate,
   hasDeactNoticeForBilling
} from "../models/DeactNoticeModel.js";

// Admin — Fetch overdue users
export const fetchOverdueUsers = async (req, res) => {
  try {
    let users = await getOverdueUsers();

    users = await Promise.all(
      users.map(async (user) => {
        const noticeSent = await hasDeactNotice(user.user_id);
        return { ...user, notice_sent: noticeSent };
      })
    );

    res.json({ success: true, users });
  } catch (err) {
    console.error("Error Fetching Overdue Users: ", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// Admin — Send Deactivation Notice for a specific billing record
export const sendDeactNoticeController = async (req, res) => {
  try {
    const { user_id, billing_date } = req.body;

    if (!user_id || !billing_date) {
      return res.status(400).json({ success: false, error: "Missing user_id or billing_date" });
    }

    // Check if notice has already been sent for this billing record
    const alreadySent = await hasDeactNoticeForBilling(user_id, billing_date);
    if (alreadySent) {
      return res.status(400).json({
        success: false,
        error: "Deactivation notice already sent for this billing record.",
      });
    }

    // Fetch the billing record for the exact billing_date
    const bill = await getUserBillByDate(user_id, billing_date);
    if (!bill) {
      return res.status(404).json({ success: false, error: "Billing record not found." });
    }

    const { name, due_date, remaining_balance } = bill;

    // Create the deactivation notice
    const notice = await createDeactNotice({ user_id, name, due_date, remaining_balance });

    res.json({
      success: true,
      message: "Notice sent successfully!",
      notice,
    });
  } catch (err) {
    console.error("Error Sending Notice: ", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// User — Mark Notification as Read
export const readNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await markNoticeAsRead(id);
    res.json({ success: true, message: "Notification marked as read." });
  } catch (err) {
    console.error("Error Reading Notice: ", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// User — Fetch Notices
export const fetchNoticesForUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const notifications = await getUserNotices(user_id);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Error Fetching User Notices: ", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
