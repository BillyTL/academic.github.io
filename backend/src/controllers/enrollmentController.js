const pool = require('../config/db');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { requireFields, isValidDate } = require('../utils/validators');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.enrollment_date, e.status,
              s.id AS student_id, s.student_code, u.full_name AS student_name,
              c.id AS course_id, c.name AS course_name, c.period
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = e.course_id
       ORDER BY e.id DESC`
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const create = async (req, res) => {
  try {
    const { student_id, course_id, enrollment_date } = req.body;
    const missing = requireFields(req.body, ['student_id', 'course_id', 'enrollment_date']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    if (!isValidDate(enrollment_date)) return badRequest(res, 'Fecha no valida');

    const [r] = await pool.query(
      `INSERT INTO enrollments (student_id, course_id, enrollment_date, registered_by)
       VALUES (?, ?, ?, ?)`,
      [student_id, course_id, enrollment_date, req.user.id]
    );
    return created(res, { id: r.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'El estudiante ya esta inscrito en ese curso');
    return serverError(res);
  }
};

const update = async (req, res) => {
  try {
    const { course_id, enrollment_date, status } = req.body;
    const [exists] = await pool.query('SELECT id FROM enrollments WHERE id = ?', [req.params.id]);
    if (exists.length === 0) return notFound(res, 'Inscripcion no encontrada');

    await pool.query(
      `UPDATE enrollments SET
         course_id = COALESCE(?, course_id),
         enrollment_date = COALESCE(?, enrollment_date),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [course_id || null, enrollment_date || null, status || null, req.params.id]
    );
    return ok(res, {}, 'Inscripcion actualizada');
  } catch (err) { return serverError(res); }
};

const deactivate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE enrollments SET status = "inactivo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Inscripcion no encontrada');
    return ok(res, {}, 'Inscripcion desactivada');
  } catch (err) { return serverError(res); }
};

module.exports = { list, create, update, deactivate };
