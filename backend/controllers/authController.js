import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ==========================
// Register User
// ==========================

export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Email Check
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Phone Check
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone already exists",
      });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: user,
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
  },
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};