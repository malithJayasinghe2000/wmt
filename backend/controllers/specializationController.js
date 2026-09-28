// MEMBER 2 - Specialization master data CRUD
const Specialization = require('../models/Specialization');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/specializations
const getSpecializations = asyncHandler(async (req, res) => {
  const items = await Specialization.find().sort({ name: 1 });
  res.json({ success: true, count: items.length, data: items });
});

// POST /api/specializations  (admin)
const createSpecialization = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Specialization name is required');
  }
  const item = await Specialization.create({ name, description, icon });
  res.status(201).json({ success: true, message: 'Specialization created', data: item });
});

// PUT /api/specializations/:id  (admin)
const updateSpecialization = asyncHandler(async (req, res) => {
  const item = await Specialization.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Specialization not found');
  }
  item.name = req.body.name || item.name;
  if (req.body.description !== undefined) item.description = req.body.description;
  if (req.body.icon !== undefined) item.icon = req.body.icon;
  await item.save();
  res.json({ success: true, message: 'Specialization updated', data: item });
});

// DELETE /api/specializations/:id  (admin)
const deleteSpecialization = asyncHandler(async (req, res) => {
  const item = await Specialization.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Specialization not found');
  }

  // Blocked while doctors still use it, otherwise those doctors break
  const inUse = await Doctor.countDocuments({ specializationId: item._id });
  if (inUse > 0) {
    res.status(400);
    throw new Error(`Cannot delete: ${inUse} doctor(s) use this specialization`);
  }

  await item.deleteOne();
  res.json({ success: true, message: 'Specialization deleted' });
});

module.exports = {
  getSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
};
