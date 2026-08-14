import crypto from "crypto";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import createNotification from "../utils/createNotification.js";
import { sendSystemEmail } from "../services/emailService.js";

// ==========================
// Forgot Password
// ==========================
// Generates a one-hour reset token and emails a reset link using whatever
// SMTP credentials are saved (Settings → Email Inbox), independent of that
// feature's live connection state. Also still raises an admin notification
// as a fallback signal — if no email credentials are saved yet, that
// notification is the only path, same as before.

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is Required",
      });
    }

    const user = await User.findOne({ email });

    // Always respond with the same generic message regardless of outcome —
    // don't let the response reveal whether this email is registered or
    // whether the system has email capability configured.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

      await user.save();

      const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${rawToken}`;

      try {
        await sendSystemEmail(
          user.email,
          "Reset Your Password — Sales CRM Pro",
          `Hi ${user.fullName},\n\nWe received a request to reset your password. Click the link below to set a new password (valid for 1 hour):\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`
        );
      } catch (error) {
        console.log("Password reset email failed:", error.message);
      }

      await createNotification(
        "Password Reset Requested",
        `${user.fullName} (${user.email}) requested a password reset.`,
        "lead",
        "admin"
      );
    }

    res.status(200).json({
      success: true,
      message:
        "If this email is registered, a reset link has been sent to it.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Reset Password With Token (self-service, from emailed link)
// ==========================

export const resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Reset Successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Login User
// ==========================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check Email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check Password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval.",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact your admin.",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Update Last Login
    user.lastLogin = new Date();
    await user.save();

   res.status(200).json({
  success: true,
  message: "Login Successful",
  token,
  user: {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    profileImage: user.profileImage,
    assignedLeads: user.assignedLeads,
    totalCalls: user.totalCalls,
    totalSales: user.totalSales,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    permissions: user.permissions,
  },
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get My Profile
// ==========================

export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update My Profile
// ==========================

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, profileImage, email, currentPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Email is the login identifier and now also the password-reset
    // destination, so changing it requires re-proving the current password
    // and checking it isn't already taken by another account.
    if (email && email.toLowerCase() !== user.email) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change your email",
        });
      }

      const isMatch = await user.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      const existing = await User.findOne({ email: email.toLowerCase() });

      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "This email is already in use",
        });
      }

      user.email = email.toLowerCase();
    }

    user.fullName = fullName || user.fullName;
    user.phone = phone || user.phone;

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
        assignedLeads: user.assignedLeads,
        totalCalls: user.totalCalls,
        totalSales: user.totalSales,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Change My Password
// ==========================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current Password is Incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Changed Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};