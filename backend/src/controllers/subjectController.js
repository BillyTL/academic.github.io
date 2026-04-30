const pool = require('../config/db');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { requireFields } = require('../utils/validators');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects ORDER BY id DESC');
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return notFound(res, 'Materia no encontrada');
    return ok(res, rows[0]);
  } catch (err) { return serverError(res); }
};

const create = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const missing = requireFields(req.body, ['name']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    const [r] = await pool.query(
      `INSERT INTO subjects (name, code, description) VALUES (?, ?, ?)`,
      [name.trim(), code || null, description || null]
    );
    return created(res, { id: r.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Codigo ya registrado');
    return serverError(res);
  }
};

const update = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    const [exists] = await pool.query('SELECT id FROM subjects WHERE id = ?', [req.params.id]);
    if (exists.length === 0) return notFound(res, 'Materia no encontrada');
    await pool.query(
      `UPDATE subjects SET
         name = COALESCE(?, name),
         code = COALESCE(?, code),
         description = COALESCE(?, description),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [name || null, code || null, description || null, status || null, req.params.id]
    );
    return ok(res, {}, 'Materia actualizada');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Codigo ya registrado');
    return serverError(res);
  }
};

const deactivate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE subjects SET status = "inactivo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Materia no encontrada');
    return ok(res, {}, 'Materia desactivada');
  } catch (err) { return serverError(res); }
};

const activate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE subjects SET status = "activo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Materia no encontrada');
    return ok(res, {}, 'Materia activada');
  } catch (err) { return serverError(res); }
};

module.exports = { list, getById, create, update, deactivate, activate };
