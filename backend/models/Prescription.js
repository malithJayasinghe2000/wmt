const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
    },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    diagnosis: { type: String, required: true },
    medicines: [{ type: String }],
    notes: { type: String, default: '' },
    reportFile: { type: String, default: '' }, // uploaded file URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
