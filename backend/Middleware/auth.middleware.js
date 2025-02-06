import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import config from "../config/config.js";
export const authMiddleware = async (req, res, next) => {
  try {
    // console.log("Cookies:", req.cookies);
    const token = req.cookies.jwt;
    // console.log("JWT Token:", token);

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      // console.log("Decoded Token:", decoded);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        // console.log("User not found for ID:", decoded.userId);
        return res.status(404).json({ error: "User not found" });
      }
      req.user = user;
      return next();
    }

    if (req.isAuthenticated && req.isAuthenticated()) {
      // console.log("User authenticated via session");
      return next();
    }

    // console.log("User not authenticated");
    return res
      .status(401)
      .json({ error: "Unauthorized - Authentication required" });
  } catch (error) {
    // console.error("Error in authMiddleware: ", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
