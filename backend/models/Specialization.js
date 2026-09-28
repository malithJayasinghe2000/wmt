const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' }, // uploaded image URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Specialization', specializationSchema);
