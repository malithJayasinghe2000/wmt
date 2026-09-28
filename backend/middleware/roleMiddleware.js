// Allows only the listed roles through. Use after protect.
// Example: router.post('/', protect, authorize('admin'), createDoctor)
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error(`Access denied. Allowed roles: ${roles.join(', ')}`));
  }
  next();
};

module.exports = { authorize };
