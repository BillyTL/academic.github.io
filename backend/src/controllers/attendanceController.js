const pool = require('../config/db');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { requireFields, isValidDate } = require('../utils/validators');

const ALLOWED = ['presente', 'ausente', 'justificado'];

const getTeacherId = async (userId) => {
  const [rows] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].id : null;
};

const list = async (req, res) => {
  try {
    const { course_id, subject_id, date } = req.query;
    let where = "WHERE 1=1";
    const params = [];
    if (course_id)  { where += ' AND a.course_id = ?';  params.push(course_id); }
    if (subject_id) { where += ' AND a.subject_id = ?'; params.push(subject_id); }
    if (date)       { where += ' AND a.attendance_date = ?'; params.push(date); }

    const [rows] = await pool.query(
      `SELECT a.*, u.full_name AS student_name, s.student_code,
              c.name AS course_name, sb.name AS subject_name
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = a.course_id
       JOIN subjects sb ON sb.id = a.subject_id
       ${where}
       ORDER BY a.attendance_date DESC, u.full_name`,
      params
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

const register = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { course_id, subject_id, attendance_date, records } = req.body;
    const missing = requireFields(req.body, ['course_id', 'subject_id', 'attendance_date']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    if (!isValidDate(attendance_date)) return badRequest(res, 'Fecha no valida');
    if (!Array.isArray(records) || records.length === 0)
      return badRequest(res, 'Debes enviar al menos un registro');

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
      if (!ALLOWED.includes(r.status)) {
        await conn.rollback();
        return badRequest(res, `Estado invalido: ${r.status}`);
      }
      await conn.query(
        `INSERT INTO attendance (student_id, course_id, subject_id, teacher_id, attendance_date, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes), teacher_id = VALUES(teacher_id)`,
        [r.student_id, course_id, subject_id, teacherId, attendance_date, r.status, r.notes || null]
      );
    }
    await conn.commit();
    return created(res, {}, 'Asistencia registrada');
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return serverError(res);
  } finally { conn.release(); }
};

const update = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (status && !ALLOWED.includes(status)) return badRequest(res, 'Estado invalido');

    const [exists] = await pool.query('SELECT id FROM attendance WHERE id = ?', [req.params.id]);
    if (exists.length === 0) return notFound(res, 'Registro no encontrado');

    await pool.query(
      `UPDATE attendance SET
         status = COALESCE(?, status),
         notes = COALESCE(?, notes)
       WHERE id = ?`,
      [status || null, notes || null, req.params.id]
    );
    return ok(res, {}, 'Asistencia actualizada');
  } catch (err) { return serverError(res); }
};

module.exports = { list, register, update };
