// Shared form validation. Every screen uses these instead of writing its own.
export const isEmpty = (value) => !value || value.trim().length === 0;

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');

export const isPhone = (value) => /^[0-9]{9,12}$/.test((value || '').trim());

export const isPastDate = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
};

export const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '');

export const isValidTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '');

export const isAfter = (start, end) => {
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return toMin(end) > toMin(start);
};

// Returns the first error message, or null when the form is valid.
export const validateLogin = ({ email, password }) => {
  if (isEmpty(email)) return 'Email is required';
  if (!isEmail(email)) return 'Enter a valid email address';
  if (isEmpty(password)) return 'Password is required';
  return null;
};

export const validateRegister = ({ name, email, password, confirm, phone }) => {
  if (isEmpty(name)) return 'Name is required';
  if (isEmpty(email)) return 'Email is required';
  if (!isEmail(email)) return 'Enter a valid email address';
  if (!isEmpty(phone) && !isPhone(phone)) return 'Phone must be 9 to 12 digits';
  if ((password || '').length < 6) return 'Password must be at least 6 characters';
  if (password !== confirm) return 'Passwords do not match';
  return null;
};
