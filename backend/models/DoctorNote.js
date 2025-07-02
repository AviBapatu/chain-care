import mongoose from 'mongoose';

/**
 * Consultation note written by a doctor after a visit/checkup.
 */
const doctorNoteSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who was treated
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Who wrote the note
  date: { type: Date, default: Date.now },

  title: String,             // Ex: "Diabetes Checkup"
  diagnosis: String,         // Ex: "Type 2 diabetes, early stage"
  treatmentNotes: String,    // Ex: "Prescribed Metformin, advised diet change"
  tags: [String]             // Ex: ["diabetes", "follow-up"]
});

const DoctorNote = mongoose.model('DoctorNote', doctorNoteSchema);
export default DoctorNote;
