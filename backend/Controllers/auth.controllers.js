// to create the methods to use them in the routes file
//res.send is to send the data to the frontend
//res.send("SignUpUser")
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Crypto from "crypto";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import config from "../config/config.js";

export const SignUp = async (req, res) => {
  try {
    const { fullName, username, email, password, confirmPassword } = req.body;

    // Check if the password meets all criteria
    const passwordCriteria = [
      { label: "At least 6 characters", met: password.length >= 6 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains a number", met: /\d/.test(password) },
      {
        label: "Contains special character",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];

    const unmetCriteria = passwordCriteria.filter(
      (criterion) => !criterion.met
    );

    if (unmetCriteria.length > 0) {
      return res.status(400).json({
        error: "Password does not meet all criteria",
        unmetCriteria: unmetCriteria.map((c) => c.label),
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password and Confirm password do not match!" });
    }

    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const boyProfilePic =
      "https://res.cloudinary.com/dp9d2rdk2/image/upload/v1729361784/sz3gvdvyg6wxwezzto8b.png";

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      profilePic: boyProfilePic,
      followers: [],
      following: [],
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    if (newUser) {
      await newUser.save();

      await sendVerificationEmail(newUser.email, verificationToken);

      res.status(201).json({
        message:
          "User registered successfully. Please check your email for verification.",
        username: newUser.username,
        // for demo purposes to navigate new user that don t have "modjodjoforum@gmail.com" to login page
        email: newUser.email,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.username);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        followers: user.followers,
        following: user.following,
        isVerified: user.isVerified,
      },
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "error in the verify email controller",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // generate reset token
    const resetToken = Crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email
    // we should chnage the link based on the client type next time
    await sendPasswordResetEmail(
      user.email,
      `${config.frontendUrl.web.production}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.log("Error in the forget password controller", error);
    return res.status(500).json({
      success: false,
      message: "Error in the forget password controller",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    //  now we should delete this field and set them undefined
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    //  save user to the database
    await user.save();

    // now we should send a reset success email
    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch {
    console.log("error in the rest password controller", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error in the checkAuth controller", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//to log in
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = generateTokenAndSetCookie(user._id, res);
    user.lastLogin = new Date();
    await user.save(); // Save the updated user

    // Check the client type from the request headers
    const clientType = req.headers["x-client-type"];

    // Respond based on the client type
    if (clientType === "mobile") {
      return res.status(200).json({
        user: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
          followers: user.followers,
          following: user.following,
          lastLogin: user.lastLogin,
          isVerified: user.isVerified,
        },
        token, // Include the token for mobile clients
      });
    } else {
      // For web clients, do not include the token
      return res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        followers: user.followers,
        following: user.following,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified,
        // No token included
      });
    }
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//to log out
export const Logout = async (req, res) => {
  try {
    // Clear the JWT cookie with secure options
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "strict",
      path: "/", // Explicitly set path
    });

    // Destroy the session (for OAuth) using Promise
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    // Clear the session cookie with secure options
    res.clearCookie("connect.sid", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    // More detailed error logging
    console.error("[Logout Controller Error]:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to logout",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal Server Error",
    });
  }
};
