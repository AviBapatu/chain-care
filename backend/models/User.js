import mongoose from "mongoose";

/**
 * One doctor connection request inside a patient document.
 */
const connectionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Linked doctor
  status: { type: String, enum: ["pending", "connected"], default: "pending" }, // Connection status
  requestMessage: String, // Optional message from doctor
  connectedAt: Date, // Timestamp when accepted
  pinned: { type: Boolean, default: false }, // Whether patient pinned this doctor

  // Access toggles for this doctor
  chatEnabled: { type: Boolean, default: false },
  viewPastNotes: { type: Boolean, default: false },
  reportsAccess: { type: Boolean, default: false },
  updateRecords: { type: Boolean, default: false },
  viewHealthLogs: { type: Boolean, default: false },
});

/**
 * Main User schema used for both patients and doctors.
 */
const userSchema = new mongoose.Schema(
  {
    // Basic info
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Hashed password
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Role-specific
    role: { type: String, enum: ["patient", "doctor"], required: true },
    specialization: String, // Only for doctors
    age: Number, // For patients
    gender: String, // For patients
    lastSeen: Date, // For tracking activity

    // Patient-specific features
    customFields: [String], // Stores names of additional fields in health logs
    connections: [connectionSchema], // Connected/pending doctors
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
