const pool = require('../config/db');
const { ok, notFound, serverError } = require('../utils/responseHandler');

const getStudentId = async (userId) => {
  const [rows] = await pool.query('SELECT id FROM students WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].id : null;
};

// Cursos en los que está inscrito el estudiante
const myCourses = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return notFound(res, 'Estudiante no encontrado');

    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.level, c.period, e.enrollment_date, e.status AS enrollment_status
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = ? AND e.status = 'activo' AND c.status = 'activo'
       ORDER BY c.name`,
      [studentId]
    );
    return ok(res, rows);
  } catch (err) { console.error(err); return serverError(res); }
};

// Materias de un curso específico (las que tienen docente asignado)
const mySubjects = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return notFound(res, 'Estudiante no encontrado');
    const courseId = req.params.courseId;

    // Verificar que el estudiante está inscrito en ese curso
    const [check] = await pool.query(
      `SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'activo'`,
      [studentId, courseId]
    );
    if (check.length === 0) return notFound(res, 'No estás inscrito en este curso');

    const [rows] = await pool.query(
      `SELECT DISTINCT sb.id, sb.name, sb.code, ut.full_name AS teacher_name
       FROM teacher_assignments ta
       JOIN subjects sb ON sb.id = ta.subject_id
       JOIN teachers t ON t.id = ta.teacher_id
       JOIN users ut ON ut.id = t.user_id
       WHERE ta.course_id = ? AND ta.status = 'activo' AND sb.status = 'activo'
       ORDER BY sb.name`,
      [courseId]
    );
    return ok(res, rows);
  } catch (err) { console.error(err); return serverError(res); }
};

// Notas del estudiante (opcionalmente filtradas por curso y materia)
const myGrades = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return notFound(res, 'Estudiante no encontrado');

    const { course_id, subject_id } = req.query;
    let where = "WHERE g.student_id = ? AND g.status = 'activo'";
    const params = [studentId];
    if (course_id) { where += ' AND g.course_id = ?'; params.push(course_id); }
    if (subject_id) { where += ' AND g.subject_id = ?'; params.push(subject_id); }

    const [rows] = await pool.query(
      `SELECT g.id, g.period, g.evaluation_type, g.grade_value, g.max_value, g.notes, g.created_at,
              c.name AS course_name, sb.name AS subject_name, ut.full_name AS teacher_name
       FROM grades g
       JOIN courses c ON c.id = g.course_id
       JOIN subjects sb ON sb.id = g.subject_id
       JOIN teachers t ON t.id = g.teacher_id
       JOIN users ut ON ut.id = t.user_id
       ${where}
       ORDER BY g.created_at DESC`,
      params
    );
    return ok(res, rows);
  } catch (err) { console.error(err); return serverError(res); }
};

// Asistencia del estudiante (opcionalmente filtrada por curso y materia)
const myAttendance = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return notFound(res, 'Estudiante no encontrado');

    const { course_id, subject_id } = req.query;
    let where = "WHERE a.student_id = ?";
    const params = [studentId];
    if (course_id) { where += ' AND a.course_id = ?'; params.push(course_id); }
    if (subject_id) { where += ' AND a.subject_id = ?'; params.push(subject_id); }

    const [rows] = await pool.query(
      `SELECT a.id, a.attendance_date, a.status, a.notes,
              c.name AS course_name, sb.name AS subject_name
       FROM attendance a
       JOIN courses c ON c.id = a.course_id
       JOIN subjects sb ON sb.id = a.subject_id
       ${where}
       ORDER BY a.attendance_date DESC`,
      params
    );
    return ok(res, rows);
  } catch (err) { console.error(err); return serverError(res); }
};

// Pagos del estudiante
const myPayments = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return notFound(res, 'Estudiante no encontrado');

    const [rows] = await pool.query(
      `SELECT p.id, p.amount, p.payment_method, p.reference, p.qr_code, p.concept,
              p.payment_date, p.status
       FROM payments p
       WHERE p.student_id = ?
       ORDER BY p.payment_date DESC`,
      [studentId]
    );
    return ok(res, rows);
  } catch (err) { console.error(err); return serverError(res); }
};

module.exports = { myCourses, mySubjects, myGrades, myAttendance, myPayments };
