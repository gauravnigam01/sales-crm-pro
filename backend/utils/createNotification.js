import Notification from "../models/notificationModel.js";
import { getIO } from "../socket/socket.js";

const createNotification = async (
  title,
  message,
  type = "lead",
  audience = "all"
) => {

  try {

    const notification =
      await Notification.create({

        title,
        message,
        type,
        audience,

      });

    // ==========================
    // Real Time Emit
    // ==========================

    const io = getIO();

    io.emit(
      "newNotification",
      notification
    );

  } catch (error) {

    console.log(error.message);

  }

};

export default createNotification;