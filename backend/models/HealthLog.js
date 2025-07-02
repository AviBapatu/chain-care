import mongoose from 'mongoose';

/**
 * One daily health update by the patient.
 * Custom fields are stored as a map like {weight: "60kg", oxygen: "98%"}
 */
const healthLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Patient who owns this log
  date: { type: Date, default: Date.now },

  // Standard input fields
  mood: String,
  bloodPressure: String,
  sugarLevel: String,
  symptoms: String,
  notes: String,

  // Any extra fields added by the patient
  customFields: {
    type: Map,
    of: String
  },

  tags: [String] // Optional tags like "critical", "daily"
});

const HealthLog = mongoose.model('HealthLog', healthLogSchema);
export default HealthLog;
