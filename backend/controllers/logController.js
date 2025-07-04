import HealthLog from "../models/HealthLog.js";

const createLog = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized access." });
    }
    const patientId = req.user._id;
    if (!patientId) {
      return res.status(400).json({ message: "Missing patientId." });
    }

    const {
      mood,
      bloodPressure,
      sugarLevel,
      symptoms,
      notes,
      customFields,
      tags,
    } = req.body;

    const newLog = new HealthLog({
      patientId,
      mood,
      bloodPressure,
      sugarLevel,
      symptoms,
      notes,
      customFields,
      tags,
    });

    await newLog.save();
    return res
      .status(201)
      .json({ message: "Health log created successfully." });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const getAllLogs = async (req, res) => {
  try {
    const { role, _id } = req.user;
    if (role !== "doctor" && role !== "patient") {
      return res.status(401).json({ message: "unauthorized request." });
    }

    const patientId = role === "patient" ? _id : req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ message: "Missing patientId." });
    }

    const patientHealthLogs = await HealthLog.find({ patientId });
    return res.status(200).json(patientHealthLogs);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const deleteLog = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "Only patients can delete their logs." });
    }

    const patientId = req.user._id;
    const logId = req.body.logId;
    if (!logId) {
      return res.status(400).json({ message: "Missing logId." });
    }

    const log = await HealthLog.findOneAndDelete({ patientId, _id: logId });
    if (!log) {
      return res
        .status(404)
        .json({ message: "Log not found or already deleted." });
    }

    return res.status(200).json({ message: "Log deleted successfully." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export { createLog, getAllLogs, deleteLog };
