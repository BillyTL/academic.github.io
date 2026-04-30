const pool = require('../config/db');
const { hashPassword } = require('../services/authService');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { isEmail, isNonEmpty, requireFields } = require('../utils/validators');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.document_id, u.status, r.name AS role, u.created_at
       FROM users u JOIN roles r ON r.id = u.role_id
       ORDER BY u.id DESC`
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.role_id, u.full_name, u.email, u.phone, u.document_id, u.status, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return notFound(res, 'Usuario no encontrado');
    return ok(res, rows[0]);
  } catch (err) { return serverError(res); }
};

const create = async (req, res) => {
  try {
    const { role_id, full_name, email, password, phone, document_id } = req.body;
    const missing = requireFields(req.body, ['role_id', 'full_name', 'email', 'password']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    if (!isEmail(email)) return badRequest(res, 'Email no valido');
    if (!isNonEmpty(password) || password.length < 6)
      return badRequest(res, 'La contrasena debe tener al menos 6 caracteres');

    const hash = await hashPassword(password);
    const [result] = await pool.query(
      `INSERT INTO users (role_id, full_name, email, password, phone, document_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [role_id, full_name.trim(), email.trim(), hash, phone || null, document_id || null]
    );
    return created(res, { id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Email o documento ya registrados');
    console.error(err);
    return serverError(res);
  }
};

const update = async (req, res) => {
  try {
    const { full_name, email, phone, document_id, role_id, status } = req.body;
    const id = req.params.id;
    const [exists] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (exists.length === 0) return notFound(res, 'Usuario no encontrado');

    if (email && !isEmail(email)) return badRequest(res, 'Email no valido');

    await pool.query(
      `UPDATE users SET
         full_name = COALESCE(?, full_name),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone),
         document_id = COALESCE(?, document_id),
         role_id = COALESCE(?, role_id),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [full_name || null, email || null, phone || null, document_id || null, role_id || null, status || null, id]
    );
    return ok(res, {}, 'Usuario actualizado');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Email o documento ya registrados');
    return serverError(res);
  }
};

const deactivate = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE users SET status = "inactivo" WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return notFound(res, 'Usuario no encontrado');
    return ok(res, {}, 'Usuario desactivado');
  } catch (err) { return serverError(res); }
};

const activate = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE users SET status = "activo" WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return notFound(res, 'Usuario no encontrado');
    return ok(res, {}, 'Usuario activado');
  } catch (err) { return serverError(res); }
};

const listRoles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description FROM roles ORDER BY id');
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

module.exports = { list, getById, create, update, deactivate, activate, listRoles };
