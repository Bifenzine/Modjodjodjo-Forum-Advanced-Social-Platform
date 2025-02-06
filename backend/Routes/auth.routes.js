import express from "express";
import {
  Logout,
  SignUp,
  checkAuth,
  forgotPassword,
  login,
  resetPassword,
  verifyEmail,
} from "../Controllers/auth.controllers.js";
import passport from "../config/passport.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import dotenv from "dotenv";
import config from "../config/config.js";

dotenv.config();
const router = express.Router();

router.post("/signup", SignUp);
router.post("/login", login);
router.post("/logout", Logout);

// check if the user is autheticated when he load the page
router.get("/check-auth", authMiddleware, checkAuth);
// verify email
router.post("/verify-email", verifyEmail);

// forget password
router.post("/forgot-password", forgotPassword);

//reset password
router.post("/reset-password/:token", resetPassword);

// get user data after login or signup by Oauth
router.get("/userData", authMiddleware, (req, res) => {
  res.send(req.user);
  console.log("User data OAuth:", req.user); // req.user);
});

// Google OAuth routes previous version
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: `${config.frontendUrl}/login`,
//     failureFlash: true,
//   }),
//   (req, res) => {
//     generateTokenAndSetCookie(req.user._id, res);
//     res.redirect(`${config.frontendUrl}/oauth-callback`);
//   }
// );

// Google OAuth routes new version to support mobile and web
router.get("/google", (req, res) => {
  const clientType = req.query.client_type || "web"; // Default to "web"
  console.log("Initiating Google OAuth flow. Client Type:", clientType);

  // Initiate the Google OAuth flow
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.frontendUrl}/login`,
    failureFlash: true,
  }),
  (req, res) => {
    const clientType = req.query.client_type || "web"; // Default to "web"
    console.log("Google OAuth callback received. Client Type:", clientType);

    if (!req.user) {
      console.log("No user found in request.");
      return res.status(401).json({ error: "Authentication failed" });
    }

    console.log("Authenticated User:", req.user);

    if (clientType === "mobile") {
      // If client type is mobile, generate token and return user data
      const token = generateTokenAndSetCookie(req.user._id, res);
      console.log(
        "Mobile client. Generated token for user:",
        req.user.username
      );
      return res.json({
        user: {
          _id: req.user._id,
          fullName: req.user.fullName,
          username: req.user.username,
          email: req.user.email,
          profilePic: req.user.profilePic,
          isVerified: req.user.isVerified,
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt,
          followers: req.user.followers,
          following: req.user.following,
        },
        token,
      });
    } else {
      // If client type is web, set cookie and redirect
      generateTokenAndSetCookie(req?.user._id, res);
      console.log(
        "Redirecting to web:",
        `${config.frontendUrl.web.production}/oauth-callback`
      );
      return res.redirect(
        `${config.frontendUrl.web.production}/oauth-callback`
      );
    }
  }
);

// GitHub OAuth routes previous version
// router.get(
//   "/github",
//   passport.authenticate("github", { scope: ["user:email"] })
// );

// console.log(config.frontendUrl);
// router.get(
//   "/github/callback",
//   (req, res, next) => {
//     console.log("GitHub callback hit");
//     next();
//   },
//   passport.authenticate("github", {
//     failureRedirect: `${config.frontendUrl}/login`,
//     failureFlash: true,
//   }),
//   (req, res) => {
//     console.log("GitHub authentication successful");
//     generateTokenAndSetCookie(req.user._id, res);
//     console.log("Redirecting to:", `${config.frontendUrl}/oauth-callback`);
//     res.redirect(`${config.frontendUrl}/oauth-callback`);
//   }
// );

// GitHub OAuth routes new version to support mobile and web
router.get("/github", (req, res) => {
  const clientType = req.query.client_type || "web"; // Default to "web"
  console.log("Initiating GitHub OAuth flow. Client Type:", clientType);

  // Initiate the GitHub OAuth flow
  passport.authenticate("github", { scope: ["user:email"] })(req, res);
});

router.get(
  "/github/callback",
  (req, res, next) => {
    console.log("GitHub callback hit");
    next();
  },
  passport.authenticate("github", {
    failureRedirect: `${config.frontendUrl}/login`,
    failureFlash: true,
  }),
  (req, res) => {
    const clientType = req.query.client_type || "web"; // Default to "web"
    console.log("GitHub OAuth callback received. Client Type:", clientType);

    if (!req.user) {
      console.log("No user found in request.");
      return res.status(401).json({ error: "Authentication failed" });
    }

    console.log("Authenticated User:", req.user);

    if (clientType === "mobile") {
      // If client type is mobile, generate token and return user data
      const token = generateTokenAndSetCookie(req.user._id, res);
      console.log(
        "Mobile client. Generated token for user:",
        req.user.username
      );
      return res.json({
        user: {
          _id: req.user._id,
          fullName: req.user.fullName,
          username: req.user.username,
          email: req.user.email,
          profilePic: req.user.profilePic,
          isVerified: req.user.isVerified,
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt,
          followers: req.user.followers,
          following: req.user.following,
        },
        token,
      });
    } else {
      // If client type is web, set cookie and redirect
      generateTokenAndSetCookie(req.user._id, res);
      console.log(
        "Redirecting to web:",
        `${config.frontendUrl.web.production}/oauth-callback`
      );
      return res.redirect(
        `${config.frontendUrl.web.production}/oauth-callback`
      );
    }
  }
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${config.frontendUrl}/login`,
    failureFlash: true,
  }),
  (req, res) => {
    generateTokenAndSetCookie(req.user._id, res);
    res.redirect(`${config.frontendUrl}/oauth-callback`);
  }
);

export default router;
