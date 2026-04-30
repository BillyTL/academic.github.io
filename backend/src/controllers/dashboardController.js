const pool = require('../config/db');
const { ok, serverError } = require('../utils/responseHandler');

const summary = async (req, res) => {
  try {
    const [[students]] = await pool.query(
      `SELECT COUNT(*) AS total FROM students WHERE status = 'activo'`
    );
    const [[teachers]] = await pool.query(
      `SELECT COUNT(*) AS total FROM teachers WHERE status = 'activo'`
    );
    const [[courses]] = await pool.query(
      `SELECT COUNT(*) AS total FROM courses WHERE status = 'activo'`
    );
    const [[subjects]] = await pool.query(
      `SELECT COUNT(*) AS total FROM subjects WHERE status = 'activo'`
    );
    const [[paymentsMonth]] = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM payments
       WHERE status = 'pagado'
         AND MONTH(payment_date) = MONTH(CURDATE())
         AND YEAR(payment_date) = YEAR(CURDATE())`
    );
    const [[unassigned]] = await pool.query(
      `SELECT COUNT(*) AS total FROM students s
       WHERE s.status = 'activo'
         AND NOT EXISTS (
           SELECT 1 FROM enrollments e WHERE e.student_id = s.id AND e.status = 'activo'
         )`
    );

    return ok(res, {
      students: students.total,
      teachers: teachers.total,
      courses: courses.total,
      subjects: subjects.total,
      payments_month: parseFloat(paymentsMonth.total),
      students_without_course: unassigned.total,
    });
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

module.exports = { summary };
