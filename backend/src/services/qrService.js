const generateQrCode = () => {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EDU-QR-${ts}-${rand}`;
};

module.exports = { generateQrCode };
