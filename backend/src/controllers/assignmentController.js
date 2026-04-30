const pool = require('../config/db');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { requireFields } = require('../utils/validators');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ta.id, ta.status,
              t.id AS teacher_id, ut.full_name AS teacher_name, t.teacher_code,
              c.id AS course_id, c.name AS course_name,
              sb.id AS subject_id, sb.name AS subject_name
       FROM teacher_assignments ta
       JOIN teachers t ON t.id = ta.teacher_id
       JOIN users ut ON ut.id = t.user_id
       JOIN courses c ON c.id = ta.course_id
       JOIN subjects sb ON sb.id = ta.subject_id
       ORDER BY ta.id DESC`
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const create = async (req, res) => {
  try {
    const { teacher_id, course_id, subject_id } = req.body;
    const missing = requireFields(req.body, ['teacher_id', 'course_id', 'subject_id']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);

    const [r] = await pool.query(
      `INSERT INTO teacher_assignments (teacher_id, course_id, subject_id) VALUES (?, ?, ?)`,
      [teacher_id, course_id, subject_id]
    );
    return created(res, { id: r.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Asignacion ya existe');
    return serverError(res);
  }
};

const update = async (req, res) => {
  try {
    const { teacher_id, course_id, subject_id, status } = req.body;
    const [exists] = await pool.query('SELECT id FROM teacher_assignments WHERE id = ?', [req.params.id]);
    if (exists.length === 0) return notFound(res, 'Asignacion no encontrada');

    await pool.query(
      `UPDATE teacher_assignments SET
         teacher_id = COALESCE(?, teacher_id),
         course_id = COALESCE(?, course_id),
         subject_id = COALESCE(?, subject_id),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [teacher_id || null, course_id || null, subject_id || null, status || null, req.params.id]
    );
    return ok(res, {}, 'Asignacion actualizada');
  } catch (err) { return serverError(res); }
};

const deactivate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE teacher_assignments SET status = "inactivo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Asignacion no encontrada');
    return ok(res, {}, 'Asignacion desactivada');
  } catch (err) { return serverError(res); }
};

const activate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE teacher_assignments SET status = "activo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Asignacion no encontrada');
    return ok(res, {}, 'Asignacion activada');
  } catch (err) { return serverError(res); }
};

const myCourses = async (req, res) => {
  try {
    const [tRow] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
    if (tRow.length === 0) return notFound(res, 'Docente no encontrado');
    const teacherId = tRow[0].id;

    const [rows] = await pool.query(
      `SELECT DISTINCT c.id, c.name, c.level, c.period
       FROM teacher_assignments ta
       JOIN courses c ON c.id = ta.course_id
       WHERE ta.teacher_id = ? AND ta.status = 'activo' AND c.status = 'activo'
       ORDER BY c.name`,
      [teacherId]
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const mySubjects = async (req, res) => {
  try {
    const [tRow] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
    if (tRow.length === 0) return notFound(res, 'Docente no encontrado');
    const teacherId = tRow[0].id;
    const courseId = req.params.courseId;

    const [rows] = await pool.query(
      `SELECT sb.id, sb.name, sb.code
       FROM teacher_assignments ta
       JOIN subjects sb ON sb.id = ta.subject_id
       WHERE ta.teacher_id = ? AND ta.course_id = ? AND ta.status = 'activo'
       ORDER BY sb.name`,
      [teacherId, courseId]
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const myStudents = async (req, res) => {
  try {
    const [tRow] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
    if (tRow.length === 0) return notFound(res, 'Docente no encontrado');
    const teacherId = tRow[0].id;
    const { courseId, subjectId } = req.params;

    const [check] = await pool.query(
      `SELECT 1 FROM teacher_assignments
       WHERE teacher_id = ? AND course_id = ? AND subject_id = ? AND status = 'activo'`,
      [teacherId, courseId, subjectId]
    );
    if (check.length === 0) return badRequest(res, 'No tienes asignada esta materia en este curso');

    const [rows] = await pool.query(
      `SELECT s.id, s.student_code, u.full_name, u.email
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       WHERE e.course_id = ? AND e.status = 'activo' AND s.status = 'activo'
       ORDER BY u.full_name`,
      [courseId]
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

module.exports = { list, create, update, deactivate, activate, myCourses, mySubjects, myStudents };
