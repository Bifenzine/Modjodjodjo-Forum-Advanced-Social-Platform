import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import config from "../config/config.js";

export const chatbotAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (token) {
      // Verify the token and set the user if valid
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId).select("-password");

      if (user) {
        req.user = user;
        return next();
      }
    } else if (req.isAuthenticated && req.isAuthenticated()) {
      // Check for session-based authentication
      req.user = req.user; // User already attached by session
      return next();
    }

    // If no valid user is found, proceed without setting req.user
    next();
  } catch (error) {
    // If there's an error (e.g., invalid token), log it and proceed without req.user
    console.error("Error in chatbotAuthMiddleware:", error);
    next();
  }
};
