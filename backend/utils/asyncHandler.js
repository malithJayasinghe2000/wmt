// Wraps an async controller so a rejected promise reaches the error handler
// instead of crashing the server. Saves a try/catch in every controller.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
