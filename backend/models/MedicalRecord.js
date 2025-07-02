import mongoose from 'mongoose';

/**
 * Stores one uploaded file (prescription, report, x-ray, etc.)
 */
const recordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },     // Patient to whom it belongs
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },    // Can be patient or doctor
  fileUrl: String,        // Local path or cloud URL
  fileName: String,       // Original file name
  fileType: String,       // MIME type: pdf, image/png, etc.
  uploadedAt: { type: Date, default: Date.now },
  tags: [String]          // Optional tags for filtering/search
});

const MedicalRecord = mongoose.model('MedicalRecord', recordSchema);
export default MedicalRecord;
