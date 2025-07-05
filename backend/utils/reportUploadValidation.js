import User from "../models/User.js";

export const validateReportUpload = async ({ patientId, userId }) => {
  const patient = await User.findById(patientId);
  if (!patient) return { isValid: false, message: "Patient not found" };
  // console.log("Patiend found");

  if (!(patientId === userId)) {
    // console.log("patientId and userId are same.");
    const connection = patient.connections.find(
      (c) => c.doctorId.toString() === userId.toString()
    );

    if (!connection) {
      return { isValid: false, message: "No upload permission" };
    }
    // console.log("Patient can upload.");
  }

  return { isValid: true };
};
