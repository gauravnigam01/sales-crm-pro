export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.permissions?.[permissionKey] === true) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access Denied",
    });
  };
};
