const pool = require('../config/db');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { requireFields } = require('../utils/validators');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM enrollments e
          WHERE e.course_id = c.id AND e.status = 'activo') AS students_count
       FROM courses c
       ORDER BY c.id DESC`
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return notFound(res, 'Curso no encontrado');
    return ok(res, rows[0]);
  } catch (err) { return serverError(res); }
};

const create = async (req, res) => {
  try {
    const { name, level, period } = req.body;
    const missing = requireFields(req.body, ['name', 'period']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);

    const [r] = await pool.query(
      `INSERT INTO courses (name, level, period) VALUES (?, ?, ?)`,
      [name.trim(), level || null, period.trim()]
    );
    return created(res, { id: r.insertId });
  } catch (err) { return serverError(res); }
};

const update = async (req, res) => {
  try {
    const { name, level, period, status } = req.body;
    const [exists] = await pool.query('SELECT id FROM courses WHERE id = ?', [req.params.id]);
    if (exists.length === 0) return notFound(res, 'Curso no encontrado');

    await pool.query(
      `UPDATE courses SET
         name = COALESCE(?, name),
         level = COALESCE(?, level),
         period = COALESCE(?, period),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [name || null, level || null, period || null, status || null, req.params.id]
    );
    return ok(res, {}, 'Curso actualizado');
  } catch (err) { return serverError(res); }
};

const deactivate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE courses SET status = "inactivo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Curso no encontrado');
    return ok(res, {}, 'Curso desactivado');
  } catch (err) { return serverError(res); }
};

const activate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE courses SET status = "activo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Curso no encontrado');
    return ok(res, {}, 'Curso activado');
  } catch (err) { return serverError(res); }
};

const studentsByCourse = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_code, u.full_name, u.email, e.status AS enrollment_status
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       WHERE e.course_id = ? AND e.status = 'activo'
       ORDER BY u.full_name`,
      [req.params.id]
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

module.exports = { list, getById, create, update, deactivate, activate, studentsByCourse };
