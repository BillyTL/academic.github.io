const pool = require('../config/db');
const { buildPaymentRecord, insertPayment } = require('../services/paymentService');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { requireFields, isPositiveNumber, isValidDate } = require('../utils/validators');

const ALLOWED = ['efectivo', 'tarjeta', 'qr'];

const list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.full_name AS student_name, s.student_code,
              ur.full_name AS registered_by_name
       FROM payments p
       JOIN students s ON s.id = p.student_id
       JOIN users u ON u.id = s.user_id
       JOIN users ur ON ur.id = p.registered_by
       ORDER BY p.payment_date DESC, p.id DESC`
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.full_name AS student_name, s.student_code
       FROM payments p
       JOIN students s ON s.id = p.student_id
       JOIN users u ON u.id = s.user_id
       WHERE p.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return notFound(res, 'Pago no encontrado');
    return ok(res, rows[0]);
  } catch (err) { return serverError(res); }
};

const create = async (req, res) => {
  try {
    const { student_id, amount, payment_method, reference, concept, payment_date } = req.body;
    const missing = requireFields(req.body, ['student_id', 'amount', 'payment_method', 'concept', 'payment_date']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    if (!ALLOWED.includes(payment_method)) return badRequest(res, 'Metodo de pago invalido');
    if (!isPositiveNumber(amount)) return badRequest(res, 'Monto invalido');
    if (!isValidDate(payment_date)) return badRequest(res, 'Fecha invalida');

    const rec = await buildPaymentRecord({
      student_id, amount, payment_method, reference, concept, payment_date,
      registered_by: req.user.id,
    });

    const id = await insertPayment(rec);
    return created(res, { id, qr_code: rec.qr_code });
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

const update = async (req, res) => {
  try {
    const { reference, concept, status } = req.body;
    const [exists] = await pool.query('SELECT id FROM payments WHERE id = ?', [req.params.id]);
    if (exists.length === 0) return notFound(res, 'Pago no encontrado');

    await pool.query(
      `UPDATE payments SET
         reference = COALESCE(?, reference),
         concept = COALESCE(?, concept),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [reference || null, concept || null, status || null, req.params.id]
    );
    return ok(res, {}, 'Pago actualizado');
  } catch (err) { return serverError(res); }
};

const cancel = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE payments SET status = "anulado" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Pago no encontrado');
    return ok(res, {}, 'Pago anulado');
  } catch (err) { return serverError(res); }
};

module.exports = { list, getById, create, update, cancel };
