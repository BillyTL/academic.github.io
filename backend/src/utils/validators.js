const isEmail = (v) =>
  typeof v === 'string' &&
  /^[\w.+-]+@[a-zA-Z\d-]+(\.[a-zA-Z\d-]+)+$/.test(v.trim());

const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

const isPositiveNumber = (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0;

const isInRange = (v, min, max) => {
  const n = parseFloat(v);
  return !isNaN(n) && n >= min && n <= max;
};

const isValidDate = (v) => {
  if (!v) return false;
  const d = new Date(v);
  return d instanceof Date && !isNaN(d);
};

const requireFields = (obj, fields) => {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || obj[f] === '');
  return missing;
};

module.exports = { isEmail, isNonEmpty, isPositiveNumber, isInRange, isValidDate, requireFields };
