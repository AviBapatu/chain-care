import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

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
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

export { registerUser, loginUser };
