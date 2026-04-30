const pool = require('../config/db');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { requireFields, isInRange } = require('../utils/validators');

const getTeacherId = async (userId) => {
  const [rows] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].id : null;
};

const list = async (req, res) => {
  try {
    const { course_id, subject_id, period } = req.query;
    let where = "WHERE g.status = 'activo'";
    const params = [];
    if (course_id)  { where += ' AND g.course_id = ?';  params.push(course_id); }
    if (subject_id) { where += ' AND g.subject_id = ?'; params.push(subject_id); }
    if (period)     { where += ' AND g.period = ?';     params.push(period); }

    const [rows] = await pool.query(
      `SELECT g.*, u.full_name AS student_name, s.student_code,
              c.name AS course_name, sb.name AS subject_name
       FROM grades g
       JOIN students s ON s.id = g.student_id
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = g.course_id
       JOIN subjects sb ON sb.id = g.subject_id
       ${where}
       ORDER BY g.created_at DESC`,
      params
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const register = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { course_id, subject_id, period, evaluation_type, max_value, records } = req.body;
    const missing = requireFields(req.body, ['course_id', 'subject_id', 'period', 'evaluation_type']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    if (!Array.isArray(records) || records.length === 0)
      return badRequest(res, 'Debes enviar al menos un registro');

    const max = max_value ? parseFloat(max_value) : 100;
    if (max <= 0) return badRequest(res, 'max_value debe ser mayor que cero');

    const teacherId = await getTeacherId(req.user.id);
    if (!teacherId) return badRequest(res, 'No estas registrado como docente');

    const [check] = await conn.query(
      `SELECT 1 FROM teacher_assignments
       WHERE teacher_id = ? AND course_id = ? AND subject_id = ? AND status = 'activo'`,
      [teacherId, course_id, subject_id]
    );
    if (check.length === 0) return badRequest(res, 'No tienes esta materia asignada');

    await conn.beginTransaction();
    for (const r of records) {
      if (!isInRange(r.grade_value, 0, max)) {
        await conn.rollback();
        return badRequest(res, `Nota fuera de rango (0-${max}) para estudiante ${r.student_id}`);
      }
      await conn.query(
        `INSERT INTO grades
           (student_id, course_id, subject_id, teacher_id, period, evaluation_type, grade_value, max_value, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.student_id, course_id, subject_id, teacherId, period, evaluation_type, r.grade_value, max, r.notes || null]
      );
    }
    await conn.commit();
    return created(res, {}, 'Notas registradas');
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return serverError(res);
  } finally { conn.release(); }
};

const update = async (req, res) => {
  try {
    const { grade_value, evaluation_type, period, notes, status } = req.body;
    const [rows] = await pool.query('SELECT max_value FROM grades WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return notFound(res, 'Nota no encontrada');
    const max = rows[0].max_value;

    if (grade_value !== undefined && !isInRange(grade_value, 0, max))
      return badRequest(res, `Nota fuera de rango (0-${max})`);

    await pool.query(
      `UPDATE grades SET
         grade_value = COALESCE(?, grade_value),
         evaluation_type = COALESCE(?, evaluation_type),
         period = COALESCE(?, period),
         notes = COALESCE(?, notes),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [grade_value ?? null, evaluation_type || null, period || null, notes || null, status || null, req.params.id]
    );
    return ok(res, {}, 'Nota actualizada');
  } catch (err) { return serverError(res); }
};

module.exports = { list, register, update };
