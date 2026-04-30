const pool = require('../config/db');
const { ok, created, badRequest, notFound, serverError } = require('../utils/responseHandler');
const { requireFields } = require('../utils/validators');

const DAYS = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

const list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.day_of_week, s.start_time, s.end_time, s.classroom, s.status,
              c.id AS course_id, c.name AS course_name,
              sb.id AS subject_id, sb.name AS subject_name,
              t.id AS teacher_id, ut.full_name AS teacher_name
       FROM schedules s
       JOIN courses c ON c.id = s.course_id
       JOIN subjects sb ON sb.id = s.subject_id
       JOIN teachers t ON t.id = s.teacher_id
       JOIN users ut ON ut.id = t.user_id
       ORDER BY FIELD(s.day_of_week,'Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'), s.start_time`
    );
    return ok(res, rows);
  } catch (err) { console.error(err); return serverError(res); }
};

const create = async (req, res) => {
  try {
    const { course_id, subject_id, teacher_id, day_of_week, start_time, end_time, classroom } = req.body;
    const missing = requireFields(req.body, ['course_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time']);
    if (missing.length) return badRequest(res, `Campos faltantes: ${missing.join(', ')}`);
    if (!DAYS.includes(day_of_week)) return badRequest(res, 'Dia no valido');
    if (start_time >= end_time) return badRequest(res, 'La hora de inicio debe ser menor a la hora de fin');

    // Verificar conflicto de horario en el mismo curso
    const [conflict] = await pool.query(
      `SELECT id FROM schedules
       WHERE course_id = ? AND day_of_week = ? AND status = 'activo'
         AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))`,
      [course_id, day_of_week, end_time, start_time, end_time, start_time, start_time, end_time]
    );
    if (conflict.length > 0) return badRequest(res, 'Ya existe un horario en ese curso que se cruza con las horas indicadas');

    // Verificar conflicto del docente
    const [teacherConflict] = await pool.query(
      `SELECT id FROM schedules
       WHERE teacher_id = ? AND day_of_week = ? AND status = 'activo'
         AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))`,
      [teacher_id, day_of_week, end_time, start_time, end_time, start_time, start_time, end_time]
    );
    if (teacherConflict.length > 0) return badRequest(res, 'El docente ya tiene una clase asignada en ese horario');

    const [r] = await pool.query(
      `INSERT INTO schedules (course_id, subject_id, teacher_id, day_of_week, start_time, end_time, classroom)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course_id, subject_id, teacher_id, day_of_week, start_time, end_time, classroom || null]
    );
    return created(res, { id: r.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Ya existe un horario para ese curso en ese dia y hora');
    console.error(err);
    return serverError(res);
  }
};

const update = async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, classroom, status, subject_id, teacher_id } = req.body;
    const [exists] = await pool.query('SELECT id FROM schedules WHERE id = ?', [req.params.id]);
    if (exists.length === 0) return notFound(res, 'Horario no encontrado');

    await pool.query(
      `UPDATE schedules SET
         day_of_week = COALESCE(?, day_of_week),
         start_time = COALESCE(?, start_time),
         end_time = COALESCE(?, end_time),
         classroom = COALESCE(?, classroom),
         subject_id = COALESCE(?, subject_id),
         teacher_id = COALESCE(?, teacher_id),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [day_of_week||null, start_time||null, end_time||null, classroom||null, subject_id||null, teacher_id||null, status||null, req.params.id]
    );
    return ok(res, {}, 'Horario actualizado');
  } catch (err) { return serverError(res); }
};

const deactivate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE schedules SET status = "inactivo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Horario no encontrado');
    return ok(res, {}, 'Horario desactivado');
  } catch (err) { return serverError(res); }
};

const activate = async (req, res) => {
  try {
    const [r] = await pool.query('UPDATE schedules SET status = "activo" WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return notFound(res, 'Horario no encontrado');
    return ok(res, {}, 'Horario activado');
  } catch (err) { return serverError(res); }
};

// Horario del docente logueado
const mySchedule = async (req, res) => {
  try {
    const [tRow] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
    if (tRow.length === 0) return notFound(res, 'Docente no encontrado');

    const [rows] = await pool.query(
      `SELECT s.id, s.day_of_week, s.start_time, s.end_time, s.classroom,
              c.name AS course_name, sb.name AS subject_name
       FROM schedules s
       JOIN courses c ON c.id = s.course_id
       JOIN subjects sb ON sb.id = s.subject_id
       WHERE s.teacher_id = ? AND s.status = 'activo'
       ORDER BY FIELD(s.day_of_week,'Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'), s.start_time`,
      [tRow[0].id]
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

// Horario del estudiante logueado (por sus cursos inscritos)
const studentSchedule = async (req, res) => {
  try {
    const [sRow] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (sRow.length === 0) return notFound(res, 'Estudiante no encontrado');

    const [rows] = await pool.query(
      `SELECT s.id, s.day_of_week, s.start_time, s.end_time, s.classroom,
              c.name AS course_name, sb.name AS subject_name, ut.full_name AS teacher_name
       FROM schedules s
       JOIN courses c ON c.id = s.course_id
       JOIN subjects sb ON sb.id = s.subject_id
       JOIN teachers t ON t.id = s.teacher_id
       JOIN users ut ON ut.id = t.user_id
       JOIN enrollments e ON e.course_id = s.course_id
       WHERE e.student_id = ? AND e.status = 'activo' AND s.status = 'activo'
       ORDER BY FIELD(s.day_of_week,'Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'), s.start_time`,
      [sRow[0].id]
    );
    return ok(res, rows);
  } catch (err) { return serverError(res); }
};

module.exports = { list, create, update, deactivate, activate, mySchedule, studentSchedule };
