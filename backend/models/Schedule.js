const mongoose = require('mongoose');

// One bookable time slot of one doctor.
const scheduleSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

scheduleSchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
