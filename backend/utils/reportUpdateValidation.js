import MedicalReport from "../models/MedicalReport";

export const uploadValidation = async (patientId, userId, reportId) => {
  const patient = await User.findById(patientId);
  if (!patient) return { isValid: false, message: "Patient not found" };

  if (!(patientId === userId)) {
    const connection = patient.connections.find(
      (c) => c.doctorId.toString() === userId.toString()
    );
    if (!connection || !connection.canUpload) {
      return { isValid: false, message: "No upload permission" };
    }
  }

  const report = !!(await MedicalReport.findById(reportId));
  if (!report) return { isValid: false, message: "Report not found." };

  return { isValid: true };
};
