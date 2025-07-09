import MedicalReport from "../models/MedicalReport.js";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import { validateReportUpload } from "../utils/reportUploadValidation.js";
import { roleAndPatientIdCheck } from "../utils/roleAndPatientIdCheck.js";

const uploadReportsValidation = async (req, res) => {
  try {
    console.log(req.body)
    const { role, _id: userId } = req.user;
    let patientId = null;
    if (role === "patient") {
      // console.log("patient")
      patientId = req.user._id;
    } else if (role === "doctor") {
      console.log("doctor");
      patientId = req.body.patientId;
    }
    console.log(patientId);

    if (!patientId) {
      return res.status(400).json({ message: "Missing patientId." });
    }

    const roleCheck = roleAndPatientIdCheck(role, patientId, userId);
    console.log("Role Check: ", roleCheck);

    if (!roleCheck.isValid) {
      return res
        .status(roleCheck.statusCode)
        .json({ message: roleCheck.message });
    }

    const { isValid, message } = await validateReportUpload({
      patientId: patientId,
      userId: req.user._id,
    });
    console.log("Validate Report Upload", isValid);

    if (!isValid) {
      return res.status(403).json({ message: message });
    }
    res.status(200).json({ canUpload: true, patientId: patientId });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      controller: "uploadReportsValidation",
    });
  }
};
const uploadReportsToDb = async (req, res) => {
  try {
    console.log("FILES:", req.files); // Should log an array
    console.log("BODY:", req.body); // Should contain metadata string

    const { role, _id: userId } = req.user;
    let patientId = null;
    if (role === "patient") {
      patientId = req.user._id;
    } else if (role === "doctor") {
      patientId = req.body.patientId;
    }

    if (!patientId) {
      return res.status(400).json({ message: "Missing patientId." });
    }

    const roleCheck = roleAndPatientIdCheck(role, patientId, userId);
    // console.log("Role Check: ", roleCheck);

    if (!roleCheck.isValid) {
      return res
        .status(roleCheck.statusCode)
        .json({ message: roleCheck.message });
    }

    const { isValid, message } = await validateReportUpload({
      patientId: patientId,
      userId: req.user._id,
    });
    // console.log("Validate Report Upload", isValid);

    if (!isValid) {
      return res.status(403).json({ message: message });
    }

    let metadata = [];

    try {
      metadata = JSON.parse(req.body.metadata || "[]");
    } catch (e) {
      return res.status(400).json({ message: "Invalid metadata format." });
    }

    const reports = req.files.map((file, index) => ({
      patientId: patientId,
      uploadedBy: req.user._id,
      fileUrl: file.path.toString(),
      fileName: file.originalname.toString(),
      fileType: path.extname(file.originalname).toString(),
      uploadedAt: Date.now(),
      tags: Array.isArray(metadata[index]?.tags) ? metadata[index].tags : [],
    }));

    console.log("FILES:", req.files);
    console.log("METADATA STRING:", req.body.metadata);
    console.log("PARSED METADATA:", metadata);

    if (reports.length === 0) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    await MedicalReport.insertMany(reports);

    return res
      .status(201)
      .json({ message: "Reports are uploaded successfully." });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      controller: "uploadReportsToDb",
    });
  }
};
const updateReportValidation = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const reportId = req.body.reportId;
    const roleCheck = roleAndPatientIdCheck(role, req.body.patientId, userId);

    if (!roleCheck.isValid) {
      return res
        .status(roleCheck.statusCode)
        .json({ message: roleCheck.message });
    }

    const { isValid, message } = await validateReportUpload({
      patientId: roleCheck.patientId,
      userId,
      reportId,
    });

    if (!isValid) {
      return res.status(403).json({ message });
    }

    res
      .status(200)
      .json({ canUpload: true, patientId: roleCheck.patientId, reportId });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      controller: "updateReportValidation",
    });
  }
};
const updateReportInDb = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const reportId = req.body.reportId;
    const roleCheck = roleAndPatientIdCheck(role, req.body.patientId, userId);

    if (!roleCheck.isValid) {
      return res
        .status(roleCheck.statusCode)
        .json({ message: roleCheck.message });
    }

    const { isValid, message } = await validateReportUpload({
      patientId: roleCheck.patientId,
      userId,
      reportId,
    });

    if (!isValid) {
      return res.status(403).json({ message });
    }

    const report = await MedicalReport.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found." });

    if (report.patientId.toString() !== roleCheck.patientId.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot update this report." });
    }

    const oldFilePath = path.resolve(report.fileUrl);
    fs.unlink(oldFilePath, (err) => {
      if (err) console.log("File deletion error:", err.message);
    });

    let metadata = {};
    try {
      metadata = JSON.parse(req.body.metadata || "{}");
    } catch {
      return res.status(400).json({ message: "Invalid metadata format." });
    }

    report.updateHistory = report.updateHistory || [];
    report.updateHistory.push({
      updatedAt: Date.now(),
      updatedBy: userId,
      previousData: {
        fileUrl: report.fileUrl,
        fileName: report.fileName,
        fileType: report.fileType,
        tags: report.tags,
      },
    });

    Object.assign(report, {
      uploadedBy: userId,
      fileUrl: req.file.path.toString(),
      fileName: req.file.originalname.toString(),
      fileType: path.extname(req.file.originalname).toString(),
      uploadedAt: Date.now(),
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    });

    await report.save();

    return res.status(200).json({ message: "Report updated successfully." });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      controller: "updateReportInDb",
    });
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
    return res.status(500).json({
      message: "Server error. Please try again later.",
      controller: "deleteReports",
    });
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
    return res.status(500).json({
      message: "Server error. Please try again later.",
      controller: "viewReports",
    });
  }
};

export {
  uploadReportsValidation,
  uploadReportsToDb,
  updateReportValidation,
  updateReportInDb,
  deleteReports,
  viewReports,
};
