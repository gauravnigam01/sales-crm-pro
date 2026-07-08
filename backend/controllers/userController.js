import User from "../models/User.js";

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

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
// Create Caller
export const createCaller = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

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

    // Create Caller
    const caller = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "caller",
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