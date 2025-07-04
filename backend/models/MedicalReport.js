import mongoose from 'mongoose';

/**
 * Stores one uploaded file (prescription, report, x-ray, etc.) with history tracking
 */
const recordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  tags: [String],

  updateHistory: [
    {
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      previousData: {
        fileUrl: String,
        fileName: String,
        fileType: String,
        tags: [String],
      },
    }
  ]
});

const MedicalReport = mongoose.model('MedicalRecord', recordSchema);
export default MedicalReport;
