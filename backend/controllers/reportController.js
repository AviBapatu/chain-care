import MedicalReport from "../models/MedicalReport.js";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
const uploadReports = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "doctor" && role !== "patient") {
      return res.status(401).json({ message: "Unauthorized Request." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files received." });
    }

    const authorInfo = {
      patientId: null,
    };

    if (role === "doctor") {
      const doesPatientExist = !!(await User.exists({
        _id: req.body.patientId,
      }));

      if (!doesPatientExist) {
        return res.status(404).json({ message: "Patient Not found." });
      }

      authorInfo.patientId = req.body.patientId;
    } else if (role === "patient") {
      authorInfo.patientId = req.user._id;
    }

    if (authorInfo.patientId === null || authorInfo.uploadedBy === null) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const reports = req.files.map((file) => ({
      patientId: authorInfo.patientId,
      uploadedBy: req.user._id,
      fileUrl: file.path.toString(),
      fileName: file.originalname.toString(),
      fileType: path.extname(file.originalname).toString(),
      uploadedAt: Date.now(),
      tags: req.body.tags,
    }));

    if (reports.length === 0) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    await MedicalReport.insertMany(reports);

    return res
      .status(201)
      .json({ message: "Records are uploaded successfully." });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const updateReports = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "doctor" && role !== "patient") {
      return res.status(401).json({ message: "Unauthorized request." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    if (!req.body.reportId) {
      return res.status(400).json({ message: "Missing reportId." });
    }
    const report = await MedicalReport.findById(req.body.reportId);

    const authorInfo = {
      patientId: null,
    };

    if (role === "doctor") {
      authorInfo.patientId = req.body.patientId;
    } else if (role === "patient") {
      authorInfo.patientId = req.user._id;
    }

    if (!authorInfo.patientId) {
      return res.status(404).json({ message: "Patient not found." });
    }

    if (!report) {
      return res.status(404).json({ message: "Record not found." });
    }
    // Delete old file from uploads folder
    const oldFilePath = path.resolve(report.fileUrl);
    fs.unlink(oldFilePath, (err) => {
      if (err) {
        console.log("File deletion error:", err.message);
      }
    });
    report.updateHistory = report.updateHistory || [];
    report.updateHistory.push({
      updatedAt: Date.now(),
      updatedBy: req.user._id,
      previousData: {
        fileUrl: report.fileUrl,
        fileName: report.fileName,
        fileType: report.fileType,
        tags: report.tags,
      },
    });
    Object.assign(report, {
      uploadedBy: req.user._id,
      fileUrl: req.file.path.toString(),
      fileName: req.file.originalname.toString(),
      fileType: path.extname(req.file.originalname).toString(),
      uploadedAt: Date.now(),
      tags: req.body.tags,
    });

    await report.save();

    return res.status(200).json({ message: "Report updated successfully." });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const deleteReports = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized request." });
    }

    if (!req.body.reportId) {
      return res.status(400).json({ message: "Missing reportId." });
    }

    const report = await MedicalReport.findById(req.body.reportId);
    if (!report) {
      return res
        .status(404)
        .json({ message: "Report not found or already deleted." });
    }
    // Delete file from uploads folder
    const filePath = path.resolve(report.fileUrl);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("File deletion error:", err.message);
      }
    });
    await MedicalReport.findByIdAndDelete(req.body.reportId);
    return res
      .status(200)
      .json({ message: "Report has been deleted successfully." });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const viewReports = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "doctor" && role !== "patient") {
      return res.status(401).json({ message: "Unauthorized Request." });
    }

    let patientId = null;

    if (role === "doctor") {
      if (!req.query.patientId) {
        return res.status(400).json({ message: "Missing patientId" });
      }
      patientId = req.query.patientId;
      const isConnected = !!(await User.exists({
        _id: patientId,
        connections: {
          $elemMatch: {
            doctorId: req.user._id,
            status: "connected",
          },
        },
      }));

      if (!isConnected) {
        return res.status(401).json({ message: "Connection does not exist." });
      }
    } else if (role === "patient") {
      patientId = req.user._id;
    }

    const reports = await MedicalReport.find({ patientId });
    return res.status(200).json(reports);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export { uploadReports, updateReports, deleteReports, viewReports };
