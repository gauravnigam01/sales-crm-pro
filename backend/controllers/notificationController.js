import Notification from "../models/notificationModel.js";

// ===============================
// Get All Notifications
// ===============================

export const getNotifications = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { audience: "all" };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Create Notification
// ===============================

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);

    res.status(201).json({
      success: true,
      message: "Notification Created Successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Mark Notification As Read
// ===============================

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification Marked As Read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Delete Notification
// ===============================

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};