import { connect } from "mongoose";
import User from "../models/User.js";

/**
 * @desc Doctor send the request to the patient
 * @route POST api/connections/request
 * @access Doctor
 * @param {object} req - Express request object
 *
 * @param {string} req.body.email - Patient's email (Required)
 * @param {string} req.body.requestMessage - Optional Message from Doc for Patient
 *
 * @param {object} res - Express request object
 * @returns {object} 201 Created | 4xx Error responses
 */

const sendConnectionRequest = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const requestMessage = req.body.requestMessage;
    if (!email) {
      return res.status(400).json({ message: "Please enter email Id." });
    }

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res.status(404).json({ message: "Patient does not exist." });
    }

    const duplicateRequest = existingUser.connections.find(
      (conn) => conn.doctorId.toString() === req.user._id.toString()
    );

    if (duplicateRequest && duplicateRequest.status === "pending") {
      return res.status(409).json({ message: "Request already sent." });
    }

    if (duplicateRequest && duplicateRequest.status === "connected") {
      return res
        .status(409)
        .json({ message: "Already connected to the patient." });
    }

    existingUser.connections.push({
      doctorId: req.user._id,
      requestMessage,
      status: "pending",
      connectedAt: null,
      pinned: false,
      chatEnabled: false,
      viewPastNotes: false,
      reportsAccess: false,
    });

    await existingUser.save();
    res.status(201).json({ message: "Connection request sent successfully." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/**
 * @desc Patient approve/reject the request
 * @route POST api/connections/approve
 * @param {object} req - Express request object
 *
 * @param {string} req.body.doctorId - doctor's Id
 * @param {boolean} req.body.approvalStatus - by patient to accept or decline request
 * @param {boolean} req.body.chatEnabled - To let doc chat with patient
 * @param {boolean} req.body.viewPastNotes - To let doc view the previous doc notes
 * @param {boolean} req.body.reportsAccess - To let doc view patients reports
 *
 * @param {object} res - Express request object
 * @returns {object} 200 OK | 4xx Error responses
 */

const approveConnectionRequest = async (req, res) => {
  try {
    const {
      doctorId,
      approvalStatus,
      chatEnabled,
      viewPastNotes,
      reportsAccess,
    } = req.body;

    const existingDoctor = await User.findById(doctorId);

    if (!existingDoctor || existingDoctor.role !== "doctor") {
      return res.status(400).json({ message: "Invalid Doctor ID." });
    }

    const patient = await User.findById(req.user._id);
    if (req.user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "Only patients can approve the request." });
    }
    if (!approvalStatus) {
      patient.connections = patient.connections.filter(
        (conn) => conn.doctorId.toString() !== doctorId
      );
      await patient.save();
      return res.status(200).json({ message: "Request rejected successfully" });
    }

    const connection = patient.connections.find(
      (conn) => conn.doctorId.toString() === doctorId
    );

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    connection.status = "connected";
    connection.connectedAt = new Date();
    connection.chatEnabled = chatEnabled ?? false;
    connection.viewPastNotes = viewPastNotes ?? false;
    connection.reportsAccess = reportsAccess ?? false;
    await patient.save();

    return res
      .status(200)
      .json({ message: "Connection approved succesfully." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error. Please try again later." });
  }
};

/**
 * @desc Fetch all doctors connected to the patient
 * @route GET /api/connections/connected-doctors
 * @access Patient
 *
 * @param {object} req - Express request object
 *
 * @param {object} res - Express response object
 * @returns {object} 200 OK | 4xx Error responses
 * */

const getConnectedDoctors = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "Access Denied: Insufficient Permissions." });
    }

    const patient = await User.findById(req.user._id).populate(
      "connections.doctorId",
      "name email connectedAt chatEnabled viewPastNotes reportsAccess"
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const connectedDoctors = patient.connections
      .filter((conn) => conn.status === "connected")
      .map((conn) => ({
        doctorId: conn.doctorId._id,
        name: conn.doctorId.name,
        email: conn.doctorId.email,
        connectedAt: conn.connectedAt,
        chatEnabled: conn.chatEnabled,
        viewPastNotes: conn.viewPastNotes,
        reportsAccess: conn.reportsAccess,
        pinned: conn.pinned,
      }));

    if (connectedDoctors.length === 0) {
      return res.status(200).json({ message: "No connected doctors found." });
    }

    res.status(200).json(connectedDoctors);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

/**
 * @desc Fetch all patients connected to the logged-in doctor
 * @route GET /api/connections/connected-patients
 * @access Doctor
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 *
 * @returns {object} 200 OK | 4xx Error responses
 * */

const getConnectedPatients = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res
        .status(403)
        .json({ message: "Access Denied: Insufficient Permissions." });
    }
    const doctorId = req.user._id;
    const connectedPatients = await User.find(
      {
        role: "patient",
        connections: {
          $elemMatch: {
            doctorId,
            status: "connected",
          },
        },
      },
      "name email"
    );

    if (connectedPatients.length === 0) {
      return res.status(200).json({ message: "No connected patients found." });
    }

    return res.status(200).json(connectedPatients);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const disconnectConnection = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "doctor" && role !== "patient") {
      return res.status(401).json({ message: "Unauthorized Request." });
    }

    if (role == "doctor" && !req.body.patientId) {
      return res.status(400).json({ message: "Missing patientId" });
    }

    if (role == "patient" && !req.body.doctorId) {
      return res.status(400).json({ message: "Missing doctorId" });
    }

    if (role === "doctor") {
      const connectedPatient = await User.findById(req.body.patientId);
      if (!connectedPatient) {
        return res.status(404).json({ message: "Patient not found." });
      }

      const originalLength = connectedPatient.connections.length;

      connectedPatient.connections = connectedPatient.connections.filter(
        (conn) =>
          (conn.doctorId._id
            ? conn.doctorId._id.toString()
            : conn.doctorId.toString()) !== req.user._id.toString()
      );

      if (connectedPatient.connections.length === originalLength) {
        return res.status(404).json({ message: "Connection does not exist." });
      }

      await connectedPatient.save();
      return res.status(200).json({ message: "Disconnected succesfully." });
    } else if (role === "patient") {
      const patient = await User.findById(req.user._id);

      const originalLength = patient.connections.length;

      patient.connections = patient.connections.filter(
        (conn) =>
          (conn.doctorId._id
            ? conn.doctorId._id.toString()
            : conn.doctorId.toString()) !== req.body.doctorId
      );

      if (patient.connections.length === originalLength) {
        return res.status(404).json({ message: "Connection does not exist." });
      }

      await patient.save();
      return res.status(200).json({ message: "Disconnected successfully." });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "doctor" && role !== "patient") {
      return res.status(401).json({ message: "Unauthorized request." });
    }

    if (role === "doctor") {
      const requestedPatients = await User.find(
        {
          role: "patient",
          connections: {
            $elemMatch: {
              doctorId: req.user._id,
              status: "pending",
            },
          },
        },
        "name email connections"
      );

      if (requestedPatients.length === 0) {
        return res.status(200).json({ message: "No Pending Requests." });
      }

      const cleanedRequestedPatients = requestedPatients.map((conn) => ({
        name: conn.name,
        email: conn.email,
        requestMessage: conn.connections.requestMessage,
      }));

      return res.status(200).json(cleanedRequestedPatients);
    } else if (role === "patient") {
      const patient = await User.findById(req.user._id);

      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }

      const requestedDoctors = patient.connections.filter(
        (conn) => conn.status === "pending"
      );

      if (requestedDoctors.length === 0) {
        return res.status(200).json({ message: "No Invitations." });
      }

      return res.status(200).json(requestedDoctors);
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const cancelRequest = async (req, res) => {
  if (req.user.role !== "doctor") {
    return res
      .status(403)
      .json({ message: "Only doctors can cancel the request." });
  }
  if (!req.body || !req.body.patientId) {
    return res.status(400).json({ message: "Missing patient Id." });
  }
  const patientId = req.body.patientId;

  const patient = await User.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found." });
  }
  patient.connections = patient.connections.filter(
    (conn) => conn.doctorId.toString() !== req.user._id.toString()
  );
  await patient.save();
  return res.status(200).json({ message: "Request cancelled successfully." });
};

