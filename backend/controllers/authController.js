import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import { transporter } from "../config/emailTransporter.js";
import { sendPasswordReset } from "../utils/emailHandler.js";

const registerUser = async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = req.body.email.toLowerCase();
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    return res.status(201).json({
      message: "Registration Successful.",
      user: {
        _id: createUser._id,
        name: createUser.name,
        email: createUser.email,
        role: createUser.role,
        token: generateToken(createUser._id),
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

const loginUser = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User does not exist. Please Signup." });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (isPasswordValid) {
      return res.status(201).json({
        message: "Login Successful.",
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          token: generateToken(existingUser._id),
        },
      });
    }
  } catch (error) {
    console.log(error.message);
    console.log("loginUser Controller");
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: "Missing email" });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetURL = `http://localhost:5000/reset-password/${token}/${user._id}`;
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

    sendPasswordReset(user.email, resetURL);

    return res.status(200).json({ message: "Reset link sent to the mail." });
  } catch (error) {
    console.log(error.message);
    console.log("forgotPassword Controller");
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

const resetPassword = async (req, res) => {
  try {
    if (!req.params.token || !req.params.id || !req.body.password) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const { token, id } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      _id: id,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ Message: "Invalid or Expired token." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password was reset successfully." });
  } catch (error) {
    console.log(error.message);
    console.log("resetPassword Controller");
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

export { registerUser, loginUser, forgotPassword, resetPassword };
