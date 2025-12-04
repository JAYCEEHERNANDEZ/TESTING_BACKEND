import {
  getOverdueUsers,
  createDeactNotice,
  markNoticeAsRead,
  getUserNotices,
  hasDeactNotice,
} from "../models/DeactNoticeModel.js";

// Get overdue users for admin dashboard
export const fetchOverdueUsers = async (req, res) => {
  try {
    let users = await getOverdueUsers();

    // Check for existing notice
    users = await Promise.all(
      users.map(async (user) => {
        const noticeSent = await hasDeactNotice(user.user_id);
        return { ...user, notice_sent: noticeSent };
      })
    );

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Send deactivation notice
export const sendDeactNoticeController = async (req, res) => {
  try {
    const { user_id, title, message } = req.body;

    const alreadySent = await hasDeactNotice(user_id);
    if (alreadySent) throw new Error("Notice already sent to this user");

    const notice = await createDeactNotice({ user_id, title, message });
    res.json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Mark notice as read
export const readNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await markNoticeAsRead(id);
    res.json({ success: true, message: "Notice marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Fetch notices for a specific user
export const fetchNoticesForUser = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const notifications = await getUserNotices(user_id);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
