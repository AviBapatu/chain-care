export const roleAndPatientIdCheck = (role, reqBodyPatientId, userId) => {
  if (role !== "doctor" && role !== "patient") {
    return {
      isValid: false,
      statusCode: 401,
      message: "Unauthorized request.",
    };
  }

  if (role === "doctor") {
    if (!reqBodyPatientId) {
      return {
        isValid: false,
        statusCode: 400,
        message: "patientId is missing.",
      };
    }
    return { isValid: true, patientId: reqBodyPatientId };
  } else {
    return { isValid: true, patientId: userId };
  }
};