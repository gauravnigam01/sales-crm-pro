import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Authorization Header Check
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token Missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided.",
      });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find User
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    next();
  };
};