import User from "../models/User.js";
import Lead from "../models/Lead.js";
import {
  PERMISSION_CATEGORIES,
  ROLE_TEMPLATES,
  getDefaultPermissions,
} from "../config/permissions.js";
import { getScopedUserIds } from "../utils/teamScope.js";

// ===================================
// Get All Users
// (admin: everyone. manager: only their own team, so they can't browse
// or act on people outside their authorized scope.)
// ===================================

export const getAllUsers = async (req, res) => {
  try {
    const filter =
      req.user.role === "manager"
        ? { _id: { $in: await getScopedUserIds(req.user) } }
        : {};

    const users = await User.find(filter).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Get My Team (manager's own team members, with basic lead counts)
// ===================================

export const getMyTeam = async (req, res) => {
  try {
    const memberIds = (await getScopedUserIds(req.user)).filter(
      (id) => id !== req.user._id.toString()
    );

    const members = await User.find({
      _id: { $in: memberIds },
    }).select("-password");

    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const leadCount = await Lead.countDocuments({
          assignedTo: member._id,
        });

        return {
          ...member.toObject(),
          leadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: membersWithStats.length,
      members: membersWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Create Caller
// ===================================

export const createCaller = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check Email
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check Phone
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone already exists",
      });
    }

    // Create Caller
    const caller = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "caller",
      permissions: getDefaultPermissions("caller"),
    });

    res.status(201).json({
      success: true,
      message: "Caller Created Successfully",
      data: {
        _id: caller._id,
        fullName: caller.fullName,
        email: caller.email,
        phone: caller.phone,
        role: caller.role,
        status: caller.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Update User
// ===================================

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // password changes must go through the dedicated reset-password flow —
    // findByIdAndUpdate bypasses the bcrypt pre-save hook and would store it in plaintext
    const { password, ...safeUpdates } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      safeUpdates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ===================================
// Change User Role
// ===================================

export const changeUserRole = async (req, res) => {

  try {

    const { id } = req.params;

    const { role } = req.body;

    const user = await User.findById(id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }

    user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User Role Updated Successfully",
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
// ===================================
// Change User Status
// ===================================

export const changeUserStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }

    user.status =
      user.status === "active"
        ? "inactive"
        : "active";

    await user.save();

    res.status(200).json({
      success: true,
      message: "User Status Updated Successfully",
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ===================================
// Get Permission Categories + Templates
// ===================================

export const getPermissionMeta = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      categories: PERMISSION_CATEGORIES,
      templates: ROLE_TEMPLATES,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Get Single User's Permissions
// ===================================

export const getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("fullName role permissions");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Update Single User's Permissions
// ===================================

export const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const { permissions } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.permissions = {
      ...user.permissions.toObject(),
      ...permissions,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Permissions Updated Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Apply Template To User
// ===================================

export const applyTemplateToUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { templateName } = req.body;

    const template = ROLE_TEMPLATES[templateName];

    if (!template) {
      return res.status(400).json({
        success: false,
        message: "Invalid Template",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.permissions = template.permissions;

    if (template.role) {
      user.role = template.role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${templateName} Applied Successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Admin Reset Any User's Password
// ===================================

export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New Password Must Be At Least 6 Characters",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: `Password Reset Successfully for ${user.fullName}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};