const pool = require('../config/db');
const { hashPassword } = require('../services/authService');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { isEmail, requireFields } = require('../utils/validators');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_code, s.birth_date, s.address, s.guardian_name, s.guardian_phone,
              s.status, u.full_name, u.email, u.phone, u.document_id, u.id AS user_id
       FROM students s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.id DESC`
    );
    return ok(res, rows);
  } catch (err) { console.error(err); return serverError(res); }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.full_name, u.email, u.phone, u.document_id, u.status AS user_status
       FROM students s JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return notFound(res, 'Estudiante no encontrado');
    return ok(res, rows[0]);
  } catch (err) { return serverError(res); }
};

const create = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      full_name, email, password, phone, document_id,
      student_code, birth_date, address, guardian_name, guardian_phone,
    } = req.body;

    const missing = requireFields(req.body, ['full_name', 'email', 'password', 'student_code']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    if (!isEmail(email)) return badRequest(res, 'Email no valido');

    await conn.beginTransaction();

    const hash = await hashPassword(password);
    const [u] = await conn.query(
      `INSERT INTO users (role_id, full_name, email, password, phone, document_id)
       VALUES (4, ?, ?, ?, ?, ?)`,
      [full_name.trim(), email.trim(), hash, phone || null, document_id || null]
    );

    const [s] = await conn.query(
      `INSERT INTO students (user_id, student_code, birth_date, address, guardian_name, guardian_phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.insertId, student_code, birth_date || null, address || null, guardian_name || null, guardian_phone || null]
    );

    await conn.commit();
    return created(res, { id: s.insertId, user_id: u.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Email, documento o codigo ya existen');
    console.error(err);
    return serverError(res);
  } finally {
    conn.release();
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { full_name, email, phone, document_id, birth_date, address, guardian_name, guardian_phone, status } = req.body;

    const [rows] = await pool.query('SELECT user_id FROM students WHERE id = ?', [id]);
    if (rows.length === 0) return notFound(res, 'Estudiante no encontrado');
    const userId = rows[0].user_id;

    if (email && !isEmail(email)) return badRequest(res, 'Email no valido');

    await pool.query(
      `UPDATE users SET
         full_name = COALESCE(?, full_name),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone),
         document_id = COALESCE(?, document_id)
       WHERE id = ?`,
      [full_name || null, email || null, phone || null, document_id || null, userId]
    );

    await pool.query(
      `UPDATE students SET
         birth_date = COALESCE(?, birth_date),
         address = COALESCE(?, address),
         guardian_name = COALESCE(?, guardian_name),
         guardian_phone = COALESCE(?, guardian_phone),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [birth_date || null, address || null, guardian_name || null, guardian_phone || null, status || null, id]
    );
    return ok(res, {}, 'Estudiante actualizado');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Email o documento ya registrados');
    console.error(err);
    return serverError(res);
  }
};

const deactivate = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE students SET status = "inactivo" WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return notFound(res, 'Estudiante no encontrado');
    return ok(res, {}, 'Estudiante desactivado');
  } catch (err) { return serverError(res); }
};

const activate = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE students SET status = "activo" WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return notFound(res, 'Estudiante no encontrado');
    return ok(res, {}, 'Estudiante activado');
  } catch (err) { return serverError(res); }
};

module.exports = { list, getById, create, update, deactivate, activate };
