// MEMBER 6 - File upload service used by every other module
const asyncHandler = require('../utils/asyncHandler');

// POST /api/upload  (form-data, field name: file)
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file was uploaded');
  }

  // The saved URL must be reachable BY THE PHONE, so "localhost" is never
  // usable: to the phone, localhost means the phone itself.
  // In development we build the URL from the address the phone actually
  // called (for example 192.168.1.48:5002).
  // On the hosted server, BASE_URL is the public address and wins.
  const configured = process.env.BASE_URL;
  const isLocal = !configured || configured.includes('localhost') || configured.includes('127.0.0.1');
  const base = isLocal ? `${req.protocol}://${req.get('host')}` : configured;

  const url = `${base}/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: 'File uploaded',
    data: { url, filename: req.file.filename, size: req.file.size },
  });
});

module.exports = { uploadFile };
