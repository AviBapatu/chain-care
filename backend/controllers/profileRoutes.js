import User from "../models/User.js";

const getProfile = async (req, res) => {
  try {
    const id = req.user._id;

    const isUser = await User.findById(id).select("name email role connections");

    if (!isUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(isUser);
  } catch (error) {
    console.log(error.message);
    console.log("getProfile Controller");
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const updateProfile = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error.message);
    console.log("updateProfile Controller");
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export { getProfile, updateProfile };
