import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

// Usage: node resetAdminPassword.js <email> <newPassword>
const email = process.argv[2];
const newPassword = process.argv[3];

const resetPassword = async () => {
  try {
    if (!email || !newPassword) {
      console.log("Usage: node resetAdminPassword.js <email> <newPassword>");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found:", email);
      process.exit(1);
    }

    // This will trigger pre("save") and hash the password
    user.password = newPassword;

    await user.save();

    console.log("✅ Password Reset Successfully for", user.email);

    process.exit(0);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

resetPassword();