const updateAccess = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "No data has been recieved." });
  }

  if (req.user.role !== "patient") {
    return res.status(401).json({ message: "Only patients can access." });
  }

  const doctorId = req.body.doctorId;
  if (!doctorId) {
    return res.status(400).json({ message: "Missing doctorId." });
  }
  const patient = await User.findById(req.user._id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found." });
  }

  const doctor = patient.connections.find((conn) => conn.doctorId.toString() === doctorId);

  if(!doctor) {
    return res.status(404).json({message: "Doctor connection not found."})
  }

  if (typeof req.body.chatEnabled !== "undefined") {
    doctor.chatEnabled = req.body.chatEnabled;
  }

  if (typeof req.body.pinned !== "undefined") {
    doctor.pinned = req.body.pinned;
  }

  if (typeof req.body.viewPastNotes !== "undefined") {
    doctor.viewPastNotes = req.body.viewPastNotes;
  }

  if (typeof req.body.reportsAccess !== "undefined") {
    doctor.reportsAccess = req.body.reportsAccess;
  }

  await patient.save();
  return res
    .status(200)
    .json({ message: "Access settings updated successfully." });
};

export {
  sendConnectionRequest,
  approveConnectionRequest,
  getConnectedDoctors,
  getConnectedPatients,
  disconnectConnection,
  getPendingRequests,
  cancelRequest,
  updateAccess,
};
