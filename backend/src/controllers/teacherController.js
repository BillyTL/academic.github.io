const pool = require('../config/db');
const { hashPassword } = require('../services/authService');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { isEmail, requireFields } = require('../utils/validators');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.teacher_code, t.specialty, t.hire_date, t.status,
              u.full_name, u.email, u.phone, u.document_id, u.id AS user_id
       FROM teachers t JOIN users u ON u.id = t.user_id
       ORDER BY t.id DESC`
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.full_name, u.email, u.phone, u.document_id
       FROM teachers t JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return notFound(res, 'Docente no encontrado');
    return ok(res, rows[0]);
  } catch (err) { return serverError(res); }
};

const create = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { full_name, email, password, phone, document_id, teacher_code, specialty, hire_date } = req.body;
    const missing = requireFields(req.body, ['full_name', 'email', 'password', 'teacher_code']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    if (!isEmail(email)) return badRequest(res, 'Email no valido');

    await conn.beginTransaction();
    const hash = await hashPassword(password);

    const [u] = await conn.query(
      `INSERT INTO users (role_id, full_name, email, password, phone, document_id)
       VALUES (3, ?, ?, ?, ?, ?)`,
      [full_name.trim(), email.trim(), hash, phone || null, document_id || null]
    );

    const [t] = await conn.query(
      `INSERT INTO teachers (user_id, teacher_code, specialty, hire_date)
       VALUES (?, ?, ?, ?)`,
      [u.insertId, teacher_code, specialty || null, hire_date || null]
    );

    await conn.commit();
    return created(res, { id: t.insertId, user_id: u.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Email, documento o codigo ya registrados');
    console.error(err);
    return serverError(res);
  } finally { conn.release(); }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { full_name, email, phone, document_id, specialty, hire_date, status } = req.body;
    const [rows] = await pool.query('SELECT user_id FROM teachers WHERE id = ?', [id]);
    if (rows.length === 0) return notFound(res, 'Docente no encontrado');
    const userId = rows[0].user_id;

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
      `UPDATE teachers SET
         specialty = COALESCE(?, specialty),
         hire_date = COALESCE(?, hire_date),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [specialty || null, hire_date || null, status || null, id]
    );
    return ok(res, {}, 'Docente actualizado');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Email o documento ya registrados');
    return serverError(res);
  }
};

const deactivate = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE teachers SET status = "inactivo" WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return notFound(res, 'Docente no encontrado');
    return ok(res, {}, 'Docente desactivado');
  } catch (err) { return serverError(res); }
};

const activate = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE teachers SET status = "activo" WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return notFound(res, 'Docente no encontrado');
    return ok(res, {}, 'Docente activado');
  } catch (err) { return serverError(res); }
};

module.exports = { list, getById, create, update, deactivate, activate };
