const pool = require('../config/db');
const { generateQrCode } = require('./qrService');

const buildPaymentRecord = async ({
  student_id, amount, payment_method, reference, concept, payment_date, registered_by,
}) => {
  let qr_code = null;
  let ref = reference || null;

  if (payment_method === 'qr') {
    qr_code = generateQrCode();
  }

  return { student_id, amount, payment_method, reference: ref, qr_code, concept, payment_date, registered_by };
};

const insertPayment = async (rec) => {
  const [result] = await pool.query(
    `INSERT INTO payments
     (student_id, amount, payment_method, reference, qr_code, concept, payment_date, registered_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [rec.student_id, rec.amount, rec.payment_method, rec.reference, rec.qr_code, rec.concept, rec.payment_date, rec.registered_by]
  );
  return result.insertId;
};

module.exports = { buildPaymentRecord, insertPayment };
